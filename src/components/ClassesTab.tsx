import React, { useState } from 'react';
import {
  School,
  Plus,
  Search,
  Filter,
  Users,
  Edit2,
  Trash2,
  ExternalLink,
  Info,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Classroom, Student, SystemData } from '../types';

interface ClassesTabProps {
  data: SystemData;
  onSaveClass: (classData: Omit<Classroom, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteClass: (classId: string) => void;
  onViewClassStudents: (classId: string) => void;
  onShowToast: (msg: string) => void;
}

export const ClassesTab: React.FC<ClassesTabProps> = ({
  data,
  onSaveClass,
  onDeleteClass,
  onViewClassStudents,
  onShowToast,
}) => {
  const { classes, students } = data;

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);

  // Detail Modal state
  const [viewingClass, setViewingClass] = useState<Classroom | null>(null);

  // Delete Confirmation state
  const [deletingClass, setDeletingClass] = useState<Classroom | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [teacherInCharge, setTeacherInCharge] = useState('Nguyễn Viết Tri');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Extract unique academic years
  const academicYears = Array.from(new Set(classes.map((c) => c.academicYear)));

  // Filtered classes
  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = !selectedYear || c.academicYear === selectedYear;
    return matchesSearch && matchesYear;
  });

  const handleOpenAdd = () => {
    setEditingClass(null);
    setCode('');
    setName('');
    setAcademicYear('2026-2027');
    setTeacherInCharge('Nguyễn Viết Tri');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Classroom) => {
    setEditingClass(c);
    setCode(c.code);
    setName(c.name);
    setAcademicYear(c.academicYear);
    setTeacherInCharge(c.teacherInCharge || 'Nguyễn Viết Tri');
    setNotes(c.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanYear = academicYear.trim();

    if (!cleanCode || !cleanName || !cleanYear) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    // Check duplicate code
    const isDuplicate = classes.some(
      (c) => c.code.toUpperCase() === cleanCode && c.id !== editingClass?.id
    );
    if (isDuplicate) {
      setFormError(`Mã lớp "${cleanCode}" đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`);
      return;
    }

    onSaveClass(
      {
        code: cleanCode,
        name: cleanName,
        academicYear: cleanYear,
        teacherInCharge: teacherInCharge.trim() || 'Nguyễn Viết Tri',
        notes: notes.trim(),
      },
      editingClass?.id
    );

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingClass) return;
    onDeleteClass(deletingClass.id);
    setDeletingClass(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <School className="w-5 h-5 text-blue-600" />
              Quản lý Lớp học – Trường PTDTBT TH Tu Mơ Rông
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi danh sách các lớp học phụ trách, sĩ số học sinh và năm học
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Thêm lớp học mới
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo mã lớp (VD: 3A), tên lớp..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Tất cả các năm học</option>
              {academicYears.map((yr) => (
                <option key={yr} value={yr}>
                  Năm học {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Không tìm thấy lớp học nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedYear
              ? 'Không có lớp học nào khớp với bộ lọc tìm kiếm hiện tại.'
              : 'Chưa có lớp học nào được tạo. Hãy nhấn "Thêm lớp học mới" để bắt đầu.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm lớp học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const classStudents = students.filter((s) => s.classId === cls.id);
            const studentCount = classStudents.length;
            const boysCount = classStudents.filter((s) => s.gender === 'Nam').length;
            const girlsCount = classStudents.filter((s) => s.gender === 'Nữ').length;

            return (
              <div
                key={cls.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        Mã lớp: {cls.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">
                        {cls.name}
                      </h3>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-lg shrink-0">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      {studentCount} học sinh
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Năm học: <strong>{cls.academicYear}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>GV: <strong>{cls.teacherInCharge || 'Nguyễn Viết Tri'}</strong></span>
                    </div>
                    {studentCount > 0 && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                        <span>Nam: <strong>{boysCount}</strong></span>
                        <span>•</span>
                        <span>Nữ: <strong>{girlsCount}</strong></span>
                      </div>
                    )}
                    {cls.notes && (
                      <p className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 line-clamp-2">
                        {cls.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onViewClassStudents(cls.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Xem danh sách HS</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingClass(cls)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết lớp"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Chỉnh sửa thông tin lớp"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa lớp học"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                {editingClass ? 'Chỉnh sửa thông tin lớp học' : 'Thêm lớp học mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã lớp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="VD: 3A"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold uppercase"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Duy nhất, không trùng lặp</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên lớp học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Lớp 3A"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Năm học <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Giáo viên phụ trách
                  </label>
                  <input
                    type="text"
                    value={teacherInCharge}
                    onChange={(e) => setTeacherInCharge(e.target.value)}
                    placeholder="Nguyễn Viết Tri"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú lớp học
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="VD: Điểm trường chính, học sinh bán trú thôn Đắk Ter..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  {editingClass ? 'Lưu cập nhật' : 'Tạo lớp học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Class Details Modal */}
      {viewingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Mã: {viewingClass.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Chi tiết {viewingClass.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingClass(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Năm học:</span>
                  <span className="font-bold text-slate-800">{viewingClass.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Giáo viên phụ trách:</span>
                  <span className="font-bold text-slate-800">{viewingClass.teacherInCharge || 'Nguyễn Viết Tri'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sĩ số học sinh:</span>
                  <span className="font-bold text-blue-700">
                    {students.filter((s) => s.classId === viewingClass.id).length} học sinh
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ghi chú:</span>
                  <span className="font-medium text-slate-700">{viewingClass.notes || 'Không có ghi chú'}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800">
                    Danh sách học sinh trong lớp ({students.filter((s) => s.classId === viewingClass.id).length})
                  </h4>
                  <button
                    onClick={() => {
                      const id = viewingClass.id;
                      setViewingClass(null);
                      onViewClassStudents(id);
                    }}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Quản lý học sinh →
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="p-2 font-bold">Mã HS</th>
                        <th className="p-2 font-bold">Họ và tên</th>
                        <th className="p-2 font-bold">Giới tính</th>
                        <th className="p-2 font-bold">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter((s) => s.classId === viewingClass.id).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400">
                            Chưa có học sinh nào trong lớp này
                          </td>
                        </tr>
                      ) : (
                        students
                          .filter((s) => s.classId === viewingClass.id)
                          .map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="p-2 font-semibold text-slate-700">{s.code}</td>
                              <td className="p-2 font-bold text-slate-900">{s.fullName}</td>
                              <td className="p-2 text-slate-600">{s.gender}</td>
                              <td className="p-2">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingClass(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa lớp &quot;{deletingClass.name}&quot;?
              </h3>

              {students.filter((s) => s.classId === deletingClass.id).length > 0 ? (
                <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 p-3 rounded-xl leading-relaxed">
                  <strong>CẢNH BÁO:</strong> Lớp học này hiện đang có{' '}
                  <span className="font-bold underline">
                    {students.filter((s) => s.classId === deletingClass.id).length} học sinh
                  </span>
                  . Để bảo vệ dữ liệu, hệ thống không tự động xóa học sinh. Bạn nên chuyển các học sinh này sang lớp khác trước hoặc xác nhận để tiếp tục.
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-600">
                  Lớp học này hiện chưa có học sinh nào. Thao tác xóa không thể hoàn tác.
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingClass(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
              >
                Xác nhận xóa lớp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
