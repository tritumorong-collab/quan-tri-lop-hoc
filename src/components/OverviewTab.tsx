import React from 'react';
import {
  School,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { SystemData, Student, Classroom, ProgressRecord } from '../types';
import { formatDateVN, formatDateTimeVN } from '../utils/storage';

interface OverviewTabProps {
  data: SystemData;
  onOpenAddClass: () => void;
  onOpenAddStudent: () => void;
  onOpenAddProgress: () => void;
  onNavigateToTab: (tab: 'classes' | 'students' | 'progress') => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  data,
  onOpenAddClass,
  onOpenAddStudent,
  onOpenAddProgress,
  onNavigateToTab,
  onSelectStudentDetail,
}) => {
  const { classes, students, progressRecords, activityLogs } = data;

  // 1. Dynamic Statistics Calculations
  const totalClasses = classes.length;
  const totalStudents = students.length;

  // Students who have at least one evaluation
  const evaluatedStudentIdSet = new Set(progressRecords.map((r) => r.studentId));
  const trackingStudentsCount = evaluatedStudentIdSet.size;

  // Students with good progress: have latest evaluation 'Hoàn thành tốt'
  // Or high achievement
  const goodProgressRecords = progressRecords.filter((r) => r.level === 'Hoàn thành tốt');
  const goodProgressStudentIds = new Set(goodProgressRecords.map((r) => r.studentId));
  const goodProgressCount = goodProgressStudentIds.size;

  // Students needing extra support: have evaluations with 'Cần hỗ trợ thêm'
  const needSupportRecords = progressRecords.filter((r) => r.level === 'Cần hỗ trợ thêm');
  const needSupportStudentIds = new Set(needSupportRecords.map((r) => r.studentId));
  const needSupportCount = needSupportStudentIds.size;

  // Lookups
  const classMap = new Map<string, Classroom>();
  classes.forEach((c) => classMap.set(c.id, c));

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  // Students of concern list: Unique list of students with 'Cần hỗ trợ thêm' records, sorted by latest date
  const studentsOfConcernMap = new Map<string, { student: Student; latestRecord: ProgressRecord; count: number }>();
  needSupportRecords.forEach((rec) => {
    const student = studentMap.get(rec.studentId);
    if (!student) return;
    const existing = studentsOfConcernMap.get(rec.studentId);
    if (!existing) {
      studentsOfConcernMap.set(rec.studentId, {
        student,
        latestRecord: rec,
        count: 1,
      });
    } else {
      existing.count += 1;
      if (new Date(rec.date) > new Date(existing.latestRecord.date)) {
        existing.latestRecord = rec;
      }
    }
  });

  const studentsOfConcernList = Array.from(studentsOfConcernMap.values());

  // Class distribution data for SVG chart
  const classDistribution = classes.map((c) => {
    const count = students.filter((s) => s.classId === c.id).length;
    return {
      classId: c.id,
      code: c.code,
      name: c.name,
      count,
    };
  });
  const maxClassCount = Math.max(...classDistribution.map((d) => d.count), 5);

  // Level counts for progress evaluation
  const completedGood = progressRecords.filter((r) => r.level === 'Hoàn thành tốt').length;
  const completedStandard = progressRecords.filter((r) => r.level === 'Hoàn thành').length;
  const needSupportTotal = progressRecords.filter((r) => r.level === 'Cần hỗ trợ thêm').length;
  const totalEvaluations = progressRecords.length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-xs font-medium mb-2 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            Năm học 2026 - 2027 • Điểm trường Tu Mơ Rông
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Kính chào thầy giáo Nguyễn Viết Tri!
          </h2>
          <p className="mt-1 text-sm text-blue-100 leading-relaxed">
            Hệ thống quản trị lớp học đã sẵn sàng. Toàn bộ thông tin sĩ số, hồ sơ học sinh và các bản ghi nhận xét tiến độ được đồng bộ theo thời gian thực.
          </p>

          <div className="flex items-center flex-wrap gap-2.5 mt-4">
            <button
              onClick={onOpenAddClass}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-800 text-xs font-bold rounded-lg hover:bg-blue-50 shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              Thêm lớp học
            </button>
            <button
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/40 hover:bg-blue-500/60 text-white text-xs font-bold rounded-lg border border-blue-400/30 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm học sinh
            </button>
            <button
              onClick={onOpenAddProgress}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Cập nhật tiến độ
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <School className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* 5 Statistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Tổng số lớp */}
        <div
          onClick={() => onNavigateToTab('classes')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng số lớp
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalClasses}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Lớp phụ trách</span>
            <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              Xem →
            </span>
          </div>
        </div>

        {/* Card 2: Tổng số học sinh */}
        <div
          onClick={() => onNavigateToTab('students')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tổng số học sinh
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalStudents}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Đã lập hồ sơ</span>
            <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              Xem →
            </span>
          </div>
        </div>

        {/* Card 3: Đang theo dõi tiến độ */}
        <div
          onClick={() => onNavigateToTab('progress')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Đang theo dõi tiến độ
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{trackingStudentsCount}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {totalStudents > 0
                ? `${Math.round((trackingStudentsCount / totalStudents) * 100)}% tổng sĩ số`
                : 'Chưa có HS'}
            </span>
            <span className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              Sổ theo dõi →
            </span>
          </div>
        </div>

        {/* Card 4: Học sinh có tiến bộ */}
        <div
          onClick={() => onNavigateToTab('progress')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-green-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Có tiến bộ tốt
            </span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-green-700">{goodProgressCount}</div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Đạt Hoàn thành tốt</span>
            <span className="text-green-600 font-semibold">Tuyên dương</span>
          </div>
        </div>

        {/* Card 5: Cần hỗ trợ thêm */}
        <div
          onClick={() => onNavigateToTab('progress')}
          className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Cần hỗ trợ thêm
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{needSupportCount}</div>
          <div className="mt-1 text-xs text-amber-700 flex items-center justify-between">
            <span>Kế hoạch bồi dưỡng</span>
            <span className="font-semibold group-hover:translate-x-0.5 transition-transform">
              Xem ngay →
            </span>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Phân bố học sinh theo lớp */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                Phân bố học sinh theo lớp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Sĩ số thực tế các lớp điểm trường Tu Mơ Rông</p>
            </div>
            <button
              onClick={() => onNavigateToTab('classes')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Chi tiết lớp <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <School className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Chưa có lớp học nào được tạo.</p>
              <button
                onClick={onOpenAddClass}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                + Thêm lớp học đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {classDistribution.map((item) => {
                const percent = Math.round((item.count / maxClassCount) * 100);
                return (
                  <div key={item.classId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="font-semibold text-slate-600">
                        {item.count} học sinh
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart 2: Tỷ lệ mức độ tiến độ học tập */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Tổng hợp mức độ hoàn thành học tập
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dựa trên {totalEvaluations} lượt đánh giá theo Thông tư 27</p>
            </div>
            <button
              onClick={() => onNavigateToTab('progress')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              Mở sổ theo dõi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {totalEvaluations === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Chưa có bản ghi đánh giá tiến độ học tập.</p>
              <button
                onClick={onOpenAddProgress}
                className="mt-2 text-xs font-bold text-emerald-600 hover:underline"
              >
                + Ghi nhận đánh giá đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {/* Hoàn thành tốt */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Hoàn thành tốt (T)
                  </span>
                  <span className="font-semibold text-slate-700">
                    {completedGood} lượt ({Math.round((completedGood / totalEvaluations) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(completedGood / totalEvaluations) * 100}%` }}
                  />
                </div>
              </div>

              {/* Hoàn thành */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-blue-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    Hoàn thành (H)
                  </span>
                  <span className="font-semibold text-slate-700">
                    {completedStandard} lượt ({Math.round((completedStandard / totalEvaluations) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(completedStandard / totalEvaluations) * 100}%` }}
                  />
                </div>
              </div>

              {/* Cần hỗ trợ thêm */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-amber-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Cần hỗ trợ thêm (C)
                  </span>
                  <span className="font-semibold text-slate-700">
                    {needSupportTotal} lượt ({Math.round((needSupportTotal / totalEvaluations) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(needSupportTotal / totalEvaluations) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Quy chuẩn Thông tư 27/2020/TT-BGDĐT</span>
                <span className="text-emerald-700 font-semibold">Tỷ lệ đạt chuẩn: {Math.round(((completedGood + completedStandard) / totalEvaluations) * 100)}%</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Section: Học sinh cần quan tâm & Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Học sinh cần quan tâm (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Danh sách học sinh cần quan tâm bồi dưỡng
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các em có đánh giá &quot;Cần hỗ trợ thêm&quot; gần đây để thầy Tri lên kế hoạch kèm cặp
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('progress')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {studentsOfConcernList.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-700">
                Tuyệt vời! Hiện tại không có học sinh nào ở mức cần hỗ trợ thêm.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tất cả học sinh đều đang hoàn thành tốt hoặc hoàn thành nhiệm vụ học tập.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-2.5 px-3 font-bold">Mã HS</th>
                    <th className="py-2.5 px-3 font-bold">Họ và tên</th>
                    <th className="py-2.5 px-3 font-bold">Lớp</th>
                    <th className="py-2.5 px-3 font-bold">Môn học</th>
                    <th className="py-2.5 px-3 font-bold">Nội dung vướng mắc</th>
                    <th className="py-2.5 px-3 font-bold">Biện pháp hỗ trợ của thầy Tri</th>
                    <th className="py-2.5 px-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsOfConcernList.slice(0, 5).map(({ student, latestRecord }) => {
                    const cls = classMap.get(student.classId);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {student.code}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {student.fullName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[11px]">
                            {cls ? cls.name : '--'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {latestRecord.subject}
                        </td>
                        <td className="py-2.5 px-3 text-amber-800 max-w-[160px] truncate" title={latestRecord.topic}>
                          {latestRecord.topic}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[200px] truncate" title={latestRecord.supportAction || latestRecord.teacherComment}>
                          {latestRecord.supportAction || latestRecord.teacherComment}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onSelectStudentDetail(student)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-md transition-colors cursor-pointer"
                          >
                            Hồ sơ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Hoạt động gần đây (1 col on large screen) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              Hoạt động gần đây
            </h3>
            <span className="text-[11px] text-slate-400 font-semibold">Nhật ký</span>
          </div>

          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có hoạt động nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTimeVN(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
