import React from 'react';
import {
  School,
  UserCheck,
  Calendar,
  PlusCircle,
  TrendingUp,
  Download,
  FolderDown,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { SystemData } from '../types';
import { downloadBackupFile } from '../utils/storage';
import { downloadStandaloneHtmlFile } from '../utils/generateStandaloneHtml';

interface HeaderProps {
  data: SystemData;
  onOpenAddClass: () => void;
  onOpenAddStudent: () => void;
  onOpenAddProgress: () => void;
  onOpenBackupModal: () => void;
  onToggleMobileMenu: () => void;
  onShowToast: (msg: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  onOpenAddClass,
  onOpenAddStudent,
  onOpenAddProgress,
  onOpenBackupModal,
  onToggleMobileMenu,
  onShowToast,
}) => {
  // Format current date in Vietnamese
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleExportHTML = () => {
    downloadStandaloneHtmlFile(data);
    onShowToast('Đã tải xuống tệp "quan-tri-lop-hoc.html" độc lập để chạy ngoại tuyến!');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* School & App Branding */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 shrink-0 hidden sm:flex">
                <School className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Trường PTDTBT TH Tu Mơ Rông
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Lưu trữ cục bộ an toàn
                  </span>
                </div>
                
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  HỆ THỐNG QUẢN TRỊ LỚP HỌC
                </h1>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    Giáo viên phụ trách: <span className="text-blue-800 font-bold">NGUYỄN VIẾT TRI</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {dateFormatted}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center flex-wrap gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <button
              onClick={onOpenAddClass}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Thêm lớp
            </button>

            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-slate-600" />
              Thêm học sinh
            </button>

            <button
              onClick={onOpenAddProgress}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Cập nhật tiến độ
            </button>

            <button
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Sao lưu & Khôi phục dữ liệu"
            >
              <FolderDown className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Sao lưu dữ liệu</span>
            </button>

            <button
              onClick={handleExportHTML}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              title="Tải tệp HTML độc lập chạy ngoại tuyến không cần internet"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Xuất HTML Offline</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
