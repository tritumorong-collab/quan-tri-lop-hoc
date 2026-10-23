import { SystemData, Classroom, Student, ProgressRecord, ActivityLog } from '../types';
import { INITIAL_SAMPLE_DATA } from '../data/sampleData';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'NVIET_TRI_CLASSROOM_DATA_V1';

export function loadStoredData(): SystemData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time initialization with realistic sample data
      saveStoredData(INITIAL_SAMPLE_DATA);
      return INITIAL_SAMPLE_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.classes) || !Array.isArray(parsed.students)) {
      console.warn('Dữ liệu lưu trữ không đúng cấu trúc, khôi phục mặc định');
      return INITIAL_SAMPLE_DATA;
    }
    // Tự động chuẩn hóa nếu có dữ liệu cũ mang môn 'Tin học và Công nghệ'
    if (parsed.progressRecords && Array.isArray(parsed.progressRecords)) {
      let hasLegacySubject = false;
      parsed.progressRecords.forEach((r: ProgressRecord) => {
        if (r.subject === 'Tin học và Công nghệ') {
          r.subject = 'Tin học';
          hasLegacySubject = true;
        }
      });
      if (hasLegacySubject) {
        saveStoredData(parsed);
      }
    }
    return parsed;
  } catch (err) {
    console.error('Lỗi khi đọc dữ liệu từ bộ nhớ cục bộ:', err);
    return INITIAL_SAMPLE_DATA;
  }
}

export function saveStoredData(data: SystemData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Lỗi khi ghi dữ liệu vào bộ nhớ cục bộ:', err);
    return false;
  }
}

export function createActivityLog(
  action: string,
  details: string,
  type: ActivityLog['type']
): ActivityLog {
  return {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    action,
    details,
    type,
  };
}

