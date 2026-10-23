export type Gender = 'Nam' | 'Nữ';

export type StudentStatus = 'Đang học' | 'Chuyển trường' | 'Nghỉ học' | 'Tạm nghỉ';

export type ProgressLevel = 'Hoàn thành tốt' | 'Hoàn thành' | 'Cần hỗ trợ thêm' | 'Chưa đánh giá';

export interface Classroom {
  id: string;
  code: string; // e.g. "3A", "4B" - unique
  name: string; // e.g. "Lớp 3A"
  academicYear: string; // e.g. "2026-2027"
  teacherInCharge: string; // default "Nguyễn Viết Tri"
  notes?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  code: string; // e.g. "HS-2601" - unique
  fullName: string;
  classId: string;
  dob: string; // YYYY-MM-DD
  gender: Gender;
  status: StudentStatus;
  notes?: string;
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  studentId: string;
  classId: string;
  subject: string; // Tiếng Việt, Toán, Đạo đức, etc.
  date: string; // YYYY-MM-DD
  topic: string; // Nội dung / kỹ năng đánh giá
  level: ProgressLevel;
  teacherComment: string; // Nhận xét của giáo viên
  supportAction?: string; // Đề xuất hỗ trợ hoặc kế hoạch tiếp theo
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'class' | 'student' | 'progress' | 'system';
}

export interface SystemData {
  version: string;
  lastBackup?: string;
  schoolName: string;
  teacherName: string;
  classes: Classroom[];
  students: Student[];
  progressRecords: ProgressRecord[];
  activityLogs: ActivityLog[];
}

export type TabType = 'overview' | 'classes' | 'students' | 'progress';
