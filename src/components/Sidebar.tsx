import React from 'react';
import {
  LayoutDashboard,
  School,
  Users,
  TrendingUp,
  X,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { TabType, SystemData } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  data: SystemData;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  data,
  isMobileOpen,
  onCloseMobile,
}) => {
  const totalClasses = data.classes.length;
  const totalStudents = data.students.length;
  const totalProgress = data.progressRecords.length;

  const navItems: { id: TabType; label: string; number: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'overview',
      number: '1',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'classes',
      number: '2',
      label: 'Lớp học',
      icon: <School className="w-5 h-5" />,
      count: totalClasses,
    },
    {
      id: 'students',
      number: '3',
      label: 'Học sinh',
      icon: <Users className="w-5 h-5" />,
      count: totalStudents,
    },
    {
      id: 'progress',
      number: '4',
      label: 'Tiến độ học tập',
      icon: <TrendingUp className="w-5 h-5" />,
      count: totalProgress,
    },
  ];

  const handleNavClick = (tab: TabType) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-200">
          <div className="font-bold text-slate-800 text-sm">MENU ĐIỀU HƯỚNG</div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Chức năng chính
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-1 rounded-lg ${
                      isActive ? 'bg-blue-700 text-white' : 'text-slate-500'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.number}. {item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-blue-500/80 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Helpful bottom callout for teacher */}
      <div className="mt-8 pt-4 border-t border-slate-200/80 space-y-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-800">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Phù hợp Thông tư 27</span>
          </div>
          <p className="text-emerald-700 leading-relaxed text-[11px]">
            Hệ thống hỗ trợ đánh giá thường xuyên cho học sinh tiểu học: <em>Hoàn thành tốt</em>, <em>Hoàn thành</em>, <em>Cần hỗ trợ thêm</em>.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-700">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Bảo mật dữ liệu học sinh</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Dữ liệu được lưu trữ trực tiếp trong trình duyệt trên máy của thầy. Hãy thường xuyên bấm <strong>Sao lưu dữ liệu</strong> để lưu file dự phòng.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-200 p-4 min-h-[calc(100vh-65px)]">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full bg-white p-5 shadow-2xl flex flex-col h-full z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
