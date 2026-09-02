import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

interface Props { onLogin: (email: string, token: string) => void; }

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password });
      onLogin(res.email, res.accessToken);
      navigate('/');
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">로그인</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password" placeholder="비밀번호" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition">
            로그인
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