export function formatDateVN(dateString?: string): string {
  if (!dateString) return '--/--/----';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTimeVN(isoString?: string): string {
  if (!isoString) return '--';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return (
      d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return isoString;
  }
}

// Export JSON Backup
export function downloadBackupFile(data: SystemData) {
  const exportData: SystemData = {
    ...data,
    lastBackup: new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `Sao_Luu_Quan_Tri_Lop_Hoc_Nguyen_Viet_Tri_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Validate and Restore JSON Backup
export function validateBackupFile(fileContent: string): {
  success: boolean;
  data?: SystemData;
  error?: string;
} {
  try {
    const parsed = JSON.parse(fileContent);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Tệp sao lưu không chứa dữ liệu hợp lệ.' };
    }
    if (!Array.isArray(parsed.classes)) {
      return { success: false, error: 'Thiếu danh mục lớp học hợp lệ trong tệp sao lưu.' };
    }
    if (!Array.isArray(parsed.students)) {
      return { success: false, error: 'Thiếu danh mục học sinh hợp lệ trong tệp sao lưu.' };
    }
    if (!Array.isArray(parsed.progressRecords)) {
      return { success: false, error: 'Thiếu danh mục tiến độ học tập hợp lệ trong tệp sao lưu.' };
    }

    const cleanedData: SystemData = {
      version: parsed.version || '1.0.0',
      lastBackup: new Date().toISOString(),
      schoolName: parsed.schoolName || 'TRƯỜNG PTDTBT TH TU MƠ RÔNG',
      teacherName: parsed.teacherName || 'NGUYỄN VIẾT TRI',
      classes: parsed.classes,
      students: parsed.students,
      progressRecords: parsed.progressRecords,
      activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : [],
    };

    return { success: true, data: cleanedData };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi định dạng JSON';
    return { success: false, error: 'Không thể đọc tệp sao lưu: ' + message };
  }
}

// CSV Export for Students
export function exportStudentsToCSV(students: Student[], classes: Classroom[]) {
  const classMap = new Map<string, string>();
  classes.forEach((c) => classMap.set(c.id, c.name));

  const headers = ['STT', 'Mã học sinh', 'Họ và tên', 'Lớp', 'Ngày sinh', 'Giới tính', 'Trạng thái', 'Ghi chú'];
  const rows = students.map((s, index) => [
    (index + 1).toString(),
    `"${s.code.replace(/"/g, '""')}"`,
    `"${s.fullName.replace(/"/g, '""')}"`,
    `"${(classMap.get(s.classId) || '').replace(/"/g, '""')}"`,
    s.dob ? formatDateVN(s.dob) : '',
    s.gender,
    s.status,
    `"${(s.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `Danh_Sach_Hoc_Sinh_Tu_Mo_Rong_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// CSV Export for Progress Records
export function exportProgressToCSV(
  records: ProgressRecord[],
  students: Student[],
  classes: Classroom[]
) {
  const classMap = new Map<string, string>();
  classes.forEach((c) => classMap.set(c.id, c.name));

  const studentMap = new Map<string, Student>();
  students.forEach((s) => studentMap.set(s.id, s));

  const headers = [
    'STT',
    'Mã học sinh',
    'Họ và tên',
    'Lớp',
    'Môn học',
    'Ngày đánh giá',
    'Nội dung / Kỹ năng',
    'Mức độ hoàn thành',
    'Nhận xét của giáo viên',
    'Đề xuất hỗ trợ',
  ];

  const rows = records.map((r, index) => {
    const student = studentMap.get(r.studentId);
    return [
      (index + 1).toString(),
      `"${(student?.code || '').replace(/"/g, '""')}"`,
      `"${(student?.fullName || '').replace(/"/g, '""')}"`,
      `"${(classMap.get(r.classId) || '').replace(/"/g, '""')}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      formatDateVN(r.date),
      `"${r.topic.replace(/"/g, '""')}"`,
      `"${r.level.replace(/"/g, '""')}"`,
      `"${r.teacherComment.replace(/"/g, '""')}"`,
      `"${(r.supportAction || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `Bao_Cao_Tien_Do_Hoc_Tap_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Parse imported Student CSV
export interface CSVParseResult {
  validStudents: Omit<Student, 'id' | 'createdAt'>[];
  errors: { line: number; message: string; raw: string }[];
}

export function parseStudentsCSV(
  csvText: string,
  classes: Classroom[],
  existingStudents: Student[]
): CSVParseResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const validStudents: Omit<Student, 'id' | 'createdAt'>[] = [];
  const errors: { line: number; message: string; raw: string }[] = [];

  if (lines.length === 0) {
    errors.push({ line: 1, message: 'Tệp rỗng hoặc không có dữ liệu', raw: '' });
    return { validStudents, errors };
  }

  // Create class lookup: by Code and by Name (case-insensitive)
  const classByCode = new Map<string, Classroom>();
  const classByName = new Map<string, Classroom>();
  classes.forEach((c) => {
    classByCode.set(c.code.trim().toUpperCase(), c);
    classByName.set(c.name.trim().toUpperCase(), c);
  });

  // Track existing codes to avoid duplicates
  const usedCodes = new Set<string>();
  existingStudents.forEach((s) => usedCodes.add(s.code.trim().toUpperCase()));

  // Detect header line
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('mã') || firstLine.includes('họ và tên') || firstLine.includes('tên') || firstLine.includes('lớp')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check if line is tab-separated (pasted directly from Excel) or comma-separated
    const cols: string[] = [];
    if (rawLine.includes('\t')) {
      rawLine.split('\t').forEach((cell) => cols.push(cell.trim().replace(/^["']|["']$/g, '')));
    } else {
      let cur = '';
      let inQuotes = false;
      for (let c = 0; c < rawLine.length; c++) {
        const char = rawLine[c];
        if (char === '"') {
          if (inQuotes && rawLine[c + 1] === '"') {
            cur += '"';
            c++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          cols.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      cols.push(cur.trim());
    }

    // Expect columns:
    // [0]: Mã HS, [1]: Họ và tên, [2]: Lớp, [3]: Ngày sinh (DD/MM/YYYY or YYYY-MM-DD), [4]: Giới tính, [5]: Ghi chú
    // Or if first column is STT: STT, Mã HS, Họ tên, Lớp, Ngày sinh, Giới tính, Ghi chú
    let code = '';
    let name = '';
    let classNameOrCode = '';
    let dobRaw = '';
    let genderStr = '';
    let notes = '';

    if (cols.length >= 6 && /^\d+$/.test(cols[0]) && cols[1].length > 0) {
      // Format with STT
      code = cols[1];
      name = cols[2];
      classNameOrCode = cols[3];
      dobRaw = cols[4] || '';
      genderStr = cols[5] || 'Nam';
      notes = cols[6] || '';
    } else if (cols.length >= 3) {
      code = cols[0];
      name = cols[1];
      classNameOrCode = cols[2];
      dobRaw = cols[3] || '';
      genderStr = cols[4] || 'Nam';
      notes = cols[5] || '';
    } else {
      errors.push({
        line: i + 1,
        message: 'Dòng không đủ số cột yêu cầu (Tối thiểu: Mã HS, Họ tên, Lớp)',
        raw: rawLine,
      });
      continue;
    }

    if (!code || !name || !classNameOrCode) {
      errors.push({
        line: i + 1,
        message: 'Thiếu thông tin bắt buộc (Mã học sinh, Họ tên hoặc Lớp)',
        raw: rawLine,
      });
      continue;
    }

    const normCode = code.toUpperCase();
    if (usedCodes.has(normCode)) {
      errors.push({
        line: i + 1,
        message: `Mã học sinh "${code}" đã tồn tại trong hệ thống hoặc bị lặp trong tệp`,
        raw: rawLine,
      });
      continue;
    }

    // Match class
    const matchedClass =
      classByCode.get(classNameOrCode.toUpperCase()) ||
      classByName.get(classNameOrCode.toUpperCase());

    if (!matchedClass) {
      errors.push({
        line: i + 1,
        message: `Không tìm thấy lớp học có tên hoặc mã "${classNameOrCode}". Vui lòng tạo lớp học trước.`,
        raw: rawLine,
      });
      continue;
    }

    // Parse date if given (DD/MM/YYYY or YYYY-MM-DD)
    let parsedDob = '';
    if (dobRaw) {
      if (dobRaw.includes('/')) {
        const parts = dobRaw.split('/');
        if (parts.length === 3) {
          const d = parts[0].padStart(2, '0');
          const m = parts[1].padStart(2, '0');
          const y = parts[2];
          parsedDob = `${y}-${m}-${d}`;
        }
      } else if (dobRaw.includes('-')) {
        parsedDob = dobRaw;
      }
    }

    const gender = genderStr.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam';

    usedCodes.add(normCode);
    validStudents.push({
      code,
      fullName: name,
      classId: matchedClass.id,
      dob: parsedDob || '2017-01-01',
      gender,
      status: 'Đang học',
      notes,
    });
  }

  return { validStudents, errors };
}

// Download Sample CSV template
export function downloadStudentCSVTemplate() {
  const content =
    '\uFEFF' +
    'Mã học sinh,Họ và tên,Lớp,Ngày sinh,Giới tính,Ghi chú\r\n' +
    'HS3A-10,A Hùng,3A,15/05/2017,Nam,Học sinh điểm trường thôn Đắk Ter\r\n' +
    'HS3A-11,Y Diệp,Lớp 3A,20/08/2017,Nữ,Bán trú chăm chỉ\r\n' +
    'HS4B-05,A Thiện,4B,12/03/2016,Nam,Nhanh nhẹn\r\n';

  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Mau_Nhap_Danh_Sach_Hoc_Sinh.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==========================================
// EXCEL (.XLSX & .XLS) SUPPORT FOR TEACHERS
// ==========================================

export interface ExcelParseResult {
  validStudents: Omit<Student, 'id' | 'createdAt'>[];
  errors: { line: number; message: string; raw: string }[];
  sheetNames: string[];
  selectedSheet: string;
  totalRows: number;
}

export function parseStudentsExcel(
  dataBuffer: ArrayBuffer,
  classes: Classroom[],
  existingStudents: Student[],
  targetSheetName?: string
): ExcelParseResult {
  const workbook = XLSX.read(dataBuffer, {
    type: 'array',
    cellDates: true,
  });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    return {
      validStudents: [],
      errors: [{ line: 1, message: 'Tệp Excel không chứa bảng tính (sheet) nào.', raw: '' }],
      sheetNames: [],
      selectedSheet: '',
      totalRows: 0,
    };
  }

  const selectedSheet =
    targetSheetName && sheetNames.includes(targetSheetName)
      ? targetSheetName
      : sheetNames[0];

  const worksheet = workbook.Sheets[selectedSheet];
  if (!worksheet) {
    return {
      validStudents: [],
      errors: [{ line: 1, message: `Không tìm thấy bảng tính "${selectedSheet}".`, raw: '' }],
      sheetNames,
      selectedSheet,
      totalRows: 0,
    };
  }

  // Convert sheet to 2D array of rows
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!rows || rows.length === 0) {
    return {
      validStudents: [],
      errors: [{ line: 1, message: 'Bảng tính rỗng, không có dữ liệu học sinh.', raw: '' }],
      sheetNames,
      selectedSheet,
      totalRows: 0,
    };
  }

  // Lookups for classes: by code and by name (case-insensitive)
  const classByCode = new Map<string, Classroom>();
  const classByName = new Map<string, Classroom>();
  classes.forEach((c) => {
    classByCode.set(c.code.trim().toUpperCase(), c);
    classByName.set(c.name.trim().toUpperCase(), c);
  });

  // Track existing student codes
  const usedCodes = new Set<string>();
  existingStudents.forEach((s) => usedCodes.add(s.code.trim().toUpperCase()));

  // 1. Find Header Row by looking for key terms
  let headerRowIndex = -1;
  let codeCol = -1;
  let nameCol = -1;
  let classCol = -1;
  let dobCol = -1;
  let genderCol = -1;
  let statusCol = -1;
  let notesCol = -1;

  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r];
    if (!Array.isArray(row)) continue;

    const rowStrings = row.map((cell) => String(cell || '').trim().toLowerCase());

    const hasCode = rowStrings.some((s) => s.includes('mã') || s.includes('ma hs') || s.includes('ms'));
    const hasName = rowStrings.some((s) => s.includes('tên') || s.includes('họ') || s.includes('học sinh'));
    const hasClass = rowStrings.some((s) => s.includes('lớp'));

    // Check if this row looks like header
    if ((hasCode && hasName) || (hasName && hasClass) || (hasCode && hasClass)) {
      headerRowIndex = r;
      rowStrings.forEach((text, colIdx) => {
        if (text.includes('mã') || text.includes('ms') || text.includes('dinh danh')) {
          if (codeCol === -1) codeCol = colIdx;
        } else if (text.includes('họ') || text.includes('tên') || text.includes('ho ten') || text.includes('hoc sinh')) {
          if (nameCol === -1) nameCol = colIdx;
        } else if (text.includes('lớp') || text.includes('lop')) {
          if (classCol === -1) classCol = colIdx;
        } else if (text.includes('sinh') || text.includes('ngày') || text.includes('dob')) {
          if (dobCol === -1) dobCol = colIdx;
        } else if (text.includes('giới') || text.includes('phái') || text.includes('nam/nữ')) {
          if (genderCol === -1) genderCol = colIdx;
        } else if (text.includes('trạng') || text.includes('tình trạng')) {
          if (statusCol === -1) statusCol = colIdx;
        } else if (text.includes('ghi chú') || text.includes('nơi ở') || text.includes('dân tộc') || text.includes('địa chỉ')) {
          if (notesCol === -1) notesCol = colIdx;
        }
      });
      break;
    }
  }

  // Fallback if header not identified by text: assume row 0 is header with standard column layout
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    // Guess default positions:
    // Check if column 0 is STT
    const firstCell = String(rows[0]?.[0] || '').toLowerCase();
    if (firstCell.includes('stt') || /^\d+$/.test(firstCell)) {
      codeCol = 1;
      nameCol = 2;
      classCol = 3;
      dobCol = 4;
      genderCol = 5;
      notesCol = 6;
    } else {
      codeCol = 0;
      nameCol = 1;
      classCol = 2;
      dobCol = 3;
      genderCol = 4;
      notesCol = 5;
    }
  }

  // Ensure default positions if any key column wasn't matched
  if (codeCol === -1) codeCol = 0;
  if (nameCol === -1) nameCol = 1;
  if (classCol === -1) classCol = 2;
  if (dobCol === -1) dobCol = 3;
  if (genderCol === -1) genderCol = 4;
  if (notesCol === -1) notesCol = 5;

  const validStudents: Omit<Student, 'id' | 'createdAt'>[] = [];
  const errors: { line: number; message: string; raw: string }[] = [];

  const startDataRow = headerRowIndex + 1;

  for (let r = startDataRow; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !Array.isArray(row) || row.every((c) => String(c || '').trim() === '')) {
      continue; // Skip empty rows
    }

    const rawLineNumber = r + 1;
    const rawLineStr = row.map((c) => String(c ?? '')).join(' | ');

    const rawCode = String(row[codeCol] ?? '').trim();
    const rawName = String(row[nameCol] ?? '').trim();
    const rawClass = String(row[classCol] ?? '').trim();
    const rawDob = row[dobCol];
    const rawGender = String(row[genderCol] ?? '').trim();
    const rawStatus = String(row[statusCol] ?? '').trim();
    const rawNotes = String(row[notesCol] ?? '').trim();

    // Check mandatory fields
    if (!rawName) {
      errors.push({
        line: rawLineNumber,
        message: 'Thiếu họ và tên học sinh',
        raw: rawLineStr,
      });
      continue;
    }

    // Auto-generate code if empty in Excel file
    let studentCode = rawCode;
    if (!studentCode) {
      studentCode = `HS-${Date.now().toString().slice(-4)}-${validStudents.length + 1}`;
    }

    const normCode = studentCode.toUpperCase();
    if (usedCodes.has(normCode)) {
      errors.push({
        line: rawLineNumber,
        message: `Mã học sinh "${studentCode}" đã tồn tại trong hệ thống hoặc bị lặp trong file`,
        raw: rawLineStr,
      });
      continue;
    }

    // Class matching
    let matchedClass: Classroom | undefined;
    if (rawClass) {
      matchedClass =
        classByCode.get(rawClass.toUpperCase()) ||
        classByName.get(rawClass.toUpperCase());
    } else if (classes.length === 1) {
      // If only one class exists in system, auto-assign
      matchedClass = classes[0];
    }

    if (!matchedClass) {
      const availClasses = classes.map((c) => c.code).join(', ') || 'Chưa có lớp nào';
      errors.push({
        line: rawLineNumber,
        message: `Không tìm thấy lớp "${rawClass || 'Rỗng'}". Lớp hiện có: ${availClasses}`,
        raw: rawLineStr,
      });
      continue;
    }

    // Date of Birth parsing
    let parsedDob = '2017-01-01';
    if (rawDob instanceof Date && !isNaN(rawDob.getTime())) {
      const y = rawDob.getFullYear();
      const m = String(rawDob.getMonth() + 1).padStart(2, '0');
      const d = String(rawDob.getDate()).padStart(2, '0');
      parsedDob = `${y}-${m}-${d}`;
    } else if (typeof rawDob === 'number') {
      // Excel serial date number
      try {
        const dateObj = XLSX.SSF.parse_date_code(rawDob);
        if (dateObj) {
          const y = dateObj.y;
          const m = String(dateObj.m).padStart(2, '0');
          const d = String(dateObj.d).padStart(2, '0');
          parsedDob = `${y}-${m}-${d}`;
        }
      } catch {
        parsedDob = '2017-01-01';
      }
    } else if (typeof rawDob === 'string' && rawDob.trim().length > 0) {
      const trimmed = rawDob.trim();
      if (trimmed.includes('/')) {
        const parts = trimmed.split('/');
        if (parts.length === 3) {
          const d = parts[0].padStart(2, '0');
          const m = parts[1].padStart(2, '0');
          const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          parsedDob = `${y}-${m}-${d}`;
        }
      } else if (trimmed.includes('-')) {
        const parts = trimmed.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            parsedDob = trimmed;
          } else {
            parsedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }
    }

    // Gender detection
    const genderLower = rawGender.toLowerCase();
    const gender: 'Nam' | 'Nữ' =
      genderLower.includes('nữ') || genderLower.includes('nu') || genderLower.includes('gái') || genderLower.includes('female')
        ? 'Nữ'
        : 'Nam';

    // Status detection
    let status: Student['status'] = 'Đang học';
    const statusLower = rawStatus.toLowerCase();
    if (statusLower.includes('chuyển')) status = 'Chuyển trường';
    else if (statusLower.includes('nghỉ')) status = 'Nghỉ học';
    else if (statusLower.includes('tạm')) status = 'Tạm nghỉ';

    usedCodes.add(normCode);
    validStudents.push({
      code: studentCode,
      fullName: rawName,
      classId: matchedClass.id,
      dob: parsedDob,
      gender,
      status,
      notes: rawNotes,
    });
  }

  return {
    validStudents,
    errors,
    sheetNames,
    selectedSheet,
    totalRows: rows.length - startDataRow,
  };
}

// Download Sample Excel (.xlsx) Template for Teachers
export function downloadStudentExcelTemplate(classes: Classroom[]) {
  const wb = XLSX.utils.book_new();

  // 1. Main Sheet with Headers & Sample Data
  const sampleClassCode = classes[0]?.code || '3A';
  const sampleClassCode2 = classes[1]?.code || '4B';

  const wsData = [
    ['TRƯỜNG PTDTBT TH TU MƠ RÔNG - MẪU NHẬP DANH SÁCH HỌC SINH TỪ EXCEL'],
    ['Giáo viên phụ trách: Nguyễn Viết Tri • Năm học: 2026-2027'],
    [''], // Empty row for clarity
    [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Lớp',
      'Ngày sinh (DD/MM/YYYY)',
      'Giới tính',
      'Trạng thái',
      'Ghi chú (Thôn/Điểm trường/Đặc điểm)',
    ],
    [1, `${sampleClassCode}-10`, 'A Hùng', sampleClassCode, '15/05/2017', 'Nam', 'Đang học', 'Thôn Đắk Ter, bán trú'],
    [2, `${sampleClassCode}-11`, 'Y Diệp', sampleClassCode, '20/08/2017', 'Nữ', 'Đang học', 'Chăm chỉ, viết chữ đẹp'],
    [3, `${sampleClassCode2}-05`, 'A Thiện', sampleClassCode2, '12/03/2016', 'Nam', 'Đang học', 'Nhanh nhẹn, năng khiếu toán'],
    [4, `${sampleClassCode2}-06`, 'Y Nhàn', sampleClassCode2, '28/11/2016', 'Nữ', 'Đang học', 'Cần rèn đọc thêm'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths for comfortable viewing
  ws['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã HS
    { wch: 25 }, // Họ và tên
    { wch: 12 }, // Lớp
    { wch: 22 }, // Ngày sinh
    { wch: 12 }, // Giới tính
    { wch: 14 }, // Trạng thái
    { wch: 35 }, // Ghi chú
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hoc_Sinh');

  // 2. Instructions Sheet
  const instructionsData = [
    ['HƯỚNG DẪN ĐIỀN DANH SÁCH HỌC SINH TỪ FILE EXCEL'],
    [''],
    ['1. Cột "Mã học sinh":', 'Mỗi em có 1 mã duy nhất, không trùng lặp (VD: 3A-01, HS3A-02...)'],
    ['2. Cột "Họ và tên":', 'Họ và tên đầy đủ của học sinh (Bắt buộc)'],
    ['3. Cột "Lớp":', 'Điền Mã lớp hoặc Tên lớp đang có trong hệ thống'],
    ['', `Các lớp hiện có trong hệ thống: ${classes.map((c) => `${c.name} (Mã: ${c.code})`).join('; ')}`],
    ['4. Cột "Ngày sinh":', 'Định dạng ngày quen thuộc Ngày/Tháng/Năm (VD: 15/05/2017)'],
    ['5. Cột "Giới tính":', 'Điền "Nam" hoặc "Nữ"'],
    ['6. Cột "Trạng thái":', 'Điền "Đang học", "Chuyển trường", hoặc "Nghỉ học"'],
    ['7. Cột "Ghi chú":', 'Ghi thông tin phụ vụ công tác giáo dục: thôn, bán trú, đặc điểm...'],
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 28 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Huong_Dan_Nhap');

  XLSX.writeFile(wb, 'Mau_Nhap_Danh_Sach_Hoc_Sinh_Tu_Mo_Rong.xlsx');
}

// Export Student List to Styled Excel (.xlsx)
export function exportStudentsToExcel(students: Student[], classes: Classroom[]) {
  const wb = XLSX.utils.book_new();

  const classMap = new Map<string, string>();
  classes.forEach((c) => classMap.set(c.id, c.name));

  const todayStr = formatDateVN(new Date().toISOString());

  const dataRows = [
    ['TRƯỜNG PTDTBT TIỂU HỌC TU MƠ RÔNG - HUYỆN TU MƠ RÔNG, TỈNH KON TUM'],
    ['HỆ THỐNG QUẢN TRỊ LỚP HỌC - GIÁO VIÊN: NGUYỄN VIẾT TRI'],
    [`DANH SÁCH HỒ SƠ HỌC SINH (Xuất ngày ${todayStr})`],
    [''],
    [
      'STT',
      'Mã học sinh',
      'Họ và tên học sinh',
      'Lớp học',
      'Ngày sinh',
      'Giới tính',
      'Trạng thái',
      'Ghi chú giáo dục',
    ],
    ...students.map((s, idx) => [
      idx + 1,
      s.code,
      s.fullName,
      classMap.get(s.classId) || '',
      formatDateVN(s.dob),
      s.gender,
      s.status,
      s.notes || '',
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(dataRows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 15 },
    { wch: 26 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
    { wch: 35 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Danh_Sach_Hoc_Sinh');

  const dateFileStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Danh_Sach_Hoc_Sinh_Tu_Mo_Rong_${dateFileStr}.xlsx`);
}

