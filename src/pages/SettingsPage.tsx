import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Sliders, Moon, Bell, Save } from 'lucide-react';
import { CURRENT_USER } from '../constants/mockData';

export const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'profile';

  const [fullName, setFullName] = React.useState(CURRENT_USER.fullName);
  const [email, setEmail] = React.useState(CURRENT_USER.email);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đã lưu cấu hình cài đặt thành công!');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cài đặt & Cấu hình</h1>
        <p className="text-xs text-slate-400 mt-1">Quản lý cài đặt tài khoản và tùy chỉnh giao diện ứng dụng.</p>
      </div>

      {/* 2 Tabs */}
      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2">
        <button
          onClick={() => handleTabChange('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'profile' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Hồ sơ cá nhân</span>
        </button>

        <button
          onClick={() => handleTabChange('preferences')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'preferences' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Tùy chọn giao diện</span>
        </button>
      </div>

      {/* Tab 1: Profile Settings */}
      {currentTab === 'profile' && (
        <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b border-surface-border">
            <img src={CURRENT_USER.avatarUrl} alt="Avatar" className="h-16 w-16 rounded-full object-cover ring-4 ring-indigo-500/30" />
            <div>
              <h3 className="text-sm font-bold text-white">Ảnh đại diện</h3>
              <p className="text-xs text-slate-400">Định dạng JPG, PNG hoặc GIF. Dung lượng tối đa 2MB.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Địa chỉ Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Preferences */}
      {currentTab === 'preferences' && (
        <div className="glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-surface-border">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-indigo-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Giao diện tối (Dark Mode)</h4>
                <p className="text-xs text-slate-400">Giao diện Editorial Tactile Dark sang trọng (Mặc định)</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-700 text-indigo-600" />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-surface-border">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Thông báo Email</h4>
                <p className="text-xs text-slate-400">Nhận thông báo khi thành viên mời hoặc chỉnh sửa ghi chú chung</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-700 text-indigo-600" />
          </div>
        </div>
      )}
    </div>
  );
};
