import React, { useState } from 'react';
import { adminLogin } from '../../services/adminService';
import { updateAdminSession } from '../../services/adminStore';

interface AdminLoginProps {
  onSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@rehabwalk.co.kr');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await adminLogin({ email, password });
      updateAdminSession(result.tokens, result.profile);
      onSuccess?.();
    } catch (e) {
      const message = e instanceof Error ? e.message : '로그인에 실패했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-10 border border-slate-200">
        <h1 className="text-3xl font-black text-slate-900 mb-2">관리자 로그인</h1>
        <p className="text-slate-500 mb-8">병동/운영 관리자 전용 콘솔입니다.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="admin123"
            />
            <p className="text-xs text-slate-400">데모 비밀번호는 admin123 입니다.</p>
          </div>

          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? '확인 중...' : '콘솔 입장'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
