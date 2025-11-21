import React from 'react';
import { AdminUserRow } from '../../types';
import { RefreshCw, Smartphone, Zap } from 'lucide-react';

interface AdminUserTableProps {
  users: AdminUserRow[];
  loading: boolean;
  onRefresh: () => void;
}

const formatDate = (value: string) => new Date(value).toLocaleString('ko-KR');

export const AdminUserTable: React.FC<AdminUserTableProps> = ({ users, loading, onRefresh }) => (
  <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div>
        <p className="text-xs font-semibold text-slate-500">환자/사용자 목록</p>
        <h2 className="text-xl font-black text-slate-900">최근 등록  사용자</h2>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 disabled:opacity-60"
        disabled={loading}
      >
        <RefreshCw size={16} /> 새로고침
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
          <tr>
            <th className="px-4 py-3 text-left">이름/전화번호</th>
            <th className="px-4 py-3 text-right">걸음</th>
            <th className="px-4 py-3 text-right">포인트</th>
            <th className="px-4 py-3 text-left">등록/최근 활동</th>
            <th className="px-4 py-3 text-center">방식</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                사용자 정보를 불러오는 중...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                아직 등록된 사용자가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{user.name}</div>
                  <p className="text-xs text-slate-500">{user.phoneNumber}</p>
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm text-slate-800">{user.steps.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-sm text-blue-700">{user.points.toLocaleString()}</td>
                <td className="px-4 py-3 text-left text-xs text-slate-500">
                  <p className="font-semibold text-slate-800">{formatDate(user.registeredAt)}</p>
                  <p>최근: {formatDate(user.lastActiveAt)}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      user.registrationMethod === 'qr'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {user.registrationMethod === 'qr' ? <Zap size={14} /> : <Smartphone size={14} />}
                    {user.registrationMethod === 'qr' ? 'QR 현장' : '전화/수기'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminUserTable;
