import React, { useMemo } from 'react';
import { StepEntry } from '../types';
import { calculateAggregates } from '../services/stepHistoryStore';

interface StepSummaryProps {
  entries: StepEntry[];
}

const formatNumber = (value: number) => value.toLocaleString();

const getRecentEntries = (entries: StepEntry[], days = 7) => {
  const sorted = [...entries].sort((a, b) => (a.date > b.date ? 1 : -1)).slice(-days);
  return sorted.map((entry) => ({
    ...entry,
    label: entry.date.slice(5).replace('-', '/'),
  }));
};

export const StepSummary: React.FC<StepSummaryProps> = ({ entries }) => {
  const aggregates = useMemo(() => calculateAggregates(entries), [entries]);
  const recentEntries = useMemo(() => getRecentEntries(entries), [entries]);

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-900">걸음 기록 요약</h3>
        <span className="text-sm text-gray-500">일/주/월 합계</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-blue-500 font-bold">오늘</p>
          <p className="text-2xl font-black text-blue-700">{formatNumber(aggregates.daily)}</p>
          <p className="text-xs text-blue-400">걸음</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-indigo-500 font-bold">최근 7일</p>
          <p className="text-2xl font-black text-indigo-700">{formatNumber(aggregates.weekly)}</p>
          <p className="text-xs text-indigo-400">걸음</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-500 font-bold">이번 달</p>
          <p className="text-2xl font-black text-purple-700">{formatNumber(aggregates.monthly)}</p>
          <p className="text-xs text-purple-400">걸음</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-700">최근 7일 추이</p>
          <span className="text-xs text-gray-400">동기화 + 수동 입력</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {recentEntries.map((entry) => {
            const height = Math.min(100, Math.max(10, (entry.steps / 6000) * 100));
            return (
              <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-xl bg-gradient-to-t from-blue-500 to-indigo-400 shadow-inner"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-[10px] text-gray-500 font-semibold">{entry.label}</span>
                <span className="text-[11px] text-gray-700 font-bold">{formatNumber(entry.steps)}</span>
              </div>
            );
          })}
          {recentEntries.length === 0 && (
            <div className="text-sm text-gray-400">기록이 아직 없어요.</div>
          )}
        </div>
      </div>
    </div>
  );
};
