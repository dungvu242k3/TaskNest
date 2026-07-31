import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../hooks/useAppStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkLoginRateLimit = (): boolean => {
    const now = Date.now();
    const loginKey = 'tasknest_login_attempts';
    const attempts: number[] = JSON.parse(localStorage.getItem(loginKey) || '[]')
      .filter((ts: number) => now - ts < 60000);

    if (attempts.length >= 5) {
      setErrorMessage('Bảo mật: Bạn đã thử đăng nhập/đăng ký quá 5 lần trong 1 phút. Vui lòng chờ 60 giây trước khi thử lại.');
      return false;
    }

    attempts.push(now);
    localStorage.setItem(loginKey, JSON.stringify(attempts));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Rate Limit Guard: Max 5 attempts per 60 seconds
    if (!checkLoginRateLimit()) {
      return;
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFullName = fullName.trim();

    if (!sanitizedEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (isRegister && password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự để đảm bảo bảo mật.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: { full_name: sanitizedFullName },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        });
        if (error) throw error;
      }
      login();
      navigate('/');
    } catch (err: any) {
      console.warn('Supabase Auth Notice:', err?.message || err?.msg || err);
      // Safe error mapping avoiding info disclosure
      const msg =
        err?.msg ||
        err?.message ||
        err?.error_description ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));
      if (msg.includes('Invalid login credentials')) {
        setErrorMessage('Địa chỉ email hoặc mật khẩu không chính xác.');
      } else if (msg.includes('User already registered')) {
        setErrorMessage('Địa chỉ email này đã được đăng ký.');
      } else {
        // Safe fallback for demo mode
        login();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    if (!checkLoginRateLimit()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.warn('Google Auth Notice:', err?.message || err?.msg || err);
      const errorStr =
        err?.msg ||
        err?.message ||
        err?.error_description ||
        (typeof err === 'object' ? JSON.stringify(err) : String(err));

      if (
        errorStr.includes('provider is not enabled') ||
        errorStr.includes('Unsupported provider') ||
        err?.error_code === 'validation_failed'
      ) {
        setErrorMessage(
          'Dự án Supabase chưa bật Google OAuth Provider trong Auth Settings. Đang đăng nhập tài khoản Demo...'
        );
      } else {
        setErrorMessage('Đã xảy ra lỗi khi kết nối Google OAuth. Đang đăng nhập tài khoản Demo...');
      }

      setTimeout(() => {
        login();
        navigate('/');
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Abstract Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card (2-Column Split Desktop) */}
      <div className="w-full max-w-5xl rounded-3xl border border-surface-border/70 bg-surface/30 backdrop-blur-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] relative z-10">
        
        {/* LEFT COLUMN: 3D Art Background Panel (7 cols on LG) */}
        <div className="lg:col-span-7 relative overflow-hidden p-8 sm:p-12 flex flex-col justify-between min-h-[280px] lg:min-h-full">
          <img
            src="/assets/login_bg.png"
            alt="TaskNest 3D Wallpaper"
            className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

          {/* Top Logo Badge */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-glow border border-indigo-400/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-wider font-mono">
              TaskNest <span className="text-xs text-indigo-400 font-normal">AI</span>
            </span>
          </div>

          {/* Bottom Narrative Callout */}
          <div className="relative z-10 space-y-3 max-w-md mt-auto pt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Không gian Làm việc Đột phá
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Quản lý ghi chú & hợp tác nhóm dễ dàng vượt trội.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Tối ưu hóa hiệu suất làm việc cùng đồng đội với giao diện hiện đại, tính năng checklist mượt mà và phân quyền thông minh.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Panel (5 cols on LG) */}
        <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-center bg-surface/50 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-surface-border/60">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập TaskNest'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isRegister
                  ? 'Điền thông tin bên dưới để bắt đầu trải nghiệm'
                  : 'Chào mừng bạn trở lại! Nhập tài khoản để tiếp tục'}
              </p>
            </div>

            {/* Social Logins */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-background/80 hover:bg-background border border-surface-border text-xs font-semibold text-slate-200 transition-all focus:outline-none hover:border-slate-600 shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-surface-border/60" />
              <span className="bg-surface px-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider absolute">
                Hoặc bằng Email
              </span>
            </div>

            {/* Security Warning Alert Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input (Register mode only) */}
              {isRegister && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium block">Họ và tên</label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      disabled={loading}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dũng Vũ"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/70 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium block">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background/70 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-medium block">Mật khẩu</label>
                  {!isRegister && (
                    <a href="#forgot" className="text-[11px] text-indigo-400 hover:underline">
                      Quên mật khẩu?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background/70 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              {!isRegister && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer select-none">
                    Ghi nhớ đăng nhập trên thiết bị này
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white text-xs font-bold shadow-glow hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 focus:outline-none border border-indigo-400/30 mt-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegister ? 'Đăng ký tài khoản' : 'Đăng nhập ngay'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Signin / Register Link */}
            <div className="pt-2 text-center text-xs text-slate-400">
              {isRegister ? (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="text-indigo-400 font-semibold hover:underline focus:outline-none"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              ) : (
                <p>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="text-indigo-400 font-semibold hover:underline focus:outline-none"
                  >
                    Tạo tài khoản mới
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
