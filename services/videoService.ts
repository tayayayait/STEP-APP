import { VideoCategory, VideoMeta } from '../types';

const videoLibrary: VideoMeta[] = [
  {
    id: 'warmup-ankle',
    title: '발목 유연성 워밍업',
    category: '초기 재활',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    description: '침대에서 바로 따라 할 수 있는 3분 발목 풀기 루틴',
  },
  {
    id: 'stretch-quad',
    title: '허벅지 스트레칭',
    category: '스트레칭',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    description: '무릎 주변 긴장을 풀어주는 기본 스트레칭',
  },
  {
    id: 'breath-reset',
    title: '호흡 가다듬기',
    category: '호흡/안정',
    url: 'https://cdn.coverr.co/videos/coverr-morning-stretch-1280.mp4',
    description: '재활 시작 전 호흡을 정돈하는 2분 영상',
  },
  {
    id: 'balance-side',
    title: '측면 균형 잡기',
    category: '균형 강화',
    url: 'https://cdn.coverr.co/videos/coverr-sunset-stretch-1600.mp4',
    description: '벽을 잡고 안전하게 균형 감각을 되찾는 연습',
  },
];

export const listVideoCategories = (): VideoCategory[] =>
  Array.from(new Set(videoLibrary.map((video) => video.category)));

export const listVideos = async (): Promise<VideoMeta[]> => Promise.resolve(videoLibrary);

export const getVideoById = async (id: string): Promise<VideoMeta> => {
  const found = videoLibrary.find((video) => video.id === id);
  if (!found) {
    throw new Error('Video not found');
  }
  return found;
};
