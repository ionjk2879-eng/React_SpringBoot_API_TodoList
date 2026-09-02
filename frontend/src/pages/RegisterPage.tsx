import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

interface Props { onLogin: (email: string, token: string) => void; }

export default function RegisterPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (password !== passwordConfirm) { setError('비밀번호가 일치하지 않습니다.'); return; }
    setLoading(true);
    try {
      const res = await register({ email, password });
      onLogin(res.email, res.accessToken);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="none">
              <path d="M2 4.5h12M2 8h12M2 11.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-base font-semibold text-[#191919]">Todo List</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E9E9E7] rounded-2xl p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-[#191919] mb-0.5">회원가입</h1>
          <p className="text-sm text-[#787774] mb-5">새 계정을 만들어 시작하세요</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-xs px-3 py-2.5 rounded-lg mb-4">
              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-[#787774] uppercase tracking-wide mb-1.5">
                이메일
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full text-sm text-[#191919] placeholder-[#C7C5C2] border border-[#E9E9E7] rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] uppercase tracking-wide mb-1.5">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="8자 이상 입력"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full text-sm text-[#191919] placeholder-[#C7C5C2] border border-[#E9E9E7] rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
              <p className="text-[11px] text-[#C7C5C2] mt-1.5">최소 8자 이상이어야 합니다</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#787774] uppercase tracking-wide mb-1.5">
                비밀번호 확인
              </label>
              <input
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
                required
                className="w-full text-sm text-[#191919] placeholder-[#C7C5C2] border border-[#E9E9E7] rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? '가입 중…' : '회원가입'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E9E9E7] text-center">
            <span className="text-sm text-[#787774]">이미 계정이 있으신가요? </span>
            <Link to="/login" className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
              로그인
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
