'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  createdAt: string;
  user_id: string;
}

interface AuthResponse {
  success: boolean;
  data?: { user: User; token: string };
  message: string;
  error?: string;
}

export default function GetPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        router.push('/');
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [router]);

  const handleregister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.email || !formData.password) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }
    if (formData.password.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result: AuthResponse = await res.json();
      if (result.success && result.data) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setCurrentUser(result.data.user);
        setMessage('회원가입이 완료되었습니다!');
        setTimeout(() => { router.push('/'); window.location.reload(); }, 2000);
      } else {
        setMessage(result.message || '회원가입 실패');
      }
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const result: AuthResponse = await res.json();
      if (result.success && result.data) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        setCurrentUser(result.data.user);
        setMessage('로그인되었습니다!');
        setTimeout(() => { router.push('/'); window.location.reload(); }, 2000);
      } else {
        setMessage(result.message || '로그인 실패');
      }
    } catch {
      setMessage('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">간단한 로그인 시스템</h1>

        {message && <div className="mb-6 p-4 rounded-lg bg-gray-200">{message}</div>}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex mb-6">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 border-b-2 border-gray-200'}`}>로그인</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 border-b-2 border-gray-200'}`}>회원가입</button>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleregister} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="id">아이디</label>
                  <input type="text" id="id" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
                </div>
                <div>
                  <label htmlFor="name">이름</label>
                  <input type="text" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email">이메일</label>
              <input type="email" id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <div>
              <label htmlFor="password">비밀번호</label>
              <input type="password" id="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border rounded-md" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md">
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
