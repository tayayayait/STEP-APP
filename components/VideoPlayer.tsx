import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, RotateCcw, Play } from 'lucide-react';
import { VideoMeta } from '../types';
import { Button } from './Button';

interface VideoPlayerProps {
  video: VideoMeta | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [video?.id]);

  const handleRetry = () => {
    setErrorMessage(null);
    const player = playerRef.current;
    if (player) {
      player.load();
      const playPromise = player.play();
      if (playPromise) {
        playPromise.catch(() => {
          setErrorMessage('네트워크 상태가 불안정하여 영상을 불러오지 못했어요.');
        });
      }
    }
  };

  const handleError = () => {
    setErrorMessage('네트워크 상태가 불안정하여 영상을 불러오지 못했어요.');
  };

  const handleOpenInBrowser = () => {
    if (video) {
      window.open(video.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!video) {
    return (
      <div className="text-center text-gray-500 bg-gray-50 border border-gray-100 p-6 rounded-2xl font-bold">
        보고 싶은 영상을 왼쪽에서 선택해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden bg-black/80 relative">
        {errorMessage ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white gap-4">
            <WifiOff size={36} className="text-red-200" />
            <p className="text-2xl font-black">재생에 문제가 생겼어요</p>
            <p className="text-lg text-blue-100 font-semibold">
              인터넷 연결을 확인한 뒤 아래 큰 버튼을 눌러 다시 시도해주세요.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleRetry}
                fullWidth
                className="text-xl py-5 rounded-3xl"
                icon={<RotateCcw size={24} />}
              >
                다시 시도하기
              </Button>
              <Button
                variant="secondary"
                onClick={handleOpenInBrowser}
                fullWidth
                className="text-xl py-5 rounded-3xl"
                icon={<Play size={24} />}
              >
                브라우저에서 보기
              </Button>
            </div>
          </div>
        ) : (
          <video
            key={video.id}
            ref={playerRef}
            controls
            playsInline
            className="w-full aspect-video bg-black"
            onError={handleError}
          >
            <track kind="captions" label="Korean" />
          </video>
        )}
      </div>

      <div className="bg-blue-50 text-blue-900 rounded-xl p-4 border border-blue-100 space-y-2">
        <p className="text-lg font-black">{video.title}</p>
        {video.description && <p className="text-base leading-relaxed">{video.description}</p>}
        <p className="text-sm font-bold">영상이 보이지 않으면 큰 버튼을 눌러 재생을 시작하세요.</p>
      </div>
    </div>
  );
};
