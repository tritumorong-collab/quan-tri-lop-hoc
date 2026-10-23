import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Eye,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  History,
} from 'lucide-react';
import { Student, Classroom, SystemData, ProgressRecord } from '../types';
import {
  formatDateVN,
  exportStudentsToCSV,
  exportStudentsToExcel,
  parseStudentsCSV,
  parseStudentsExcel,
  downloadStudentCSVTemplate,
  downloadStudentExcelTemplate,
} from '../utils/storage';

interface StudentsTabProps {
  data: SystemData;
  initialClassFilter?: string;
  onSaveStudent: (studentData: Omit<Student, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteStudent: (studentId: string) => void;
  onTransferStudent: (studentId: string, targetClassId: string) => void;
  onImportStudents: (students: Omit<Student, 'id' | 'createdAt'>[]) => void;
  onShowToast: (msg: string) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  data,
  initialClassFilter = '',
  onSaveStudent,
  onDeleteStudent,
  onTransferStudent,
  onImportStudents,
  onShowToast,
}) => {
  const { classes, students, progressRecords } = data;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(initialClassFilter);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc' | 'code-asc' | 'dob-desc'>('name-asc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [detailStudent, setDetailStudent] = useState<Student | null>(null);

  const [transferringStudent, setTransferringStudent] = useState<Student | null>(null);
  const [targetTransferClassId, setTargetTransferClassId] = useState('');

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Excel & CSV Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importInputMode, setImportInputMode] = useState<'file' | 'paste'>('file');
  const [pasteContent, setPasteContent] = useState('');
  const [importFileName, setImportFileName] = useState('');
  const [importFileType, setImportFileType] = useState<'excel' | 'csv' | null>(null);
  const [importBuffer, setImportBuffer] = useState<ArrayBuffer | null>(null);
  const [importSheets, setImportSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [previewValidStudents, setPreviewValidStudents] = useState<Omit<Student, 'id' | 'createdAt'>[]>([]);
  const [previewErrors, setPreviewErrors] = useState<{ line: number; message: string; raw: string }[]>([]);
  const [totalParsedRows, setTotalParsedRows] = useState(0);

  // Add/Edit Form State
  const [formCode, setFormCode] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formDob, setFormDob] = useState('2017-01-01');
  const [formGender, setFormGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [formStatus, setFormStatus] = useState<Student['status']>('Đang học');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Class lookup
  const classMap = useMemo(() => {
    const map = new Map<string, Classroom>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesClass = !selectedClassId || s.classId === selectedClassId;
        const matchesStatus = !selectedStatus || s.status === selectedStatus;
        return matchesSearch && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') {
          // Vietnamese string collation by first name / last word
          const nameA = a.fullName.trim().split(' ').pop() || a.fullName;
          const nameB = b.fullName.trim().split(' ').pop() || b.fullName;
          return nameA.localeCompare(nameB, 'vi');
        }
        if (sortBy === 'name-desc') {
          const nameA = a.fullName.trim().split(' ').pop() || a.fullName;
          const nameB = b.fullName.trim().split(' ').pop() || b.fullName;
          return nameB.localeCompare(nameA, 'vi');
        }
        if (sortBy === 'code-asc') {
          return a.code.localeCompare(b.code);
        }
        if (sortBy === 'dob-desc') {
          return new Date(b.dob).getTime() - new Date(a.dob).getTime();
        }
        return 0;
      });
  }, [students, searchTerm, selectedClassId, selectedStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const handleOpenAdd = () => {
    if (classes.length === 0) {
      alert('Vui lòng tạo ít nhất một lớp học trước khi thêm học sinh!');
      return;
    }
    setEditingStudent(null);
    setFormCode(`HS-${Date.now().toString().slice(-4)}`);
    setFormFullName('');
    setFormClassId(selectedClassId || classes[0].id);
    setFormDob('2017-05-15');
    setFormGender('Nam');
    setFormStatus('Đang học');
    setFormNotes('');
    setFormError('');
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setFormCode(s.code);
    setFormFullName(s.fullName);
    setFormClassId(s.classId);
    setFormDob(s.dob);
    setFormGender(s.gender);
    setFormStatus(s.status);
    setFormNotes(s.notes || '');
    setFormError('');
    setIsAddEditOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase();
    const cleanName = formFullName.trim();

    if (!cleanCode || !cleanName || !formClassId || !formDob) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    // Check duplicate code
    const duplicate = students.some(
      (s) => s.code.toUpperCase() === cleanCode && s.id !== editingStudent?.id
    );
    if (duplicate) {
      setFormError(`Mã học sinh "${cleanCode}" đã tồn tại. Vui lòng nhập mã học sinh khác.`);
      return;
    }

    onSaveStudent(
      {
        code: cleanCode,
        fullName: cleanName,
        classId: formClassId,
        dob: formDob,
        gender: formGender,
        status: formStatus,
        notes: formNotes.trim(),
      },
      editingStudent?.id
    );

    setIsAddEditOpen(false);
  };

  const handleConfirmTransfer = () => {
    if (!transferringStudent || !targetTransferClassId) return;
    if (targetTransferClassId === transferringStudent.classId) {
      alert('Lớp chuyển đến trùng với lớp hiện tại!');
      return;
    }
    onTransferStudent(transferringStudent.id, targetTransferClassId);
    setTransferringStudent(null);
  };

  // File Handler for Excel (.xlsx, .xls) and CSV
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isExcel = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
    setImportFileName(file.name);
    setImportFileType(isExcel ? 'excel' : 'csv');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          setImportBuffer(buffer);
          const result = parseStudentsExcel(buffer, classes, students);
          setImportSheets(result.sheetNames);
          setSelectedSheet(result.selectedSheet);
          setPreviewValidStudents(result.validStudents);
          setPreviewErrors(result.errors);
          setTotalParsedRows(result.totalRows);
        } catch (err: any) {
          setPreviewErrors([
            {
              line: 1,
              message: 'Lỗi khi đọc tệp Excel: ' + (err.message || 'Định dạng không hợp lệ'),
              raw: '',
            },
          ]);
          setPreviewValidStudents([]);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const result = parseStudentsCSV(text, classes, students);
          setImportBuffer(null);
          setImportSheets([]);
          setSelectedSheet('');
          setPreviewValidStudents(result.validStudents);
          setPreviewErrors(result.errors);
          setTotalParsedRows(result.validStudents.length + result.errors.length);
        } catch (err: any) {
          setPreviewErrors([
            {
              line: 1,
              message: 'Lỗi khi đọc tệp CSV: ' + (err.message || 'Định dạng không hợp lệ'),
              raw: '',
            },
          ]);
          setPreviewValidStudents([]);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (importBuffer) {
      try {
        const result = parseStudentsExcel(importBuffer, classes, students, sheetName);
        setPreviewValidStudents(result.validStudents);
        setPreviewErrors(result.errors);
        setTotalParsedRows(result.totalRows);
      } catch (err: any) {
        setPreviewErrors([{ line: 1, message: 'Lỗi đọc sheet: ' + err.message, raw: '' }]);
      }
    }
  };

  const handlePasteChange = (text: string) => {
    setPasteContent(text);
    if (!text.trim()) {
      setPreviewValidStudents([]);
      setPreviewErrors([]);
      setTotalParsedRows(0);
      setImportFileName('');
      return;
    }

    setImportFileName('Dữ liệu copy từ Excel');
    setImportFileType('excel');
    try {
      const result = parseStudentsCSV(text, classes, students);
      setPreviewValidStudents(result.validStudents);
      setPreviewErrors(result.errors);
      setTotalParsedRows(result.validStudents.length + result.errors.length);
    } catch (err: any) {
      setPreviewErrors([{ line: 1, message: 'Lỗi đọc dữ liệu: ' + err.message, raw: '' }]);
      setPreviewValidStudents([]);
    }
  };

  const handleConfirmImport = () => {
    if (previewValidStudents.length === 0) return;
    onImportStudents(previewValidStudents);
    onShowToast(`Đã thêm thành công ${previewValidStudents.length} học sinh từ file vào hệ thống!`);
    setIsImportModalOpen(false);
    setPreviewValidStudents([]);
    setPreviewErrors([]);
    setImportFileName('');
    setImportFileType(null);
    setImportBuffer(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Hồ sơ Học sinh – Quản lý danh sách &amp; Sĩ số
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ nhập trực tiếp danh sách học sinh từ file Excel (.xlsx, .xls) hoặc CSV của trường
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Excel / CSV Import Button */}
            <button
              onClick={() => {
                setImportFileName('');
                setImportFileType(null);
                setImportBuffer(null);
                setPreviewValidStudents([]);
                setPreviewErrors([]);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
              title="Nhập danh sách học sinh từ file Excel (.xlsx, .xls) hoặc CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Nhập từ Excel / CSV</span>
            </button>

            {/* Export Excel Button */}
            <button
              onClick={() => {
                exportStudentsToExcel(students, classes);
                onShowToast('Đã tải xuống danh sách học sinh dạng Excel (.xlsx)!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Xuất bảng Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel</span>
            </button>

            <button
              onClick={() => exportStudentsToCSV(students, classes)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Xuất tệp CSV"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm học sinh
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm theo họ tên, mã HS..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Tất cả các lớp học</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Đang học">Đang học</option>
              <option value="Chuyển trường">Chuyển trường</option>
              <option value="Nghỉ học">Nghỉ học</option>
              <option value="Tạm nghỉ">Tạm nghỉ</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="name-asc">Sắp xếp: Tên A → Z</option>
              <option value="name-desc">Sắp xếp: Tên Z → A</option>
              <option value="code-asc">Sắp xếp: Mã học sinh</option>
              <option value="dob-desc">Sắp xếp: Ngày sinh</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Tìm thấy <strong className="text-slate-800">{filteredStudents.length}</strong> học sinh
          </div>
          <div className="flex items-center gap-2">
            <span>Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {paginatedStudents.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy học sinh nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có dữ liệu phù hợp với điều kiện tìm kiếm hoặc chưa có học sinh trong danh sách.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 font-bold text-center w-12">STT</th>
                  <th className="py-3 px-3 font-bold">Mã HS</th>
                  <th className="py-3 px-3 font-bold">Họ và tên</th>
                  <th className="py-3 px-3 font-bold">Lớp</th>
                  <th className="py-3 px-3 font-bold">Ngày sinh</th>
                  <th className="py-3 px-3 font-bold">Giới tính</th>
                  <th className="py-3 px-3 font-bold">Trạng thái</th>
                  <th className="py-3 px-3 font-bold">Ghi chú</th>
                  <th className="py-3 px-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((s, index) => {
                  const stt = (currentPage - 1) * itemsPerPage + index + 1;
                  const cls = classMap.get(s.classId);

                  let statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (s.status === 'Chuyển trường') {
                    statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (s.status === 'Nghỉ học') {
                    statusBadgeClass = 'bg-red-50 text-red-700 border-red-200';
                  }

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-500 font-semibold">{stt}</td>
                      <td className="py-3 px-3 font-bold text-slate-700">{s.code}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
                          {cls ? cls.name : 'Chưa xếp lớp'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatDateVN(s.dob)}</td>
                      <td className="py-3 px-3 text-slate-600">{s.gender}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${statusBadgeClass}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-[180px] truncate" title={s.notes}>
                        {s.notes || '--'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailStudent(s)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết hồ sơ & tiến độ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTransferringStudent(s);
                              setTargetTransferClassId('');
                            }}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Chuyển lớp"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudent(s)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa học sinh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Trang <strong>{currentPage}</strong> / {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingStudent ? 'Chỉnh sửa hồ sơ học sinh' : 'Thêm học sinh mới'}
              </h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="VD: HS3A-01"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lớp học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    required
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="VD: A Duy, Y Thủy..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as 'Nam' | 'Nữ')}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trạng thái học tập
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                >
                  <option value="Đang học">Đang học</option>
                  <option value="Chuyển trường">Chuyển trường</option>
                  <option value="Nghỉ học">Nghỉ học</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú giáo dục (Nơi ở, hoàn cảnh, sở thích)
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="VD: Thôn Đắk Ter, bán trú tại trường, năng khiếu toán học..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {editingStudent ? 'Lưu cập nhật' : 'Thêm học sinh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Student Modal */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {detailStudent.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {detailStudent.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Mã: <strong>{detailStudent.code}</strong></span>
                    <span>•</span>
                    <span>Lớp: <strong>{classMap.get(detailStudent.classId)?.name || '--'}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Ngày sinh:</span>
                  <span className="font-bold text-slate-800">{formatDateVN(detailStudent.dob)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Giới tính:</span>
                  <span className="font-bold text-slate-800">{detailStudent.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Trạng thái:</span>
                  <span className="font-bold text-emerald-700">{detailStudent.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Năm học:</span>
                  <span className="font-bold text-slate-800">
                    {classMap.get(detailStudent.classId)?.academicYear || '2026-2027'}
                  </span>
                </div>
                {detailStudent.notes && (
                  <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200/60 mt-1">
                    <span className="text-slate-400 block text-[11px]">Ghi chú giáo dục:</span>
                    <p className="text-slate-700 font-medium">{detailStudent.notes}</p>
                  </div>
                )}
              </div>

              {/* Progress History */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  Lịch sử đánh giá tiến độ học tập (Thông tư 27)
                </h4>

                {progressRecords.filter((r) => r.studentId === detailStudent.id).length === 0 ? (
                  <div className="p-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                    Chưa có đánh giá nào cho em {detailStudent.fullName}.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                        <tr>
                          <th className="p-2.5">Ngày</th>
                          <th className="p-2.5">Môn học</th>
                          <th className="p-2.5">Kỹ năng đánh giá</th>
                          <th className="p-2.5">Mức độ</th>
                          <th className="p-2.5">Nhận xét của giáo viên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {progressRecords
                          .filter((r) => r.studentId === detailStudent.id)
                          .map((rec) => {
                            let lvlClass = 'bg-blue-50 text-blue-700 border-blue-200';
                            if (rec.level === 'Hoàn thành tốt') lvlClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                            if (rec.level === 'Cần hỗ trợ thêm') lvlClass = 'bg-amber-50 text-amber-700 border-amber-200';

                            return (
                              <tr key={rec.id} className="hover:bg-slate-50">
                                <td className="p-2.5 text-slate-600">{formatDateVN(rec.date)}</td>
                                <td className="p-2.5 font-bold text-slate-800">{rec.subject}</td>
                                <td className="p-2.5 text-slate-700">{rec.topic}</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${lvlClass}`}>
                                    {rec.level}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-600 leading-relaxed">
                                  {rec.teacherComment}
                                  {rec.supportAction && (
                                    <div className="text-[11px] text-amber-700 mt-0.5">
                                      <em>Hỗ trợ: {rec.supportAction}</em>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailStudent(null)}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Student Modal */}
      {transferringStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                Chuyển học sinh sang lớp khác
              </h3>
              <button
                onClick={() => setTransferringStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="font-bold text-blue-900">{transferringStudent.fullName}</div>
                <div className="text-blue-700 mt-0.5">
                  Mã HS: {transferringStudent.code} • Lớp hiện tại:{' '}
                  <strong>{classMap.get(transferringStudent.classId)?.name || '--'}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn lớp chuyển đến <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetTransferClassId}
                  onChange={(e) => setTargetTransferClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="">-- Chọn lớp học mới --</option>
                  {classes
                    .filter((c) => c.id !== transferringStudent.classId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - Năm học {c.academicYear}
                      </option>
                    ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 leading-relaxed text-[11px]">
                <strong>Ghi chú:</strong> Toàn bộ lịch sử học tập và nhận xét tiến độ trước đó của em{' '}
                <strong>{transferringStudent.fullName}</strong> vẫn được giữ nguyên đầy đủ.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setTransferringStudent(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                disabled={!targetTransferClassId}
                onClick={handleConfirmTransfer}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
              >
                Xác nhận chuyển lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Xóa hồ sơ học sinh &quot;{deletingStudent.fullName}&quot;?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Mã học sinh: <strong>{deletingStudent.code}</strong> • Lớp:{' '}
                <strong>{classMap.get(deletingStudent.classId)?.name}</strong>
              </p>
              <p className="mt-2 text-xs text-red-600">
                Lưu ý: Thao tác này sẽ xóa hồ sơ học sinh này khỏi hệ thống. Hãy cân nhắc nếu học sinh chỉ nghỉ tạm hoặc chuyển trường bằng cách đổi trạng thái thay vì xóa.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deletingStudent.id);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel (.xlsx, .xls) & CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nhập danh sách học sinh từ file Excel hoặc CSV
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Hỗ trợ file .xlsx, .xls (Microsoft Excel) và file .csv
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              {/* Guidance & Template Downloads */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>📋 Cấu trúc các cột trong file Excel:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadStudentExcelTemplate(classes)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                      title="Tải file mẫu Excel chuẩn có sẵn các lớp hiện tại"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Tải mẫu Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={downloadStudentCSVTemplate}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                      title="Tải file mẫu CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Mẫu CSV
                    </button>
                  </div>
                </div>

                <div className="text-slate-700 font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 flex flex-wrap gap-2">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-800">Mã học sinh</span>
                  <span className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">Họ và tên *</span>
                  <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Lớp *</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">Ngày sinh</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">Giới tính</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">Trạng thái</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">Ghi chú</span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>
                    • <strong>Lớp:</strong> Điền mã lớp (VD: <code>3A</code>) hoặc tên lớp (VD: <code>Lớp 3A</code>). Các lớp hiện có: {classes.map(c => c.code).join(', ')}.
                  </div>
                  <div>
                    • <strong>Tương thích:</strong> Hệ thống tự động nhận diện tiêu đề ngay cả khi file tải từ vnEdu, SMAS hoặc có dòng tiêu đề trường ở trên.
                  </div>
                </div>
              </div>

              {/* Mode Toggle: File Upload vs Direct Copy-Paste */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setImportInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    importInputMode === 'file'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📁 Chọn file Excel (.xlsx, .xls) hoặc CSV
                </button>
                <button
                  type="button"
                  onClick={() => setImportInputMode('paste')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    importInputMode === 'paste'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📋 Dán nhanh từ Excel (Ctrl+V)
                </button>
              </div>

              {/* Upload Input Area */}
              {importInputMode === 'file' ? (
                <div>
                  <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 rounded-xl p-4 text-center transition-colors">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      onChange={handleFileSelect}
                      className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                    />
                    <p className="text-[11px] text-slate-400 mt-2">
                      Hỗ trợ tệp <strong>.xlsx</strong>, <strong>.xls</strong> (Excel), <strong>.csv</strong> dung lượng tối đa 15MB
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sao chép các dòng trong Excel và dán (Ctrl+V) vào ô bên dưới:
                  </label>
                  <textarea
                    rows={5}
                    value={pasteContent}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="Mở file Excel -> Chọn các dòng học sinh -> Nhấn Ctrl+C -> Bấm vào đây và nhấn Ctrl+V..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hệ thống tự động nhận diện các cột được phân cách bằng tab từ Excel.
                  </p>
                </div>
              )}

              {/* Multi-sheet Selector (if Excel file has multiple sheets) */}
              {importSheets.length > 1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">
                    File có {importSheets.length} bảng tính (sheet). Chọn bảng tính cần nhập:
                  </span>
                  <select
                    value={selectedSheet}
                    onChange={(e) => handleSheetChange(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-800"
                  >
                    {importSheets.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Preview & Status */}
              {importFileName && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-slate-800">
                      Tệp đã chọn: <span className="text-emerald-700 underline">{importFileName}</span>
                    </span>
                    <span className="text-slate-500">
                      Đã đọc: <strong>{totalParsedRows}</strong> dòng dữ liệu
                    </span>
                  </div>

                  {/* Valid rows badge */}
                  {previewValidStudents.length > 0 && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          Hợp lệ: Sẵn sàng nhập {previewValidStudents.length} học sinh
                        </span>
                        <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Đã kiểm tra trùng lặp
                        </span>
                      </div>

                      {/* Small preview table */}
                      <div className="border border-emerald-200 rounded-lg overflow-hidden bg-white max-h-36 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 font-bold">
                            <tr>
                              <th className="p-1.5">Mã HS</th>
                              <th className="p-1.5">Họ và tên</th>
                              <th className="p-1.5">Lớp</th>
                              <th className="p-1.5">Ngày sinh</th>
                              <th className="p-1.5">Giới tính</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {previewValidStudents.slice(0, 5).map((s, idx) => (
                              <tr key={idx}>
                                <td className="p-1.5 font-bold text-slate-700">{s.code}</td>
                                <td className="p-1.5 font-semibold text-slate-900">{s.fullName}</td>
                                <td className="p-1.5 text-blue-700">{classMap.get(s.classId)?.name}</td>
                                <td className="p-1.5 text-slate-600">{formatDateVN(s.dob)}</td>
                                <td className="p-1.5 text-slate-600">{s.gender}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {previewValidStudents.length > 5 && (
                        <p className="text-[10px] text-slate-400 italic">
                          ...và {previewValidStudents.length - 5} học sinh khác nữa
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error rows notice */}
                  {previewErrors.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-bold text-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Có {previewErrors.length} dòng không hợp lệ (sẽ được bỏ qua để bảo vệ dữ liệu):
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1 border border-amber-200 bg-amber-50/60 p-2.5 rounded-lg text-[11px]">
                        {previewErrors.map((err, i) => (
                          <div key={i} className="text-amber-900 flex items-start gap-1">
                            <span className="font-bold text-amber-700 shrink-0">Dòng {err.line}:</span>
                            <span>{err.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                disabled={previewValidStudents.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Thêm {previewValidStudents.length} học sinh vào hệ thống
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
