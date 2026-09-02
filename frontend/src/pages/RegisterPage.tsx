import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

interface Props { onLogin: (email: string, token: string) => void; }

export default function RegisterPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    try {
      const res = await register({ email, password });
      onLogin(res.email, res.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? '회원가입에 실패했습니다.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">회원가입</h1>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" placeholder="이메일" value={email}
            onChange={e => setEmail(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password" placeholder="비밀번호 (8자 이상)" value={password}
            onChange={e => setPassword(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition">
            회원가입
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
