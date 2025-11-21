import React, { useState } from 'react';
import { AdminRegistrationPayload, AdminUserRow } from '../../types';
import { registerUserForAdmin } from '../../services/adminService';
import { getAdminState } from '../../services/adminStore';
import { ClipboardPenLine } from 'lucide-react';

interface ManualRegistrationFormProps {
  onRegistered: (user: AdminUserRow) => void;
}

const ManualRegistrationForm: React.FC<ManualRegistrationFormProps> = ({ onRegistered }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialSteps, setInitialSteps] = useState(0);
  const [initialPoints, setInitialPoints] = useState(50);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const payload: AdminRegistrationPayload = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      initialSteps,
      initialPoints,
      registrationMethod: 'phone',
    };

    try {
      const { tokens } = getAdminState();
      const newUser = await registerUserForAdmin(payload, tokens);
      onRegistered(newUser);
      setName('');
      setPhoneNumber('');
      setInitialSteps(0);
      setInitialPoints(50);
    } catch (e) {
      const message = e instanceof Error ? e.message : '수동 등록에 실패했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-5 space-y-4">
      <div className="flex items-center gap-3 text-indigo-700">
        <ClipboardPenLine />
        <div>
          <p className="text-xs font-semibold text-slate-500">전화/오프라인 등록</p>
          <h3 className="text-lg font-black text-slate-900">병원 창구 수기 등록</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            placeholder="예: 김재활"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">전화번호</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            placeholder="010-0000-0000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">초기 걸음수</label>
          <input
            type="number"
            min={0}
            value={initialSteps}
            onChange={(e) => setInitialSteps(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">시작 포인트</label>
          <input
            type="number"
            min={0}
            value={initialPoints}
            onChange={(e) => setInitialPoints(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        {error && <p className="md:col-span-2 text-sm text-red-600 font-semibold">{error}</p>}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60"
          >
            {loading ? '등록 중...' : '수동 등록 완료'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManualRegistrationForm;
