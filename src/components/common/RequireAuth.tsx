import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Sparkles, Zap } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useAppStore();

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full bg-background flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Auth Barrier Glassmorphic Card */}
        <div className="w-full max-w-lg bg-surface/40 border border-surface-border/80 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 relative z-10">
          {/* Icon Badge */}
          <div className="h-16 w-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto shadow-glow">
            <ShieldAlert className="h-8 w-8" />
          </div>

          {/* Heading & UX Text */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Yêu cầu xác thực tài khoản</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Đăng Nhập để Sử Dụng Tính Năng
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Bạn chưa đăng nhập vào hệ thống TaskNest. Vui lòng đăng nhập tài khoản của bạn để truy cập bảng điều khiển, tạo ghi chú và quản lý nhóm.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto py-3 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 border border-indigo-400/30"
            >
              <LogIn className="h-4 w-4" />
              <span>Chuyển tới Trang Đăng Nhập</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
