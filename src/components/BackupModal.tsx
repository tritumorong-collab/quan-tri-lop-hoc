import React, { useState } from 'react';
import {
  FolderDown,
  Upload,
  Download,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { SystemData } from '../types';
import {
  downloadBackupFile,
  validateBackupFile,
  formatDateTimeVN,
} from '../utils/storage';
import { INITIAL_SAMPLE_DATA } from '../data/sampleData';
import { downloadStandaloneHtmlFile } from '../utils/generateStandaloneHtml';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SystemData;
  onRestoreData: (newData: SystemData) => void;
  onShowToast: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  data,
  onRestoreData,
  onShowToast,
}) => {
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    downloadBackupFile(data);
    onShowToast('Đã tải xuống bản sao lưu dữ liệu (.JSON)!');
  };

  const handleExportStandaloneHTML = () => {
    downloadStandaloneHtmlFile(data);
    onShowToast('Đã tải xuống tệp "quan-tri-lop-hoc.html" độc lập chạy ngoại tuyến!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError('');
    setRestoreSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupFile(content);
      if (!validation.success || !validation.data) {
        setRestoreError(validation.error || 'Tệp sao lưu không hợp lệ');
        return;
      }

      const confirmed = window.confirm(
        `XÁC NHẬN KHÔI PHỤC:\n\nTệp sao lưu chứa ${validation.data.classes.length} lớp học và ${validation.data.students.length} học sinh.\n\nThao tác này sẽ thay thế toàn bộ dữ liệu hiện tại trong trình duyệt. Bạn có chắc chắn muốn tiếp tục?`
      );

      if (confirmed) {
        onRestoreData(validation.data);
        setRestoreSuccess('Khôi phục dữ liệu thành công!');
        onShowToast('Đã khôi phục dữ liệu thành công!');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadSampleData = () => {
    if (
      window.confirm(
        'Thao tác này sẽ nạp lại dữ liệu mẫu chuẩn của Trường PTDTBT TH Tu Mơ Rông (3 lớp, 13 học sinh tiêu biểu và 10 bản ghi tiến độ). Bạn có muốn tiếp tục?'
      )
    ) {
      onRestoreData(INITIAL_SAMPLE_DATA);
      onShowToast('Đã nạp dữ liệu mẫu Trường PTDTBT TH Tu Mơ Rông!');
      onClose();
    }
  };

  const handleResetBlank = () => {
    if (
      window.confirm(
        'CẢNH BÁO: Bạn có chắc chắn muốn xóa sạch toàn bộ dữ liệu để bắt đầu nhập mới từ đầu không? Hãy sao lưu trước nếu cần!'
      )
    ) {
      const blankData: SystemData = {
        version: '1.0.0',
        lastBackup: new Date().toISOString(),
        schoolName: 'TRƯỜNG PTDTBT TH TU MƠ RÔNG',
        teacherName: 'NGUYỄN VIẾT TRI',
        classes: [],
        students: [],
        progressRecords: [],
        activityLogs: [],
      };
      onRestoreData(blankData);
      onShowToast('Đã đặt lại dữ liệu trống!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FolderDown className="w-5 h-5 text-blue-600" />
            Quản trị Dữ liệu &amp; Sao lưu an toàn
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Privacy Note */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Dữ liệu lưu trữ độc lập trên thiết bị</div>
              <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                Ứng dụng hoạt động trực tiếp trong trình duyệt web trên máy tính của thầy Tri, không gửi dữ liệu học sinh ra máy chủ bên ngoài, đảm bảo an toàn và bảo mật thông tin giáo dục.
              </p>
            </div>
          </div>

          {restoreError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {restoreSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{restoreSuccess}</span>
            </div>
          )}

          {/* Backup & Restore Operations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-2">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-blue-600" />
                  Xuất tệp sao lưu (.JSON)
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Lưu trữ toàn bộ lớp học, học sinh và sổ tiến độ thành 1 file trên máy tính để lưu dự phòng.
                </p>
              </div>
              <button
                onClick={handleExportJSON}
                className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-center"
              >
                Tải bản sao lưu
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-2">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Khôi phục từ tệp (.JSON)
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Nạp lại dữ liệu đã sao lưu trước đó khi chuyển máy tính hoặc cài đặt lại trình duyệt.
                </p>
              </div>
              <label className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-center block">
                <span>Chọn tệp khôi phục</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Standalone Single HTML Export */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-600" />
                Xuất tệp HTML chạy ngoại tuyến (Offline)
              </div>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                Tải về tệp <code>quan-tri-lop-hoc.html</code> duy nhất, mở bằng bất kỳ trình duyệt nào mà không cần internet.
              </p>
            </div>
            <button
              onClick={handleExportStandaloneHTML}
              className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shrink-0 shadow-xs cursor-pointer"
            >
              Tải tệp HTML
            </button>
          </div>

          {/* Reset / Sample Data Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={handleLoadSampleData}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nạp dữ liệu mẫu Tu Mơ Rông
            </button>

            <button
              onClick={handleResetBlank}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Đặt lại dữ liệu trống
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
