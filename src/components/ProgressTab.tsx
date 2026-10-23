import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Award,
  Users,
  Search,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { ProgressRecord, Student, Classroom, SystemData, ProgressLevel } from '../types';
import { PRIMARY_SUBJECTS, COMMON_SKILLS } from '../data/sampleData';
import { formatDateVN, exportProgressToCSV } from '../utils/storage';

interface ProgressTabProps {
  data: SystemData;
  onSaveProgress: (record: Omit<ProgressRecord, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteProgress: (id: string) => void;
  onDeleteMultipleProgress?: (ids: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  data,
  onSaveProgress,
  onDeleteProgress,
  onDeleteMultipleProgress,
  onShowToast,
}) => {
  const { classes, students, progressRecords } = data;

  // Filters
  const [filterClassId, setFilterClassId] = useState('');
  const [filterStudentId, setFilterStudentId] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProgressRecord | null>(null);

  // Delete Modals State (In-app custom confirmation, avoiding window.confirm)
  const [deletingRecord, setDeletingRecord] = useState<ProgressRecord | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Batch Selection State
  const [selectedRecordIds, setSelectedRecordIds] = useState<string[]>([]);

  // Form states
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formStudentId, setFormStudentId] = useState('');
  const [formSubject, setFormSubject] = useState(PRIMARY_SUBJECTS[0]);
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formTopic, setFormTopic] = useState('');
  const [formLevel, setFormLevel] = useState<ProgressLevel>('Hoàn thành');
  const [formTeacherComment, setFormTeacherComment] = useState('');
  const [formSupportAction, setFormSupportAction] = useState('');
  const [formError, setFormError] = useState('');

  // Fast Batch Assessment Mode Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchClassId, setBatchClassId] = useState(classes[0]?.id || '');
  const [batchSubject, setBatchSubject] = useState(PRIMARY_SUBJECTS[0]);
  const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchTopic, setBatchTopic] = useState('');
  const [batchAssessments, setBatchAssessments] = useState<
    Record<string, { level: ProgressLevel; comment: string; support: string }>
  >({});

  // Lookups
  const classMap = useMemo(() => {
    const map = new Map<string, Classroom>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // Students eligible for current filter selection
  const eligibleStudentsForFilter = useMemo(() => {
    if (!filterClassId) return students;
    return students.filter((s) => s.classId === filterClassId);
  }, [students, filterClassId]);

  // Students eligible for modal form selection
  const eligibleStudentsForForm = useMemo(() => {
    if (!formClassId) return students;
    return students.filter((s) => s.classId === formClassId);
  }, [students, formClassId]);

  // Students eligible for batch assessment
  const eligibleStudentsForBatch = useMemo(() => {
    if (!batchClassId) return [];
    return students.filter((s) => s.classId === batchClassId);
  }, [students, batchClassId]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return progressRecords
      .filter((r) => {
        const matchesClass = !filterClassId || r.classId === filterClassId;
        const matchesStudent = !filterStudentId || r.studentId === filterStudentId;
        const matchesSubject = !filterSubject || r.subject === filterSubject;
        const matchesLevel = !filterLevel || r.level === filterLevel;
        const matchesStart = !filterStartDate || r.date >= filterStartDate;
        const matchesEnd = !filterEndDate || r.date <= filterEndDate;
        return (
          matchesClass &&
          matchesStudent &&
          matchesSubject &&
          matchesLevel &&
          matchesStart &&
          matchesEnd
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    progressRecords,
    filterClassId,
    filterStudentId,
    filterSubject,
    filterLevel,
    filterStartDate,
    filterEndDate,
  ]);

  // Summary counts for filtered records
  const countGood = filteredRecords.filter((r) => r.level === 'Hoàn thành tốt').length;
  const countStandard = filteredRecords.filter((r) => r.level === 'Hoàn thành').length;
  const countNeedSupport = filteredRecords.filter((r) => r.level === 'Cần hỗ trợ thêm').length;
  const countUnassessed = filteredRecords.filter((r) => r.level === 'Chưa đánh giá').length;
  const totalFiltered = filteredRecords.length;

  const handleOpenAdd = () => {
    if (students.length === 0) {
      onShowToast('⚠️ Vui lòng thêm học sinh trước khi tạo bản ghi đánh giá tiến độ!');
      return;
    }
    const targetClass = filterClassId || classes[0]?.id || '';
    const classStudents = students.filter((s) => s.classId === targetClass);
    const targetStudent = filterStudentId || classStudents[0]?.id || students[0]?.id || '';

    setEditingRecord(null);
    setFormClassId(targetClass);
    setFormStudentId(targetStudent);
    setFormSubject(filterSubject || PRIMARY_SUBJECTS[0]);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormTopic('');
    setFormLevel('Hoàn thành');
    setFormTeacherComment('');
    setFormSupportAction('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: ProgressRecord) => {
    setEditingRecord(rec);
    setFormClassId(rec.classId);
    setFormStudentId(rec.studentId);
    setFormSubject(rec.subject);
    setFormDate(rec.date);
    setFormTopic(rec.topic);
    setFormLevel(rec.level);
    setFormTeacherComment(rec.teacherComment);
    setFormSupportAction(rec.supportAction || '');
    setFormError('');
    setIsModalOpen(true);
  };

  // Selection & Batch Delete Handlers
  const handleToggleSelectAll = () => {
    if (selectedRecordIds.length === filteredRecords.length && filteredRecords.length > 0) {
      setSelectedRecordIds([]);
    } else {
      setSelectedRecordIds(filteredRecords.map((r) => r.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedRecordIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmBulkDelete = () => {
    if (selectedRecordIds.length === 0) return;
    if (onDeleteMultipleProgress) {
      onDeleteMultipleProgress(selectedRecordIds);
    } else {
      selectedRecordIds.forEach((id) => onDeleteProgress(id));
      onShowToast(`Đã xóa ${selectedRecordIds.length} bản ghi đánh giá`);
    }
    setSelectedRecordIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formClassId || !formSubject || !formDate || !formTopic.trim() || !formTeacherComment.trim()) {
      setFormError('Vui lòng điền đầy đủ các mục bắt buộc (*)');
      return;
    }

    onSaveProgress(
      {
        studentId: formStudentId,
        classId: formClassId,
        subject: formSubject,
        date: formDate,
        topic: formTopic.trim(),
        level: formLevel,
        teacherComment: formTeacherComment.trim(),
        supportAction: formSupportAction.trim(),
      },
      editingRecord?.id
    );

    setIsModalOpen(false);
  };

  // Open Batch Assessment
  const handleOpenBatch = () => {
    if (classes.length === 0 || students.length === 0) {
      onShowToast('⚠️ Chưa có đủ dữ liệu lớp hoặc học sinh để đánh giá cả lớp!');
      return;
    }
    const initialCls = filterClassId || classes[0].id;
    setBatchClassId(initialCls);
    setBatchSubject(PRIMARY_SUBJECTS[0]);
    setBatchDate(new Date().toISOString().slice(0, 10));
    setBatchTopic('');
    
    // Init state for students in this class
    const initialAssess: Record<string, { level: ProgressLevel; comment: string; support: string }> = {};
    students.filter(s => s.classId === initialCls).forEach(s => {
      initialAssess[s.id] = {
        level: 'Hoàn thành',
        comment: 'Hoàn thành nhiệm vụ bài học.',
        support: '',
      };
    });
    setBatchAssessments(initialAssess);
    setIsBatchModalOpen(true);
  };

  const handleBatchClassChange = (clsId: string) => {
    setBatchClassId(clsId);
    const initialAssess: Record<string, { level: ProgressLevel; comment: string; support: string }> = {};
    students.filter(s => s.classId === clsId).forEach(s => {
      initialAssess[s.id] = {
        level: 'Hoàn thành',
        comment: 'Hoàn thành nhiệm vụ bài học.',
        support: '',
      };
    });
    setBatchAssessments(initialAssess);
  };

  const handleSaveBatch = () => {
    if (!batchTopic.trim()) {
      alert('Vui lòng nhập nội dung hoặc kỹ năng bài học cần đánh giá!');
      return;
    }
    const targetStudents = students.filter(s => s.classId === batchClassId);
    if (targetStudents.length === 0) return;

    targetStudents.forEach(s => {
      const assess = batchAssessments[s.id] || { level: 'Hoàn thành', comment: 'Đạt yêu cầu', support: '' };
      onSaveProgress({
        studentId: s.id,
        classId: batchClassId,
        subject: batchSubject,
        date: batchDate,
        topic: batchTopic.trim(),
        level: assess.level,
        teacherComment: assess.comment.trim() || 'Hoàn thành yêu cầu tiết học.',
        supportAction: assess.support.trim(),
      });
    });

    onShowToast(`Đã lưu đánh giá tiến độ cho ${targetStudents.length} học sinh lớp ${classMap.get(batchClassId)?.name}!`);
    setIsBatchModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Sổ Theo Dõi Tiến Độ Học Tập – Thông tư 27/2020/TT-BGDĐT
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Đánh giá định kỳ và thường xuyên các môn học, ghi nhận năng lực và đề xuất biện pháp hỗ trợ
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="In sổ theo dõi theo mẫu Bộ GD&ĐT"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              In sổ theo dõi
            </button>
            <button
              onClick={() => exportProgressToCSV(progressRecords, students, classes)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Xuất CSV
            </button>
            <button
              onClick={handleOpenBatch}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-600" />
              Đánh giá cả lớp
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm đánh giá
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Chọn Lớp</label>
            <select
              value={filterClassId}
              onChange={(e) => {
                setFilterClassId(e.target.value);
                setFilterStudentId('');
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Tất cả các lớp</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Chọn Học Sinh</label>
            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Tất cả học sinh</option>
              {eligibleStudentsForFilter.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Môn Học</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Tất cả môn học</option>
              {PRIMARY_SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Mức Độ Đạt Được</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">Tất cả mức độ</option>
              <option value="Hoàn thành tốt">Hoàn thành tốt (T)</option>
              <option value="Hoàn thành">Hoàn thành (H)</option>
              <option value="Cần hỗ trợ thêm">Cần hỗ trợ thêm (C)</option>
              <option value="Chưa đánh giá">Chưa đánh giá</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Khoảng Thời Gian</label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-1.5 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg"
                title="Từ ngày"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-1.5 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg"
                title="Đến ngày"
              />
            </div>
          </div>
        </div>

        {/* Quick KPI summary bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-4">
            <span className="text-slate-500">
              Tổng số lượt đánh giá: <strong className="text-slate-900">{totalFiltered}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tốt: {countGood} ({totalFiltered > 0 ? Math.round((countGood / totalFiltered) * 100) : 0}%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
              Hoàn thành: {countStandard} ({totalFiltered > 0 ? Math.round((countStandard / totalFiltered) * 100) : 0}%)
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5" />
              Cần hỗ trợ: {countNeedSupport} ({totalFiltered > 0 ? Math.round((countNeedSupport / totalFiltered) * 100) : 0}%)
            </span>
          </div>

          {(filterClassId || filterStudentId || filterSubject || filterLevel || filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterClassId('');
                setFilterStudentId('');
                setFilterSubject('');
                setFilterLevel('');
                setFilterStartDate('');
                setFilterEndDate('');
              }}
              className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Progress Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Bulk Selection Action Bar */}
        {selectedRecordIds.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-red-900 font-semibold">
              <span>
                Đã chọn{' '}
                <strong className="text-red-700 font-bold bg-white px-2 py-0.5 rounded-full border border-red-200">
                  {selectedRecordIds.length}
                </strong>{' '}
                bản ghi đánh giá
              </span>
              <button
                type="button"
                onClick={() => setSelectedRecordIds([])}
                className="text-[11px] font-medium text-red-600 hover:text-red-800 underline cursor-pointer ml-2"
              >
                Bỏ chọn tất cả
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa {selectedRecordIds.length} bản ghi đã chọn
            </button>
          </div>
        )}

        {filteredRecords.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Không có bản ghi tiến độ nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Không có dữ liệu phù hợp với bộ lọc hiện tại. Thầy Tri có thể bấm &quot;Thêm đánh giá&quot; hoặc &quot;Đánh giá cả lớp&quot; để ghi nhận kết quả.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredRecords.length > 0 &&
                        selectedRecordIds.length === filteredRecords.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4"
                      title="Chọn tất cả bản ghi đang hiển thị"
                    />
                  </th>
                  <th className="py-3 px-3 font-bold">Ngày ĐG</th>
                  <th className="py-3 px-3 font-bold">Học sinh</th>
                  <th className="py-3 px-3 font-bold">Lớp</th>
                  <th className="py-3 px-3 font-bold">Môn học</th>
                  <th className="py-3 px-3 font-bold">Nội dung / Kỹ năng</th>
                  <th className="py-3 px-3 font-bold">Mức độ đạt được</th>
                  <th className="py-3 px-3 font-bold">Nhận xét của thầy Tri</th>
                  <th className="py-3 px-3 font-bold">Kế hoạch hỗ trợ tiếp theo</th>
                  <th className="py-3 px-3 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const student = studentMap.get(rec.studentId);
                  const cls = classMap.get(rec.classId);

                  let levelBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (rec.level === 'Hoàn thành tốt') {
                    levelBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (rec.level === 'Cần hỗ trợ thêm') {
                    levelBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else if (rec.level === 'Chưa đánh giá') {
                    levelBadgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
                  }

                  const isRowSelected = selectedRecordIds.includes(rec.id);

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isRowSelected ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isRowSelected}
                          onChange={() => handleToggleSelectRow(rec.id)}
                          className="rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold whitespace-nowrap">
                        {formatDateVN(rec.date)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{student?.fullName || 'Học sinh'}</div>
                        <div className="text-[10px] text-slate-400">{student?.code}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-100 text-slate-700">
                          {cls?.name || '--'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {rec.subject}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 max-w-[200px]" title={rec.topic}>
                        {rec.topic}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] border ${levelBadgeClass}`}>
                          {rec.level}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[240px] leading-relaxed" title={rec.teacherComment}>
                        {rec.teacherComment}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[200px] leading-relaxed" title={rec.supportAction}>
                        {rec.supportAction ? (
                          <span className="text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded border border-amber-100 inline-block">
                            {rec.supportAction}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">--</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(rec)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa đánh giá"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingRecord(rec)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa đánh giá này"
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
      </div>

      {/* Add / Edit Progress Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                {editingRecord ? 'Chỉnh sửa bản ghi đánh giá' : 'Thêm đánh giá tiến độ học tập'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                    Lớp học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formClassId}
                    onChange={(e) => {
                      const newCls = e.target.value;
                      setFormClassId(newCls);
                      const classStudents = students.filter((s) => s.classId === newCls);
                      if (classStudents.length > 0) {
                        setFormStudentId(classStudents[0].id);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold"
                    required
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Học sinh <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    required
                  >
                    {eligibleStudentsForForm.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    required
                  >
                    {PRIMARY_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ngày đánh giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Nội dung hoặc kỹ năng được đánh giá <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Gợi ý kỹ năng thường gặp</span>
                </div>
                <input
                  type="text"
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="VD: Đọc hiểu văn bản, Cộng trừ có nhớ..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  required
                />
                
                {/* Skill suggestion chips */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  {COMMON_SKILLS.slice(0, 4).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setFormTopic(skill)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mức độ hoàn thành (Theo Thông tư 27) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Hoàn thành tốt', 'Hoàn thành', 'Cần hỗ trợ thêm', 'Chưa đánh giá'] as ProgressLevel[]).map(
                    (lvl) => {
                      const isSelected = formLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormLevel(lvl)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            isSelected
                              ? lvl === 'Hoàn thành tốt'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : lvl === 'Cần hỗ trợ thêm'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận xét của giáo viên (Thầy Tri) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formTeacherComment}
                  onChange={(e) => setFormTeacherComment(e.target.value)}
                  rows={2}
                  placeholder="Ghi nhận cụ thể mức độ tiến bộ, năng lực làm bài..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đề xuất hỗ trợ hoặc hoạt động tiếp theo
                </label>
                <textarea
                  value={formSupportAction}
                  onChange={(e) => setFormSupportAction(e.target.value)}
                  rows={2}
                  placeholder="VD: Hướng dẫn riêng 10 phút sau giờ cơm bán trú, phân công bạn giúp đỡ..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {editingRecord ? (
                  <button
                    type="button"
                    onClick={() => {
                      const toDelete = editingRecord;
                      setIsModalOpen(false);
                      setDeletingRecord(toDelete);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa đánh giá này
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    {editingRecord ? 'Lưu cập nhật' : 'Ghi nhận đánh giá'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Assessment Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Đánh giá nhanh theo lớp (Cập nhật hàng loạt)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ghi nhận kết quả tiết học cho tất cả học sinh trong một buổi đánh giá
                </p>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn lớp học</label>
                <select
                  value={batchClassId}
                  onChange={(e) => handleBatchClassChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                <select
                  value={batchSubject}
                  onChange={(e) => setBatchSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                >
                  {PRIMARY_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày đánh giá</label>
                <input
                  type="date"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung hoặc kỹ năng tiết học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={batchTopic}
                  onChange={(e) => setBatchTopic(e.target.value)}
                  placeholder="VD: Luyện đọc đoạn văn và trả lời câu hỏi 1, 2..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-12 text-center">STT</th>
                      <th className="p-2.5">Học sinh</th>
                      <th className="p-2.5 w-48">Mức độ đạt được</th>
                      <th className="p-2.5">Nhận xét cụ thể</th>
                      <th className="p-2.5">Biện pháp hỗ trợ (nếu cần)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibleStudentsForBatch.map((s, idx) => {
                      const assess = batchAssessments[s.id] || {
                        level: 'Hoàn thành',
                        comment: 'Hoàn thành nhiệm vụ bài học.',
                        support: '',
                      };

                      return (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2.5">
                            <strong className="text-slate-900">{s.fullName}</strong>
                            <div className="text-[10px] text-slate-400">{s.code}</div>
                          </td>
                          <td className="p-2.5">
                            <select
                              value={assess.level}
                              onChange={(e) => {
                                const newLvl = e.target.value as ProgressLevel;
                                setBatchAssessments((prev) => ({
                                  ...prev,
                                  [s.id]: { ...assess, level: newLvl },
                                }));
                              }}
                              className={`w-full px-2 py-1 rounded text-xs font-bold border ${
                                assess.level === 'Hoàn thành tốt'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : assess.level === 'Cần hỗ trợ thêm'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                                  : 'bg-blue-50 text-blue-700 border-blue-300'
                              }`}
                            >
                              <option value="Hoàn thành tốt">Hoàn thành tốt</option>
                              <option value="Hoàn thành">Hoàn thành</option>
                              <option value="Cần hỗ trợ thêm">Cần hỗ trợ thêm</option>
                              <option value="Chưa đánh giá">Chưa đánh giá</option>
                            </select>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={assess.comment}
                              onChange={(e) => {
                                const text = e.target.value;
                                setBatchAssessments((prev) => ({
                                  ...prev,
                                  [s.id]: { ...assess, comment: text },
                                }));
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={assess.support}
                              placeholder="Nếu cần..."
                              onChange={(e) => {
                                const text = e.target.value;
                                setBatchAssessments((prev) => ({
                                  ...prev,
                                  [s.id]: { ...assess, support: text },
                                }));
                              }}
                              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveBatch}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Lưu toàn bộ đánh giá lớp ({eligibleStudentsForBatch.length} HS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable template view (rendered only during print or preview) */}
      <div className="hidden print:block text-black bg-white p-6 font-serif">
        <div className="text-center mb-6">
          <div className="text-xs uppercase font-bold tracking-wider">
            PHÒNG GIÁO DỤC VÀ ĐÀO TẠO HUYỆN TU MƠ RÔNG
          </div>
          <div className="text-sm uppercase font-extrabold mt-0.5">
            TRƯỜNG PHỔ THÔNG DÂN TỘC BÁN TRÚ TIỂU HỌC TU MƠ RÔNG
          </div>
          <div className="w-32 h-0.5 bg-black mx-auto my-2" />
          <h2 className="text-base font-extrabold uppercase mt-2">
            SỔ THEO DÕI TIẾN ĐỘ VÀ KẾT QUẢ ĐÁNH GIÁ HỌC TẬP
          </h2>
          <div className="text-xs italic mt-1">
            Giáo viên phụ trách: <strong>NGUYỄN VIẾT TRI</strong> • Năm học: 2026 - 2027
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-2 text-center w-8">STT</th>
              <th className="border border-black p-2">Mã HS</th>
              <th className="border border-black p-2">Họ và tên học sinh</th>
              <th className="border border-black p-2">Lớp</th>
              <th className="border border-black p-2">Môn học</th>
              <th className="border border-black p-2">Ngày ĐG</th>
              <th className="border border-black p-2">Nội dung / Kỹ năng đánh giá</th>
              <th className="border border-black p-2">Mức độ</th>
              <th className="border border-black p-2">Nhận xét của giáo viên</th>
              <th className="border border-black p-2">Biện pháp hỗ trợ</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r, i) => {
              const s = studentMap.get(r.studentId);
              const c = classMap.get(r.classId);
              return (
                <tr key={r.id}>
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2 font-bold">{s?.code}</td>
                  <td className="border border-black p-2 font-bold">{s?.fullName}</td>
                  <td className="border border-black p-2 text-center">{c?.name}</td>
                  <td className="border border-black p-2">{r.subject}</td>
                  <td className="border border-black p-2 text-center">{formatDateVN(r.date)}</td>
                  <td className="border border-black p-2">{r.topic}</td>
                  <td className="border border-black p-2 font-bold text-center">{r.level}</td>
                  <td className="border border-black p-2">{r.teacherComment}</td>
                  <td className="border border-black p-2">{r.supportAction || '--'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 flex justify-between text-xs px-6">
          <div className="text-center">
            <div className="font-bold">XÁC NHẬN CỦA BAN GIÁM HIỆU</div>
            <div className="italic text-[11px]">(Ký và ghi rõ họ tên)</div>
          </div>
          <div className="text-center">
            <div className="italic mb-1">
              Tu Mơ Rông, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </div>
            <div className="font-bold">GIÁO VIÊN PHỤ TRÁCH</div>
            <div className="italic text-[11px] mb-12">(Ký và ghi rõ họ tên)</div>
            <div className="font-bold text-sm">NGUYỄN VIẾT TRI</div>
          </div>
        </div>
      </div>

      {/* Delete Single Progress Record Modal */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa bản ghi đánh giá tiến độ?
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Dữ liệu đánh giá học tập này sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </p>

              <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học sinh:</span>
                  <span className="font-bold text-slate-900">
                    {studentMap.get(deletingRecord.studentId)?.fullName || 'Học sinh'} (
                    {studentMap.get(deletingRecord.studentId)?.code})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lớp học:</span>
                  <span className="font-semibold text-slate-800">
                    {classMap.get(deletingRecord.classId)?.name || '--'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Môn học:</span>
                  <span className="font-bold text-blue-700">{deletingRecord.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày đánh giá:</span>
                  <span className="font-medium text-slate-800">
                    {formatDateVN(deletingRecord.date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mức độ đạt:</span>
                  <span className="font-bold text-emerald-700">{deletingRecord.level}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/70 mt-1.5">
                  <span className="text-slate-500 block text-[11px]">Nội dung / Kỹ năng:</span>
                  <span className="font-medium text-slate-800">{deletingRecord.topic}</span>
                </div>
                {deletingRecord.teacherComment && (
                  <div className="mt-1">
                    <span className="text-slate-500 block text-[11px]">Nhận xét của thầy:</span>
                    <span className="text-slate-700 italic">
                      &ldquo;{deletingRecord.teacherComment}&rdquo;
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProgress(deletingRecord.id);
                  setDeletingRecord(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Multiple Progress Records Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-5">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Xóa {selectedRecordIds.length} bản ghi đánh giá đã chọn?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Thầy Tri đang chọn xóa đồng thời <strong>{selectedRecordIds.length}</strong> bản ghi theo dõi tiến độ học tập.
                Sau khi xóa, dữ liệu sẽ được cập nhật lại vào bảng và thống kê trên hệ thống.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Đồng ý xóa {selectedRecordIds.length} bản ghi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
