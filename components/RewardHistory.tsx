import React from 'react';
import { Gift, History } from 'lucide-react';
import { RewardTransaction } from '../types';

interface RewardHistoryProps {
  balance: number;
  transactions: RewardTransaction[];
}

const formatPoints = (points: number) => `${points > 0 ? '+' : ''}${points.toLocaleString()}P`;

export const RewardHistory: React.FC<RewardHistoryProps> = ({ balance, transactions }) => {
  return (
    <section
      aria-label="포인트 잔액과 적립 내역"
      className="bg-white rounded-[2rem] p-6 shadow-lg border border-gray-100 space-y-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-amber-100 text-amber-700 shadow-inner">
            <Gift size={28} aria-hidden />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">사용 가능한 포인트</p>
            <p className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{balance.toLocaleString()} P</p>
          </div>
        </div>
        <span className="text-xs sm:text-sm font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-full shadow">걷기 보상</span>
      </div>

      <div className="flex items-center gap-2 text-gray-700" aria-label="최근 적립 및 차감 기록">
        <History size={18} aria-hidden />
        <h3 className="text-lg font-extrabold">최근 포인트 내역</h3>
      </div>

      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden" role="list">
        {transactions.slice(0, 5).map((txn) => (
          <li
            key={txn.id}
            className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 focus-within:bg-gray-50 transition"
          >
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-gray-900">{txn.label}</span>
              <span className="text-sm text-gray-500 leading-relaxed">
                {new Date(txn.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                <span className="text-gray-300 mx-2" aria-hidden>
                  |
                </span>
                {Math.abs(txn.stepsDelta).toLocaleString()} 보 변동
              </span>
            </div>
            <div
              className={`text-lg sm:text-xl font-black tracking-tight ${
                txn.points >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
              aria-label={txn.points >= 0 ? '적립' : '차감'}
            >
              {formatPoints(txn.points)}
            </div>
          </li>
        ))}
        {transactions.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500 text-base font-semibold bg-gray-50" role="status">
            아직 적립 내역이 없습니다. 걸음 동기화로 포인트를 모아보세요.
          </li>
        )}
      </ul>
    </section>
  );
};
