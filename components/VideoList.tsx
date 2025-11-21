import React, { useEffect, useMemo, useState } from 'react';
import { PlayCircle, AlertCircle, Loader2 } from 'lucide-react';
import { VideoMeta } from '../types';
import { listVideos } from '../services/videoService';

interface VideoListProps {
  onSelect: (video: VideoMeta) => void;
  activeVideoId?: string;
}

type VideoGroups = Record<string, VideoMeta[]>;

export const VideoList: React.FC<VideoListProps> = ({ onSelect, activeVideoId }) => {
  const [videos, setVideos] = useState<VideoMeta[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      try {
        const items = await listVideos();
        setVideos(items);
        if (!activeVideoId && items.length > 0) {
          onSelect(items[0]);
        }
      } catch (e) {
        setError('영상 목록을 불러오지 못했어요. 네트워크를 확인한 뒤 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, [activeVideoId, onSelect]);

  const groupedVideos = useMemo<VideoGroups>(
    () =>
      videos.reduce((groups, video) => {
        if (!groups[video.category]) {
          groups[video.category] = [];
        }
        groups[video.category].push(video);
        return groups;
      }, {} as VideoGroups),
    [videos],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-gray-500 font-bold text-lg">
        <Loader2 className="animate-spin" />
        영상을 준비하고 있어요...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 text-red-600 bg-red-50 border border-red-100 p-4 rounded-2xl">
        <AlertCircle />
        <div>
          <p className="font-bold text-lg">목록을 불러오지 못했어요</p>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedVideos).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-rehab-blue bg-blue-50 px-3 py-1 rounded-full">{category}</span>
            <span className="text-xs text-gray-500">{items.length}개</span>
          </div>
          <div className="space-y-3">
            {items.map((video) => {
              const isActive = activeVideoId === video.id;
              return (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => onSelect(video)}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-2xl transition-all text-left ${
                    isActive
                      ? 'border-rehab-blue bg-blue-50 shadow-sm'
                      : 'border-gray-100 hover:border-rehab-blue/40 hover:bg-blue-50/50'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl text-white ${
                      isActive ? 'bg-rehab-blue shadow-md shadow-blue-200' : 'bg-gray-400'
                    }`}
                  >
                    <PlayCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-gray-900 leading-tight">{video.title}</p>
                    {video.description && <p className="text-sm text-gray-500 mt-1">{video.description}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
