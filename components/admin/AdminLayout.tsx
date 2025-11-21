import React, { useEffect, useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { AdminUserRow } from '../../types';
import { fetchAdminUsers, getStepPointSnapshot } from '../../services/adminService';
import { getAdminState, resetAdminState, subscribeAdminState } from '../../services/adminStore';
import AdminUserTable from './AdminUserTable';
import AdminStatsTable from './AdminStatsTable';
import ManualRegistrationForm from './ManualRegistrationForm';
import QrRegistrationForm from './QrRegistrationForm';

const AdminLayout: React.FC = () => {
  const [adminState, setAdminState] = useState(getAdminState());
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [totals, setTotals] = useState({ totalSteps: 0, totalPoints: 0, userCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeAdminState((next) => setAdminState(next));
    return () => unsubscribe();
  }, []);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [list, snapshot] = await Promise.all([
        fetchAdminUsers(adminState.tokens),
        getStepPointSnapshot(adminState.tokens),
      ]);
      setUsers(list);
      setTotals(snapshot);
    } catch (e) {
      const message = e instanceof Error ? e.message : '관리자 데이터를 불러올 수 없습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminState.tokens) return;
    refresh();
  }, [adminState.tokens]);

  const handleRegistered = (user: AdminUserRow) => {
    setUsers((prev) => [user, ...prev]);
    setTotals((prev) => ({
      totalSteps: prev.totalSteps + user.steps,
      totalPoints: prev.totalPoints + user.points,
      userCount: prev.userCount + 1,
    }));
  };

  const handleLogout = () => {
    resetAdminState();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              <ShieldCheck />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">RehabWalk Admin</p>
              <p className="text-lg font-black text-slate-900">병동 관리자 콘솔</p>
              <p className="text-xs text-slate-500">{adminState.profile?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-semibold">{error}</div>
        )}

        <AdminStatsTable totals={totals} topUsers={users} />

        <AdminUserTable users={users} loading={loading} onRefresh={refresh} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ManualRegistrationForm onRegistered={handleRegistered} />
          <QrRegistrationForm onRegistered={handleRegistered} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
