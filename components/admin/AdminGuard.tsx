import React, { useEffect, useState } from 'react';
import { verifyAdminSession } from '../../services/adminService';
import { getAdminState, resetAdminState, subscribeAdminState } from '../../services/adminStore';
import AdminLogin from './AdminLogin';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [adminState, setAdminState] = useState(getAdminState());
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeAdminState((next) => setAdminState(next));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setChecking(true);
      setError('');
      const valid = await verifyAdminSession(adminState.tokens);
      if (!valid && mounted) {
        setError('관리자 세션이 만료되었습니다. 다시 로그인해주세요.');
        resetAdminState();
      }
      if (mounted) {
        setChecking(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [adminState.tokens]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        <div className="bg-white px-6 py-4 rounded-xl shadow border border-slate-200">관리자 세션 확인 중...</div>
      </div>
    );
  }

  if (!adminState.isAuthenticated) {
    return (
      <>
        {error && (
          <p className="text-center text-sm text-red-600 font-semibold mt-4" role="alert">
            {error}
          </p>
        )}
        <AdminLogin />
      </>
    );
  }

  return <>{children}</>;
};
