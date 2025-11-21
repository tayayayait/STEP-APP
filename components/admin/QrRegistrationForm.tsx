import React, { useEffect, useMemo, useRef, useState } from 'react';
import { buildQrRegistrationPayload, parseQrRegistrationPayload, registerUserFromQr } from '../../services/adminService';
import { getAdminState } from '../../services/adminStore';
import { AdminUserRow, QrRegistrationPayload } from '../../types';
import { QrCode, ScanLine } from 'lucide-react';

type BarcodeDetectorCtor = new (options: { formats: string[] }) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

interface QrRegistrationFormProps {
  onRegistered: (user: AdminUserRow) => void;
}

const QrRegistrationForm: React.FC<QrRegistrationFormProps> = ({ onRegistered }) => {
  const [payload, setPayload] = useState<QrRegistrationPayload>({ name: '', phoneNumber: '' });
  const [scanMessage, setScanMessage] = useState('병원 현장에서 QR을 스캔해 간편 등록하세요.');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scannerReady, setScannerReady] = useState(false);
  const [manualScanInput, setManualScanInput] = useState('');

  const encodedPayload = useMemo(() => buildQrRegistrationPayload(payload), [payload]);
  const qrImageUrl = useMemo(
    () => `https://quickchart.io/qr?text=${encodeURIComponent(encodedPayload)}&size=220&margin=2`,
    [encodedPayload],
  );

  const handleScan = async (value: string | null) => {
    if (!value) return;
    setLoading(true);
    setError('');

    try {
      const parsed = parseQrRegistrationPayload(value);
      const { tokens } = getAdminState();
      const user = await registerUserFromQr(parsed, tokens);
      onRegistered(user);
      setScanMessage(`${parsed.phoneNumber} 등록 완료`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'QR 등록에 실패했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const BarcodeDetectorCtor = (window as typeof window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      setError('브라우저에서 QR 스캔을 지원하지 않습니다. 카메라가 있는 장치로 접속해주세요.');
      return undefined;
    }

    let animationId: number | null = null;
    let stream: MediaStream | null = null;
    const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });

    const scanFrame = async () => {
      if (!videoRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) {
        animationId = requestAnimationFrame(scanFrame);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const source = canvas as unknown as CanvasImageSource;
        const codes = await detector.detect(source);
        if (codes.length > 0) {
          const code = codes[0];
          const rawValue = (code as unknown as { rawValue?: string }).rawValue ?? '';
          if (rawValue) {
            await handleScan(rawValue);
          }
        }
      } catch (scanError) {
        console.warn('QR 스캔 실패', scanError);
      }
      animationId = requestAnimationFrame(scanFrame);
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setScannerReady(true);
          animationId = requestAnimationFrame(scanFrame);
        }
      } catch (streamError) {
        setError('카메라 접근이 차단되었습니다. 권한을 확인해주세요.');
      }
    };

    start();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-3 text-emerald-700">
        <QrCode />
        <div>
          <p className="text-xs font-semibold text-slate-500">QR 발급/스캔</p>
          <h3 className="text-lg font-black text-slate-900">현장용 간편 등록</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">등록용 이름</label>
            <input
              type="text"
              value={payload.name}
              onChange={(e) => setPayload((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="예: 이회복"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">전화번호</label>
            <input
              type="tel"
              value={payload.phoneNumber}
              onChange={(e) => setPayload((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              placeholder="010-0000-0000"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">QR 코드</label>
            <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center gap-3 bg-slate-50">
              <img src={qrImageUrl} alt="QR 코드" className="w-44 h-44 object-contain" />
              <p className="text-xs text-slate-500">환자에게 보여주거나 출력해 사용하세요.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ScanLine />
            <p className="text-sm font-semibold text-slate-700">QR 스캔</p>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 relative">
            <video ref={videoRef} className="w-full h-60 object-cover" muted playsInline />
            {!scannerReady && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm bg-white/80">
                카메라 초기화 중...
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500">{scanMessage}</p>
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          {loading && <p className="text-sm text-emerald-700 font-semibold">등록 처리 중...</p>}
          <p className="text-xs text-slate-400">스캔이 어려울 경우 QR 데이터를 수동으로 입력할 수 있습니다.</p>
          <textarea
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            placeholder="QR 데이터를 붙여넣기"
            rows={2}
            value={manualScanInput}
            onChange={(e) => {
              setManualScanInput(e.target.value);
              handleScan(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default QrRegistrationForm;
