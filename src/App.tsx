import React, { useState, useEffect, useCallback } from 'react';
import {
  TabType,
  SystemData,
  Classroom,
  Student,
  ProgressRecord,
} from './types';
import {
  loadStoredData,
  saveStoredData,
  createActivityLog,
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { ClassesTab } from './components/ClassesTab';
import { StudentsTab } from './components/StudentsTab';
import { ProgressTab } from './components/ProgressTab';
import { BackupModal } from './components/BackupModal';
import { Toast } from './components/Toast';

export default function App() {
  const [data, setData] = useState<SystemData>(() => loadStoredData());
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Jump filter state when navigating from class to students
  const [studentClassFilter, setStudentClassFilter] = useState<string>('');

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Sync to localStorage
  const updateDataAndSave = useCallback((newData: SystemData) => {
    setData(newData);
    saveStoredData(newData);
  }, []);

  // Class Management Handlers
  const handleSaveClass = useCallback(
    (classData: Omit<Classroom, 'id' | 'createdAt'>, editingId?: string) => {
      setData((prev) => {
        let updatedClasses: Classroom[];
        let logText = '';

        if (editingId) {
          updatedClasses = prev.classes.map((c) =>
            c.id === editingId ? { ...c, ...classData } : c
          );
          logText = `Đã cập nhật thông tin lớp ${classData.name}`;
          showToast(`Đã lưu thay đổi lớp ${classData.name}`);
        } else {
          const newClass: Classroom = {
            id: 'cls-' + Date.now(),
            ...classData,
            createdAt: new Date().toISOString(),
          };
          updatedClasses = [...prev.classes, newClass];
          logText = `Đã tạo lớp học mới ${classData.name} (${classData.academicYear})`;
          showToast(`Đã tạo thành công lớp ${classData.name}`);
        }

        const newLog = createActivityLog('Quản lý lớp học', logText, 'class');
        const nextData: SystemData = {
          ...prev,
          classes: updatedClasses,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        return nextData;
      });
    },
    [showToast]
  );

  const handleDeleteClass = useCallback(
    (classId: string) => {
      setData((prev) => {
        const targetClass = prev.classes.find((c) => c.id === classId);
        const className = targetClass?.name || 'Lớp học';
        const updatedClasses = prev.classes.filter((c) => c.id !== classId);

        const newLog = createActivityLog(
          'Xóa lớp học',
          `Đã xóa lớp ${className} khỏi hệ thống`,
          'class'
        );
        const nextData: SystemData = {
          ...prev,
          classes: updatedClasses,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        showToast(`Đã xóa lớp ${className}`);
        return nextData;
      });
    },
    [showToast]
  );

  const handleViewClassStudents = useCallback((classId: string) => {
    setStudentClassFilter(classId);
    setCurrentTab('students');
  }, []);

  // Student Management Handlers
  const handleSaveStudent = useCallback(
    (studentData: Omit<Student, 'id' | 'createdAt'>, editingId?: string) => {
      setData((prev) => {
        let updatedStudents: Student[];
        let logText = '';

        if (editingId) {
          updatedStudents = prev.students.map((s) =>
            s.id === editingId ? { ...s, ...studentData } : s
          );
          logText = `Đã cập nhật hồ sơ em ${studentData.fullName} (${studentData.code})`;
          showToast(`Đã lưu cập nhật cho em ${studentData.fullName}`);
        } else {
          const newStudent: Student = {
            id: 'std-' + Date.now(),
            ...studentData,
            createdAt: new Date().toISOString(),
          };
          updatedStudents = [...prev.students, newStudent];
          logText = `Đã thêm học sinh mới: ${studentData.fullName} (${studentData.code})`;
          showToast(`Đã thêm học sinh ${studentData.fullName}`);
        }

        const newLog = createActivityLog('Hồ sơ học sinh', logText, 'student');
        const nextData: SystemData = {
          ...prev,
          students: updatedStudents,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        return nextData;
      });
    },
    [showToast]
  );

  const handleDeleteStudent = useCallback(
    (studentId: string) => {
      setData((prev) => {
        const student = prev.students.find((s) => s.id === studentId);
        const name = student?.fullName || 'Học sinh';
        const updatedStudents = prev.students.filter((s) => s.id !== studentId);

        const newLog = createActivityLog(
          'Xóa học sinh',
          `Đã xóa hồ sơ học sinh ${name}`,
          'student'
        );
        const nextData: SystemData = {
          ...prev,
          students: updatedStudents,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        showToast(`Đã xóa học sinh ${name}`);
        return nextData;
      });
    },
    [showToast]
  );

  const handleTransferStudent = useCallback(
    (studentId: string, targetClassId: string) => {
      setData((prev) => {
        const student = prev.students.find((s) => s.id === studentId);
        const targetClass = prev.classes.find((c) => c.id === targetClassId);
        if (!student || !targetClass) return prev;

        const updatedStudents = prev.students.map((s) =>
          s.id === studentId ? { ...s, classId: targetClassId } : s
        );

        const newLog = createActivityLog(
          'Chuyển lớp học sinh',
          `Đã chuyển em ${student.fullName} sang lớp ${targetClass.name}`,
          'student'
        );

        const nextData: SystemData = {
          ...prev,
          students: updatedStudents,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        showToast(`Đã chuyển em ${student.fullName} sang ${targetClass.name}!`);
        return nextData;
      });
    },
    [showToast]
  );

  const handleImportStudents = useCallback(
    (importedList: Omit<Student, 'id' | 'createdAt'>[]) => {
      setData((prev) => {
        const newStudents: Student[] = importedList.map((item, idx) => ({
          ...item,
          id: 'std-imp-' + Date.now() + '-' + idx,
          createdAt: new Date().toISOString(),
        }));

        const updatedStudents = [...prev.students, ...newStudents];
        const newLog = createActivityLog(
          'Nhập danh sách học sinh',
          `Đã nhập thành công ${newStudents.length} học sinh từ tệp CSV`,
          'student'
        );

        const nextData: SystemData = {
          ...prev,
          students: updatedStudents,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        showToast(`Đã nhập thành công ${newStudents.length} học sinh từ tệp CSV!`);
        return nextData;
      });
    },
    [showToast]
  );

  // Progress Evaluation Handlers
  const handleSaveProgress = useCallback(
    (record: Omit<ProgressRecord, 'id' | 'createdAt'>, editingId?: string) => {
      setData((prev) => {
        let updatedRecords: ProgressRecord[];
        const student = prev.students.find((s) => s.id === record.studentId);
        const studentName = student ? student.fullName : 'học sinh';
        let logText = '';

        if (editingId) {
          updatedRecords = prev.progressRecords.map((r) =>
            r.id === editingId ? { ...r, ...record } : r
          );
          logText = `Đã sửa nhận xét môn ${record.subject} của em ${studentName}`;
          showToast(`Đã lưu thay đổi đánh giá cho em ${studentName}`);
        } else {
          const newRecord: ProgressRecord = {
            id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            ...record,
            createdAt: new Date().toISOString(),
          };
          updatedRecords = [newRecord, ...prev.progressRecords];
          logText = `Đã đánh giá môn ${record.subject} (${record.level}) cho em ${studentName}`;
          showToast(`Đã lưu đánh giá tiến độ cho em ${studentName}`);
        }

        const newLog = createActivityLog('Tiến độ học tập', logText, 'progress');
        const nextData: SystemData = {
          ...prev,
          progressRecords: updatedRecords,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        return nextData;
      });
    },
    [showToast]
  );

  const handleDeleteProgress = useCallback(
    (id: string) => {
      setData((prev) => {
        const targetRecord = prev.progressRecords.find((r) => r.id === id);
        const student = targetRecord ? prev.students.find((s) => s.id === targetRecord.studentId) : null;
        const studentName = student ? student.fullName : 'học sinh';
        const subject = targetRecord?.subject || 'môn học';

        const updatedRecords = prev.progressRecords.filter((r) => r.id !== id);
        const newLog = createActivityLog(
          'Xóa đánh giá',
          `Đã xóa bản ghi đánh giá môn ${subject} của em ${studentName}`,
          'progress'
        );
        const nextData: SystemData = {
          ...prev,
          progressRecords: updatedRecords,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        showToast(`Đã xóa bản ghi đánh giá môn ${subject} của em ${studentName}`);
        return nextData;
      });
    },
    [showToast]
  );

  const handleDeleteMultipleProgress = useCallback(
    (ids: string[]) => {
      if (!ids || ids.length === 0) return;
      setData((prev) => {
        const idSet = new Set(ids);
        const updatedRecords = prev.progressRecords.filter((r) => !idSet.has(r.id));
        const newLog = createActivityLog(
          'Xóa đánh giá',
          `Đã xóa ${ids.length} bản ghi theo dõi tiến độ học tập`,
          'progress'
        );
        const nextData: SystemData = {
          ...prev,
          progressRecords: updatedRecords,
          activityLogs: [newLog, ...(prev.activityLogs || [])].slice(0, 30),
        };
        saveStoredData(nextData);
        showToast(`Đã xóa thành công ${ids.length} bản ghi đánh giá`);
        return nextData;
      });
    },
    [showToast]
  );

  // Quick Action Modal openers
  const [quickAddClassTrigger, setQuickAddClassTrigger] = useState(0);
  const [quickAddStudentTrigger, setQuickAddStudentTrigger] = useState(0);
  const [quickAddProgressTrigger, setQuickAddProgressTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        data={data}
        onOpenAddClass={() => {
          setCurrentTab('classes');
          setQuickAddClassTrigger((t) => t + 1);
        }}
        onOpenAddStudent={() => {
          setCurrentTab('students');
          setQuickAddStudentTrigger((t) => t + 1);
        }}
        onOpenAddProgress={() => {
          setCurrentTab('progress');
          setQuickAddProgressTrigger((t) => t + 1);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onShowToast={showToast}
      />

      {/* Main Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          data={data}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* TAB 1: TỔNG QUAN */}
          {currentTab === 'overview' && (
            <OverviewTab
              data={data}
              onOpenAddClass={() => {
                setCurrentTab('classes');
                setQuickAddClassTrigger((t) => t + 1);
              }}
              onOpenAddStudent={() => {
                setCurrentTab('students');
                setQuickAddStudentTrigger((t) => t + 1);
              }}
              onOpenAddProgress={() => {
                setCurrentTab('progress');
                setQuickAddProgressTrigger((t) => t + 1);
              }}
              onNavigateToTab={(tab) => {
                if (tab === 'students') setStudentClassFilter('');
                setCurrentTab(tab);
              }}
              onSelectStudentDetail={(student) => {
                setStudentClassFilter('');
                setCurrentTab('students');
              }}
            />
          )}

          {/* TAB 2: LỚP HỌC */}
          {currentTab === 'classes' && (
            <ClassesTab
              key={`classes-${quickAddClassTrigger}`}
              data={data}
              onSaveClass={handleSaveClass}
              onDeleteClass={handleDeleteClass}
              onViewClassStudents={handleViewClassStudents}
              onShowToast={showToast}
            />
          )}

          {/* TAB 3: HỌC SINH */}
          {currentTab === 'students' && (
            <StudentsTab
              key={`students-${quickAddStudentTrigger}`}
              data={data}
              initialClassFilter={studentClassFilter}
              onSaveStudent={handleSaveStudent}
              onDeleteStudent={handleDeleteStudent}
              onTransferStudent={handleTransferStudent}
              onImportStudents={handleImportStudents}
              onShowToast={showToast}
            />
          )}

          {/* TAB 4: TIẾN ĐỘ HỌC TẬP */}
          {currentTab === 'progress' && (
            <ProgressTab
              key={`progress-${quickAddProgressTrigger}`}
              data={data}
              onSaveProgress={handleSaveProgress}
              onDeleteProgress={handleDeleteProgress}
              onDeleteMultipleProgress={handleDeleteMultipleProgress}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Hệ thống Quản trị Lớp học • <strong>Trường PTDTBT TH Tu Mơ Rông</strong> • Huyện Tu Mơ Rông, Kon Tum
          </span>
          <span className="font-semibold text-slate-700">
            Giáo viên phụ trách: Nguyễn Viết Tri
          </span>
        </div>
      </footer>

      {/* Backup & Restore Dialog */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        data={data}
        onRestoreData={updateDataAndSave}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
