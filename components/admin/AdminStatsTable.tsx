import React from 'react';
import { BarChart3, Footprints, Medal, Users } from 'lucide-react';
import { AdminUserRow } from '../../types';

interface AdminStatsTableProps {
  totals: {
    totalSteps: number;
    totalPoints: number;
    userCount: number;
  };
  topUsers: AdminUserRow[];
}

export const AdminStatsTable: React.FC<AdminStatsTableProps> = ({ totals, topUsers }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div className="bg-white rounded-2xl shadow border border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-3 text-blue-700">
        <BarChart3 />
        <p className="text-sm font-bold text-slate-500">누적 메트릭</p>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-900">{totals.userCount}명</p>
        <p className="text-sm text-slate-500">등록된 사용자</p>
      </div>
      <p className="text-sm text-slate-500">관리자 인증 후 병동에 배정된 사용자 수를 확인합니다.</p>
    </div>

    <div className="bg-white rounded-2xl shadow border border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-3 text-indigo-700">
        <Footprints />
        <p className="text-sm font-bold text-slate-500">걸음수 합계</p>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-900">{totals.totalSteps.toLocaleString()}걸음</p>
        <p className="text-sm text-slate-500">최근 사용자 기록 기준</p>
      </div>
      <p className="text-sm text-slate-500">환자 회복 추적을 위해 걸음 데이터가 갱신됩니다.</p>
    </div>

    <div className="bg-white rounded-2xl shadow border border-slate-200 p-5 space-y-3">
      <div className="flex items-center gap-3 text-emerald-700">
        <Users />
        <p className="text-sm font-bold text-slate-500">포인트 적립</p>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black text-slate-900">{totals.totalPoints.toLocaleString()} P</p>
        <p className="text-sm text-slate-500">활동 보상 합계</p>
      </div>
      <p className="text-sm text-slate-500">운동 참여도에 따른 리워드 적립 현황입니다.</p>
    </div>

    <div className="lg:col-span-3 bg-white rounded-2xl shadow border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-3 text-amber-600">
        <Medal />
        <p className="text-sm font-bold text-slate-700">상위 활동 사용자</p>
      </div>
      {topUsers.length === 0 ? (
        <p className="text-sm text-slate-500">표시할 사용자가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-1"
            >
              <p className="text-xs text-slate-500">{user.registrationMethod === 'qr' ? 'QR 등록' : '전화 등록'}</p>
              <p className="text-lg font-black text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.phoneNumber}</p>
              <p className="text-sm font-semibold text-indigo-700">{user.steps.toLocaleString()} 걸음</p>
              <p className="text-sm font-semibold text-emerald-700">{user.points.toLocaleString()} 포인트</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

export default AdminStatsTable;
