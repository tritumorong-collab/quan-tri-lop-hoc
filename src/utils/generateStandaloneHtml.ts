import { SystemData } from '../types';

export function generateStandaloneHtml(currentData: SystemData): string {
  const jsonEscaped = JSON.stringify(currentData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HỆ THỐNG QUẢN TRỊ LỚP HỌC – NGUYỄN VIẾT TRI | TRƯỜNG PTDTBT TH TU MƠ RÔNG</title>
  <style>
    :root {
      --primary: #1d4ed8;
      --primary-hover: #1e40af;
      --primary-light: #eff6ff;
      --success: #059669;
      --success-light: #ecfdf5;
      --warning: #d97706;
      --warning-light: #fffbeb;
      --danger: #dc2626;
      --danger-light: #fef2f2;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --bg-page: #f8fafc;
      --bg-card: #ffffff;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    body { background-color: var(--bg-page); color: var(--text-main); line-height: 1.5; font-size: 14px; min-height: 100vh; display: flex; flex-direction: column; }
    
    /* Layout */
    .app-header { background: #ffffff; border-bottom: 1px solid var(--border); padding: 14px 24px; position: sticky; top: 0; z-index: 40; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .header-container { max-width: 1440px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .brand-title { font-size: 11px; font-weight: 700; color: #2563eb; letter-spacing: 0.05em; text-transform: uppercase; }
    .app-title { font-size: 19px; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .teacher-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; color: #166534; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; border: 1px solid #bbf7d0; }
    
    .header-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; text-decoration: none; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-outline { background: #fff; border-color: var(--border); color: #334155; }
    .btn-outline:hover { background: #f1f5f9; border-color: #cbd5e1; }
    .btn-success { background: var(--success); color: #fff; }
    .btn-success:hover { background: #047857; }
    .btn-danger { background: var(--danger); color: #fff; }
    .btn-danger:hover { background: #b91c1c; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
    
    .main-wrapper { max-width: 1440px; width: 100%; margin: 0 auto; display: flex; flex: 1; padding: 20px 24px; gap: 24px; }
    .sidebar { width: 240px; flex-shrink: 0; }
    .nav-list { display: flex; flex-direction: column; gap: 6px; list-style: none; }
    .nav-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; border: none; background: transparent; color: #475569; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; transition: all 0.15s; }
    .nav-btn:hover { background: #f1f5f9; color: #0f172a; }
    .nav-btn.active { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .nav-badge { margin-left: auto; background: #e2e8f0; color: #334155; font-size: 11px; padding: 2px 7px; border-radius: 9999px; font-weight: 700; }
    .nav-btn.active .nav-badge { background: #dbeafe; color: #1e40af; }
    
    .content-area { flex: 1; min-width: 0; }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; }
    
    /* Stats Cards */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text-main); margin-top: 4px; line-height: 1.1; }
    .stat-desc { font-size: 12px; margin-top: 6px; }
    
    /* Card Container */
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
    .card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .card-title { font-size: 16px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }
    
    /* Table */
    .table-responsive { width: 100%; overflow-x: auto; border: 1px solid var(--border); border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f8fafc; padding: 10px 14px; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    
    /* Badges */
    .badge { display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; }
    .badge-good { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-pass { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-warn { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .badge-danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    .badge-gray { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

    /* Filter Bar */
    .filter-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-input, .select-input { padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; background: #fff; color: #0f172a; outline: none; }
    .search-input { min-width: 240px; }
    .search-input:focus, .select-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
    
    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.5); backdrop-filter: blur(2px); display: none; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
    .modal-backdrop.open { display: flex; }
    .modal-box { background: #fff; width: 100%; max-width: 580px; border-radius: var(--radius); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
    .modal-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
    .modal-close { background: transparent; border: none; font-size: 20px; line-height: 1; cursor: pointer; color: #94a3b8; }
    .modal-body { padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
    .modal-footer { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; background: #f8fafc; }

    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-label { font-size: 12px; font-weight: 700; color: #334155; }
    .form-label span.req { color: #dc2626; margin-left: 2px; }
    .form-control { padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 13px; outline: none; }
    .form-control:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
    textarea.form-control { resize: vertical; min-height: 70px; }

    /* Alert / Notice */
    .notice { padding: 12px 16px; border-radius: 8px; font-size: 13px; display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .notice-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .notice-warn { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

    /* Toast */
    #toastContainer { position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: flex; flex-direction: column; gap: 8px; }
    .toast-msg { background: #0f172a; color: #fff; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); animation: fadeIn 0.2s ease; display: flex; align-items: center; gap: 8px; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

    /* Print styles */
    @media print {
      body { background: #fff; color: #000; }
      .app-header, .sidebar, .filter-bar, .header-actions, .btn, #toastContainer, .modal-backdrop { display: none !important; }
      .main-wrapper { padding: 0; margin: 0; max-width: 100%; }
      .content-area { width: 100%; }
      .tab-pane { display: none !important; }
      #tab-progress { display: block !important; }
      .card { border: none !important; box-shadow: none !important; padding: 0 !important; }
      .print-only-header { display: block !important; margin-bottom: 20px; text-align: center; }
    }
    .print-only-header { display: none; }

    @media (max-width: 900px) {
      .main-wrapper { flex-direction: column; }
      .sidebar { width: 100%; }
      .nav-list { flex-direction: row; flex-wrap: wrap; }
      .nav-btn { flex: 1; min-width: 140px; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header class="app-header">
    <div class="header-container">
      <div>
        <div class="brand-title">TRƯỜNG PTDTBT TH TU MƠ RÔNG • HUYỆN TU MƠ RÔNG, KON TUM</div>
        <div class="app-title">
          <span>📚 HỆ THỐNG QUẢN TRỊ LỚP HỌC</span>
          <span class="teacher-badge">👨‍🏫 GV: NGUYỄN VIẾT TRI</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary btn-sm" onclick="openAddClassModal()">+ Thêm lớp học</button>
        <button class="btn btn-primary btn-sm" onclick="openAddStudentModal()">+ Thêm học sinh</button>
        <button class="btn btn-success btn-sm" onclick="openAddProgressModal()">+ Đánh giá tiến độ</button>
        <button class="btn btn-outline btn-sm" onclick="exportBackupData()">💾 Sao lưu</button>
        <button class="btn btn-outline btn-sm" onclick="document.getElementById('restoreFileInput').click()">📂 Khôi phục</button>
        <input type="file" id="restoreFileInput" accept=".json" style="display:none;" onchange="handleRestoreFile(event)">
      </div>
    </div>
  </header>

  <!-- Main Body -->
  <div class="main-wrapper">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <ul class="nav-list">
        <li>
          <button class="nav-btn active" id="nav-btn-overview" onclick="switchTab('overview')">
            <span>📊 1. Tổng quan</span>
          </button>
        </li>
        <li>
          <button class="nav-btn" id="nav-btn-classes" onclick="switchTab('classes')">
            <span>🏫 2. Lớp học</span>
            <span class="nav-badge" id="nav-count-classes">0</span>
          </button>
        </li>
        <li>
          <button class="nav-btn" id="nav-btn-students" onclick="switchTab('students')">
            <span>🎒 3. Học sinh</span>
            <span class="nav-badge" id="nav-count-students">0</span>
          </button>
        </li>
        <li>
          <button class="nav-btn" id="nav-btn-progress" onclick="switchTab('progress')">
            <span>📈 4. Tiến độ học tập</span>
            <span class="nav-badge" id="nav-count-progress">0</span>
          </button>
        </li>
      </ul>

      <div style="margin-top: 24px; padding: 14px; background: #fff; border: 1px solid var(--border); border-radius: var(--radius); font-size: 12px; color: #64748b;">
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">🔒 An toàn & Bảo mật</div>
        <div>Hệ thống chạy ngoại tuyến, lưu trữ trực tiếp trên thiết bị của thầy. Dữ liệu học sinh được bảo vệ an toàn.</div>
      </div>
    </aside>

    <!-- Content Area -->
    <main class="content-area">
      
      <!-- TAB 1: TỔNG QUAN -->
      <section id="tab-overview" class="tab-pane active">
        <div class="notice notice-info">
          <span>💡 <strong>Chào mừng thầy Nguyễn Viết Tri</strong>. Đây là bảng điều khiển quản trị lớp học trường PTDTBT TH Tu Mơ Rông. Số liệu được tổng hợp tự động từ danh sách học sinh và nhật ký tiến độ.</span>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Tổng số lớp học</div>
            <div class="stat-value" id="stat-total-classes" style="color: #2563eb;">0</div>
            <div class="stat-desc text-muted">Lớp đang giảng dạy</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Tổng số học sinh</div>
            <div class="stat-value" id="stat-total-students" style="color: #059669;">0</div>
            <div class="stat-desc text-muted">Học sinh trong danh sách</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">HS đang theo dõi</div>
            <div class="stat-value" id="stat-tracking-students" style="color: #0284c7;">0</div>
            <div class="stat-desc text-muted">Có bản ghi đánh giá</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">HS có tiến bộ tốt</div>
            <div class="stat-value" id="stat-progress-good" style="color: #16a34a;">0</div>
            <div class="stat-desc text-muted">Mức Hoàn thành tốt</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">HS cần hỗ trợ thêm</div>
            <div class="stat-value" id="stat-need-support" style="color: #ea580c;">0</div>
            <div class="stat-desc text-muted">Cần kèm cặp phụ đạo</div>
          </div>
        </div>

        <!-- Biểu đồ & Phân tích -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title">📊 Phân bố học sinh theo lớp</div>
            </div>
            <div id="chart-class-distribution" style="min-height: 180px; display: flex; align-items: flex-end; gap: 20px; padding-top: 20px;"></div>
          </div>
          <div class="card" style="margin-bottom:0;">
            <div class="card-header">
              <div class="card-title">📈 Tỷ lệ mức độ hoàn thành môn học</div>
            </div>
            <div id="chart-level-distribution" style="min-height: 180px;"></div>
          </div>
        </div>

        <!-- Học sinh cần quan tâm -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">⚠️ Danh sách học sinh cần quan tâm hỗ trợ</div>
            <button class="btn btn-outline btn-sm" onclick="switchTab('progress')">Xem toàn bộ tiến độ →</button>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Mã HS</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Môn học</th>
                  <th>Nội dung cần hỗ trợ</th>
                  <th>Đề xuất giải pháp của thầy Tri</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="overview-concern-list"></tbody>
            </table>
          </div>
        </div>

        <!-- Hoạt động gần đây -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">🕒 Hoạt động cập nhật gần đây</div>
          </div>
          <div id="recent-activities-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>
      </section>

      <!-- TAB 2: LỚP HỌC -->
      <section id="tab-classes" class="tab-pane">
        <div class="card">
          <div class="card-header">
            <div class="card-title">🏫 Quản lý danh sách lớp học</div>
            <button class="btn btn-primary" onclick="openAddClassModal()">+ Thêm lớp học mới</button>
          </div>

          <div class="filter-bar">
            <input type="text" id="class-search" class="search-input" placeholder="🔍 Tìm theo mã hoặc tên lớp..." oninput="renderClasses()">
            <select id="class-year-filter" class="select-input" onchange="renderClasses()">
              <option value="">Tất cả năm học</option>
              <option value="2026-2027" selected>Năm học 2026-2027</option>
              <option value="2025-2026">Năm học 2025-2026</option>
            </select>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Mã lớp</th>
                  <th>Tên lớp</th>
                  <th>Năm học</th>
                  <th>Giáo viên phụ trách</th>
                  <th>Sĩ số</th>
                  <th>Ghi chú</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="classes-table-body"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB 3: HỌC SINH -->
      <section id="tab-students" class="tab-pane">
        <div class="card">
          <div class="card-header">
            <div class="card-title">🎒 Hồ sơ học sinh</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-success" onclick="openImportModal()">📗 Nhập Excel / CSV</button>
              <button class="btn btn-outline" onclick="downloadStudentsCSV()">📥 Xuất CSV</button>
              <button class="btn btn-primary" onclick="openAddStudentModal()">+ Thêm học sinh</button>
            </div>
          </div>

          <div class="filter-bar">
            <input type="text" id="student-search" class="search-input" placeholder="🔍 Tìm tên hoặc mã học sinh..." oninput="renderStudents()">
            <select id="student-class-filter" class="select-input" onchange="renderStudents()">
              <option value="">Tất cả lớp học</option>
            </select>
            <select id="student-status-filter" class="select-input" onchange="renderStudents()">
              <option value="">Tất cả trạng thái</option>
              <option value="Đang học">Đang học</option>
              <option value="Chuyển trường">Chuyển trường</option>
              <option value="Nghỉ học">Nghỉ học</option>
            </select>
            <select id="student-sort" class="select-input" onchange="renderStudents()">
              <option value="name-asc">Sắp xếp: Tên A → Z</option>
              <option value="name-desc">Sắp xếp: Tên Z → A</option>
              <option value="code-asc">Sắp xếp: Mã HS</option>
            </select>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Mã HS</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Ngày sinh</th>
                  <th>Giới tính</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="students-table-body"></tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB 4: TIẾN ĐỘ HỌC TẬP -->
      <section id="tab-progress" class="tab-pane">
        <div class="card">
          <div class="card-header">
            <div class="card-title">📈 Sổ theo dõi tiến độ học tập (Thông tư 27)</div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline" onclick="window.print()">🖨️ In sổ theo dõi</button>
              <button class="btn btn-outline" onclick="downloadProgressCSV()">📥 Xuất CSV</button>
              <button class="btn btn-success" onclick="openAddProgressModal()">+ Thêm đánh giá</button>
            </div>
          </div>

          <div class="filter-bar">
            <select id="progress-class-filter" class="select-input" onchange="onProgressClassFilterChange()">
              <option value="">Tất cả lớp</option>
            </select>
            <select id="progress-student-filter" class="select-input" onchange="renderProgress()">
              <option value="">Tất cả học sinh</option>
            </select>
            <select id="progress-subject-filter" class="select-input" onchange="renderProgress()">
              <option value="">Tất cả môn học</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Toán">Toán</option>
              <option value="Đạo đức">Đạo đức</option>
              <option value="Tự nhiên và Xã hội">Tự nhiên và Xã hội</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Lịch sử và Địa lý">Lịch sử và Địa lý</option>
              <option value="Tin học">Tin học</option>
              <option value="Công nghệ">Công nghệ</option>
              <option value="Giáo dục thể chất">Giáo dục thể chất</option>
              <option value="Âm nhạc">Âm nhạc</option>
              <option value="Mỹ thuật">Mỹ thuật</option>
              <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
            </select>
            <select id="progress-level-filter" class="select-input" onchange="renderProgress()">
              <option value="">Tất cả mức độ</option>
              <option value="Hoàn thành tốt">Hoàn thành tốt</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Cần hỗ trợ thêm">Cần hỗ trợ thêm</option>
            </select>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Học sinh</th>
                  <th>Lớp</th>
                  <th>Môn học</th>
                  <th>Nội dung / Kỹ năng</th>
                  <th>Mức độ</th>
                  <th>Nhận xét của giáo viên</th>
                  <th>Đề xuất hỗ trợ</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody id="progress-table-body"></tbody>
            </table>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- MODALS -->
  <!-- Class Modal -->
  <div id="classModal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 class="modal-title" id="classModalTitle">Thêm lớp học</h3>
        <button class="modal-close" onclick="closeModal('classModal')">&times;</button>
      </div>
      <form onsubmit="handleSaveClass(event)">
        <div class="modal-body">
          <input type="hidden" id="class-id">
          <div class="form-group">
            <label class="form-label">Mã lớp <span class="req">*</span></label>
            <input type="text" id="class-code" class="form-control" placeholder="VD: 3A, 4B..." required>
          </div>
          <div class="form-group">
            <label class="form-label">Tên lớp học <span class="req">*</span></label>
            <input type="text" id="class-name" class="form-control" placeholder="VD: Lớp 3A" required>
          </div>
          <div class="form-group">
            <label class="form-label">Năm học <span class="req">*</span></label>
            <input type="text" id="class-academic-year" class="form-control" value="2026-2027" required>
          </div>
          <div class="form-group">
            <label class="form-label">Giáo viên phụ trách</label>
            <input type="text" id="class-teacher" class="form-control" value="Nguyễn Viết Tri">
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú lớp học</label>
            <textarea id="class-notes" class="form-control" placeholder="VD: Điểm trường chính, học sinh bán trú..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal('classModal')">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">Lưu lớp học</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Student Modal -->
  <div id="studentModal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 class="modal-title" id="studentModalTitle">Thêm học sinh</h3>
        <button class="modal-close" onclick="closeModal('studentModal')">&times;</button>
      </div>
      <form onsubmit="handleSaveStudent(event)">
        <div class="modal-body">
          <input type="hidden" id="student-id">
          <div class="form-group">
            <label class="form-label">Mã học sinh <span class="req">*</span></label>
            <input type="text" id="student-code" class="form-control" placeholder="VD: HS3A-01" required>
          </div>
          <div class="form-group">
            <label class="form-label">Họ và tên học sinh <span class="req">*</span></label>
            <input type="text" id="student-fullname" class="form-control" placeholder="VD: A Duy, Y Thủy..." required>
          </div>
          <div class="form-group">
            <label class="form-label">Lớp học <span class="req">*</span></label>
            <select id="student-class-select" class="form-control" required></select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Ngày sinh <span class="req">*</span></label>
              <input type="date" id="student-dob" class="form-control" required>
            </div>
            <div class="form-group">
              <label class="form-label">Giới tính</label>
              <select id="student-gender" class="form-control">
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Trạng thái học tập</label>
            <select id="student-status-select" class="form-control">
              <option value="Đang học">Đang học</option>
              <option value="Chuyển trường">Chuyển trường</option>
              <option value="Nghỉ học">Nghỉ học</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú giáo dục (nơi ở, sở thích, đặc điểm)</label>
            <textarea id="student-notes" class="form-control" placeholder="VD: Thôn Đắk Ter, cần kèm thêm tiếng Việt..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal('studentModal')">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">Lưu học sinh</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Progress Modal -->
  <div id="progressModal" class="modal-backdrop">
    <div class="modal-box">
      <div class="modal-header">
        <h3 class="modal-title" id="progressModalTitle">Đánh giá tiến độ học tập</h3>
        <button class="modal-close" onclick="closeModal('progressModal')">&times;</button>
      </div>
      <form onsubmit="handleSaveProgress(event)">
        <div class="modal-body">
          <input type="hidden" id="progress-id">
          <div class="form-group">
            <label class="form-label">Chọn lớp học <span class="req">*</span></label>
            <select id="prog-class-select" class="form-control" onchange="onProgClassChange()" required></select>
          </div>
          <div class="form-group">
            <label class="form-label">Chọn học sinh <span class="req">*</span></label>
            <select id="prog-student-select" class="form-control" required></select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">Môn học <span class="req">*</span></label>
              <select id="prog-subject" class="form-control" required>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Toán">Toán</option>
                <option value="Đạo đức">Đạo đức</option>
                <option value="Tự nhiên và Xã hội">Tự nhiên và Xã hội</option>
                <option value="Khoa học">Khoa học</option>
                <option value="Lịch sử và Địa lý">Lịch sử và Địa lý</option>
                <option value="Tin học">Tin học</option>
                <option value="Công nghệ">Công nghệ</option>
                <option value="Giáo dục thể chất">Giáo dục thể chất</option>
                <option value="Âm nhạc">Âm nhạc</option>
                <option value="Mỹ thuật">Mỹ thuật</option>
                <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ngày đánh giá <span class="req">*</span></label>
              <input type="date" id="prog-date" class="form-control" required>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Nội dung hoặc kỹ năng được đánh giá <span class="req">*</span></label>
            <input type="text" id="prog-topic" class="form-control" placeholder="VD: Cộng trừ có nhớ, Đọc trôi chảy..." required>
          </div>
          <div class="form-group">
            <label class="form-label">Mức độ hoàn thành (Thông tư 27) <span class="req">*</span></label>
            <select id="prog-level" class="form-control" required>
              <option value="Hoàn thành tốt">Hoàn thành tốt (T)</option>
              <option value="Hoàn thành">Hoàn thành (H)</option>
              <option value="Cần hỗ trợ thêm">Cần hỗ trợ thêm (C)</option>
              <option value="Chưa đánh giá">Chưa đánh giá</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nhận xét của giáo viên <span class="req">*</span></label>
            <textarea id="prog-comment" class="form-control" placeholder="Ghi nhận cụ thể năng lực, sự tiến bộ..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Đề xuất hỗ trợ hoặc hoạt động tiếp theo</label>
            <textarea id="prog-support" class="form-control" placeholder="VD: Hướng dẫn riêng 10 phút, giao thêm bài tập trực quan..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" onclick="closeModal('progressModal')">Hủy bỏ</button>
          <button type="submit" class="btn btn-primary">Lưu đánh giá</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Delete Progress Confirm Modal -->
  <div id="deleteProgressConfirmModal" class="modal-backdrop">
    <div class="modal-box" style="max-width: 420px;">
      <div class="modal-header">
        <h3 class="modal-title" style="color: #dc2626;">⚠️ Xác nhận xóa đánh giá</h3>
        <button class="modal-close" onclick="closeModal('deleteProgressConfirmModal')">&times;</button>
      </div>
      <div class="modal-body">
        <p id="delete-progress-desc" style="font-size: 13px; color: #334155; line-height: 1.6;"></p>
        <p style="font-size: 12px; color: #dc2626; margin-top: 8px;">Dữ liệu sau khi xóa sẽ không thể khôi phục.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" onclick="closeModal('deleteProgressConfirmModal')">Hủy bỏ</button>
        <button type="button" class="btn btn-danger" onclick="confirmDeleteProgress()">Xác nhận xóa</button>
      </div>
    </div>
  </div>

  <!-- Excel / CSV Import Modal -->
  <div id="importModal" class="modal-backdrop">
    <div class="modal-box" style="max-width: 650px;">
      <div class="modal-header">
        <h3 class="modal-title">📗 Nhập danh sách học sinh từ Excel hoặc CSV</h3>
        <button class="modal-close" onclick="closeModal('importModal')">&times;</button>
      </div>
      <div class="modal-body">
        <div style="background: #f8fafc; border: 1px solid var(--border); padding: 12px; border-radius: 8px; font-size: 12px; color: #334155;">
          <div style="font-weight: 700; margin-bottom: 4px;">📋 Các cột nhận diện tự động từ Excel:</div>
          <div style="font-family: monospace; background: #fff; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; margin-bottom: 6px;">
            Mã học sinh | Họ và tên | Lớp | Ngày sinh | Giới tính | Ghi chú
          </div>
          <div>Thầy có thể sao chép các dòng trong Excel rồi dán (Ctrl+V) vào ô bên dưới hoặc chọn file CSV/TSV.</div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button class="btn btn-outline btn-sm" onclick="setStandaloneImportMode('paste')">📋 Dán từ Excel (Ctrl+V)</button>
          <button class="btn btn-outline btn-sm" onclick="setStandaloneImportMode('file')">📁 Chọn tệp CSV/TSV</button>
        </div>

        <div id="standalone-paste-area" class="form-group" style="margin-top: 6px;">
          <label class="form-label">Dán nội dung từ Excel vào đây:</label>
          <textarea id="standalone-paste-input" class="form-control" style="min-height: 120px; font-family: monospace; font-size: 11px;" placeholder="Mở file Excel -> Chọn vùng học sinh -> Ctrl+C -> Bấm vào đây và Ctrl+V..." oninput="parseStandalonePastedText()"></textarea>
        </div>

        <div id="standalone-file-area" class="form-group" style="display: none; margin-top: 6px;">
          <label class="form-label">Chọn tệp CSV từ máy tính:</label>
          <input type="file" id="standalone-file-input" accept=".csv,.txt" class="form-control" onchange="handleStandaloneFileSelect(event)">
        </div>

        <div id="standalone-preview-status" style="display: none; padding: 10px; border-radius: 8px; font-size: 12px;"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline" onclick="closeModal('importModal')">Hủy</button>
        <button type="button" id="standalone-import-btn" class="btn btn-success" disabled onclick="confirmStandaloneImport()">Thêm học sinh</button>
      </div>
    </div>
  </div>

  <div id="toastContainer"></div>

  <!-- Core JavaScript -->
  <script>
    // State initialization
    const DEFAULT_DATA = ${jsonEscaped};
    let appData = null;
    let standaloneParsedStudents = [];

    function setStandaloneImportMode(mode) {
      document.getElementById('standalone-paste-area').style.display = mode === 'paste' ? 'block' : 'none';
      document.getElementById('standalone-file-area').style.display = mode === 'file' ? 'block' : 'none';
    }

    function openImportModal() {
      standaloneParsedStudents = [];
      document.getElementById('standalone-paste-input').value = '';
      document.getElementById('standalone-preview-status').style.display = 'none';
      document.getElementById('standalone-import-btn').disabled = true;
      setStandaloneImportMode('paste');
      openModal('importModal');
    }

    function parseStandalonePastedText() {
      const text = document.getElementById('standalone-paste-input').value;
      processRawImportText(text);
    }

    function handleStandaloneFileSelect(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        processRawImportText(evt.target.result);
      };
      reader.readAsText(file);
    }

    function processRawImportText(rawText) {
      const statusEl = document.getElementById('standalone-preview-status');
      const importBtn = document.getElementById('standalone-import-btn');
      if (!rawText.trim()) {
        statusEl.style.display = 'none';
        importBtn.disabled = true;
        return;
      }

      const lines = rawText.split(/\\r?\\n/).filter(l => l.trim().length > 0);
      const classMap = new Map();
      appData.classes.forEach(c => {
        classMap.set(c.code.trim().toUpperCase(), c);
        classMap.set(c.name.trim().toUpperCase(), c);
      });

      const usedCodes = new Set(appData.students.map(s => s.code.trim().toUpperCase()));
      let valid = [];
      let errs = [];

      let start = 0;
      const fLine = lines[0].toLowerCase();
      if (fLine.includes('mã') || fLine.includes('tên') || fLine.includes('lớp') || fLine.includes('họ')) start = 1;

      for (let i = start; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.includes('\\t') ? line.split('\\t').map(c => c.trim()) : line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        
        let code = '', name = '', clsName = '', dob = '2017-01-01', gender = 'Nam', notes = '';
        if (cols.length >= 6 && /^\\d+$/.test(cols[0])) {
          code = cols[1]; name = cols[2]; clsName = cols[3]; dob = cols[4] || dob; gender = cols[5] || gender; notes = cols[6] || '';
        } else if (cols.length >= 3) {
          code = cols[0]; name = cols[1]; clsName = cols[2]; dob = cols[3] || dob; gender = cols[4] || gender; notes = cols[5] || '';
        }

        if (!name) { errs.push('Dòng ' + (i+1) + ': Thiếu họ và tên'); continue; }
        if (!code) code = 'HS-' + Date.now().toString().slice(-4) + '-' + (valid.length + 1);

        const upperCode = code.toUpperCase();
        if (usedCodes.has(upperCode)) { errs.push('Dòng ' + (i+1) + ': Trùng mã HS "' + code + '"'); continue; }

        let matched = classMap.get(clsName.toUpperCase());
        if (!matched && appData.classes.length === 1) matched = appData.classes[0];
        if (!matched) { errs.push('Dòng ' + (i+1) + ': Không tìm thấy lớp "' + clsName + '"'); continue; }

        usedCodes.add(upperCode);
        valid.push({
          id: 'std-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          code: code,
          fullName: name,
          classId: matched.id,
          dob: dob.includes('/') ? dob.split('/').reverse().join('-') : dob,
          gender: gender.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam',
          status: 'Đang học',
          notes: notes,
          createdAt: new Date().toISOString()
        });
      }

      standaloneParsedStudents = valid;
      statusEl.style.display = 'block';
      if (valid.length > 0) {
        statusEl.style.background = '#ecfdf5';
        statusEl.style.border = '1px solid #bbf7d0';
        statusEl.style.color = '#166534';
        statusEl.innerHTML = '✓ Hợp lệ: Sẵn sàng thêm ' + valid.length + ' học sinh' + (errs.length > 0 ? ' (' + errs.length + ' dòng lỗi bỏ qua)' : '');
        importBtn.disabled = false;
        importBtn.innerText = 'Thêm ' + valid.length + ' học sinh';
      } else {
        statusEl.style.background = '#fef2f2';
        statusEl.style.border = '1px solid #fecaca';
        statusEl.style.color = '#991b1b';
        statusEl.innerHTML = '⚠️ Không có dòng nào hợp lệ: ' + errs.slice(0, 3).join('; ');
        importBtn.disabled = true;
      }
    }

    function confirmStandaloneImport() {
      if (standaloneParsedStudents.length === 0) return;
      appData.students.push(...standaloneParsedStudents);
      saveData();
      renderAll();
      closeModal('importModal');
      showToast('Đã thêm thành công ' + standaloneParsedStudents.length + ' học sinh!');
    }

    function initData() {
      try {
        const stored = localStorage.getItem('NVIET_TRI_CLASSROOM_DATA_V1');
        if (stored) {
          appData = JSON.parse(stored);
        } else {
          appData = DEFAULT_DATA;
          saveData();
        }
      } catch(e) {
        appData = DEFAULT_DATA;
      }
      renderAll();
    }

    function saveData() {
      try {
        localStorage.setItem('NVIET_TRI_CLASSROOM_DATA_V1', JSON.stringify(appData));
      } catch(e) {
        console.error('Lỗi lưu dữ liệu:', e);
      }
    }

    function showToast(msg) {
      const container = document.getElementById('toastContainer');
      const div = document.createElement('div');
      div.className = 'toast-msg';
      div.innerHTML = '✓ ' + msg;
      container.appendChild(div);
      setTimeout(() => { div.remove(); }, 3000);
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
      
      const targetPane = document.getElementById('tab-' + tabId);
      const targetBtn = document.getElementById('nav-btn-' + tabId);
      if (targetPane) targetPane.classList.add('active');
      if (targetBtn) targetBtn.classList.add('active');
    }

    function openModal(id) { document.getElementById(id).classList.add('open'); }
    function closeModal(id) { document.getElementById(id).classList.remove('open'); }

    // Helpers
    function formatDate(str) {
      if (!str) return '--/--/----';
      const parts = str.split('T')[0].split('-');
      if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
      return str;
    }

    // Render Stats & Overview
    function renderOverview() {
      const totalClasses = appData.classes.length;
      const totalStudents = appData.students.length;
      
      const evaluatedStudentIds = new Set(appData.progressRecords.map(r => r.studentId));
      const trackingCount = evaluatedStudentIds.size;

      // Calculate good progress & need support
      const goodCount = appData.progressRecords.filter(r => r.level === 'Hoàn thành tốt').length;
      const needSupportCount = appData.progressRecords.filter(r => r.level === 'Cần hỗ trợ thêm').length;

      document.getElementById('stat-total-classes').innerText = totalClasses;
      document.getElementById('stat-total-students').innerText = totalStudents;
      document.getElementById('stat-tracking-students').innerText = trackingCount;
      document.getElementById('stat-progress-good').innerText = goodCount;
      document.getElementById('stat-need-support').innerText = needSupportCount;

      document.getElementById('nav-count-classes').innerText = totalClasses;
      document.getElementById('nav-count-students').innerText = totalStudents;
      document.getElementById('nav-count-progress').innerText = appData.progressRecords.length;

      // Class distribution chart
      const chartEl = document.getElementById('chart-class-distribution');
      chartEl.innerHTML = '';
      if (totalClasses === 0) {
        chartEl.innerHTML = '<div style="color:#94a3b8; font-size:13px;">Chưa có dữ liệu lớp học</div>';
      } else {
        const counts = appData.classes.map(c => {
          const count = appData.students.filter(s => s.classId === c.id).length;
          return { name: c.name, count };
        });
        const max = Math.max(...counts.map(c => c.count), 1);
        counts.forEach(item => {
          const heightPercent = Math.max((item.count / max) * 100, 10);
          const col = document.createElement('div');
          col.style = 'flex: 1; display:flex; flex-direction:column; align-items:center; gap:6px;';
          col.innerHTML = \`
            <div style="font-size:12px; font-weight:700; color:#2563eb;">\${item.count} HS</div>
            <div style="width:100%; max-width:44px; height:\${heightPercent}%; min-height:16px; background:#3b82f6; border-radius:6px 6px 0 0;"></div>
            <div style="font-size:12px; font-weight:600; color:#475569;">\${item.name}</div>
          \`;
          chartEl.appendChild(col);
        });
      }

      // Level distribution chart
      const levelEl = document.getElementById('chart-level-distribution');
      levelEl.innerHTML = '';
      const totalRecs = appData.progressRecords.length;
      if (totalRecs === 0) {
        levelEl.innerHTML = '<div style="color:#94a3b8; font-size:13px; padding-top:20px;">Chưa có đánh giá tiến độ</div>';
      } else {
        const levels = [
          { label: 'Hoàn thành tốt', count: goodCount, color: '#16a34a' },
          { label: 'Hoàn thành', count: appData.progressRecords.filter(r => r.level === 'Hoàn thành').length, color: '#0284c7' },
          { label: 'Cần hỗ trợ thêm', count: needSupportCount, color: '#ea580c' },
        ];
        levelEl.innerHTML = levels.map(l => {
          const pct = Math.round((l.count / totalRecs) * 100);
          return \`
            <div style="margin-bottom:12px;">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; margin-bottom:4px;">
                <span>\${l.label}</span>
                <span>\${l.count} (\${pct}%)</span>
              </div>
              <div style="height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
                <div style="height:100%; width:\${pct}%; background:\${l.color};"></div>
              </div>
            </div>
          \`;
        }).join('');
      }

      // Concern table
      const concernList = document.getElementById('overview-concern-list');
      const needSupportRecords = appData.progressRecords.filter(r => r.level === 'Cần hỗ trợ thêm').slice(0, 5);
      if (needSupportRecords.length === 0) {
        concernList.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b; padding:20px;">Hiện tại không có học sinh nào ở mức cần hỗ trợ thêm.</td></tr>';
      } else {
        const studentMap = new Map(appData.students.map(s => [s.id, s]));
        const classMap = new Map(appData.classes.map(c => [c.id, c]));
        concernList.innerHTML = needSupportRecords.map(r => {
          const s = studentMap.get(r.studentId);
          const c = classMap.get(r.classId);
          return \`
            <tr>
              <td><strong>\${s ? s.code : '--'}</strong></td>
              <td><strong>\${s ? s.fullName : 'Học sinh'}</strong></td>
              <td><span class="badge badge-gray">\${c ? c.name : '--'}</span></td>
              <td>\${r.subject}</td>
              <td style="color:#b45309;">\${r.topic}</td>
              <td>\${r.supportAction || r.teacherComment}</td>
              <td>
                <button class="btn btn-outline btn-sm" onclick="quickSupportStudent('\${r.studentId}', '\${r.classId}', '\${r.subject}')">Hỗ trợ</button>
              </td>
            </tr>
          \`;
        }).join('');
      }

      // Activities
      const actContainer = document.getElementById('recent-activities-list');
      if (!appData.activityLogs || appData.activityLogs.length === 0) {
        actContainer.innerHTML = '<div style="color:#94a3b8; font-size:12px;">Chưa có hoạt động nào được ghi nhận.</div>';
      } else {
        actContainer.innerHTML = appData.activityLogs.slice(0, 5).map(a => \`
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; background:#f8fafc; border-radius:6px; font-size:12px;">
            <div>
              <span style="font-weight:700; color:#1e293b;">\${a.action}:</span>
              <span style="color:#475569; margin-left:6px;">\${a.details}</span>
            </div>
            <span style="color:#94a3b8; font-size:11px;">\${formatDate(a.timestamp)}</span>
          </div>
        \`).join('');
      }
    }

    // Render Classes
    function renderClasses() {
      const tbody = document.getElementById('classes-table-body');
      const search = (document.getElementById('class-search').value || '').toLowerCase();
      const yearFilter = document.getElementById('class-year-filter').value;

      let filtered = appData.classes.filter(c => {
        const matchSearch = c.code.toLowerCase().includes(search) || c.name.toLowerCase().includes(search);
        const matchYear = !yearFilter || c.academicYear === yearFilter;
        return matchSearch && matchYear;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b; padding:24px;">Không tìm thấy lớp học nào phù hợp.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(c => {
        const studentCount = appData.students.filter(s => s.classId === c.id).length;
        return \`
          <tr>
            <td><strong>\${c.code}</strong></td>
            <td><strong style="color:#1d4ed8;">\${c.name}</strong></td>
            <td>\${c.academicYear}</td>
            <td>\${c.teacherInCharge || 'Nguyễn Viết Tri'}</td>
            <td><span class="badge badge-good">\${studentCount} học sinh</span></td>
            <td style="color:#64748b; max-width:260px;">\${c.notes || '--'}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-outline btn-sm" onclick="filterStudentsByClass('\${c.id}')">Xem HS</button>
                <button class="btn btn-outline btn-sm" onclick="editClass('\${c.id}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteClass('\${c.id}')">Xóa</button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // Render Students
    function renderStudents() {
      const tbody = document.getElementById('students-table-body');
      const search = (document.getElementById('student-search').value || '').toLowerCase();
      const classFilter = document.getElementById('student-class-filter').value;
      const statusFilter = document.getElementById('student-status-filter').value;
      const sort = document.getElementById('student-sort').value;

      const classMap = new Map(appData.classes.map(c => [c.id, c.name]));

      let filtered = appData.students.filter(s => {
        const matchSearch = s.fullName.toLowerCase().includes(search) || s.code.toLowerCase().includes(search);
        const matchClass = !classFilter || s.classId === classFilter;
        const matchStatus = !statusFilter || s.status === statusFilter;
        return matchSearch && matchClass && matchStatus;
      });

      // Sorting
      filtered.sort((a, b) => {
        if (sort === 'name-asc') return a.fullName.localeCompare(b.fullName, 'vi');
        if (sort === 'name-desc') return b.fullName.localeCompare(a.fullName, 'vi');
        if (sort === 'code-asc') return a.code.localeCompare(b.code);
        return 0;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#64748b; padding:24px;">Không có học sinh nào phù hợp.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map((s, idx) => {
        const className = classMap.get(s.classId) || 'Chưa xếp lớp';
        let statusBadge = 'badge-good';
        if (s.status === 'Chuyển trường') statusBadge = 'badge-warn';
        if (s.status === 'Nghỉ học') statusBadge = 'badge-danger';

        return \`
          <tr>
            <td>\${idx + 1}</td>
            <td><strong>\${s.code}</strong></td>
            <td><strong>\${s.fullName}</strong></td>
            <td><span class="badge badge-gray">\${className}</span></td>
            <td>\${formatDate(s.dob)}</td>
            <td>\${s.gender}</td>
            <td><span class="badge \${statusBadge}">\${s.status}</span></td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-outline btn-sm" onclick="editStudent('\${s.id}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent('\${s.id}')">Xóa</button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    // Render Progress
    function renderProgress() {
      const tbody = document.getElementById('progress-table-body');
      const classFilter = document.getElementById('progress-class-filter').value;
      const studentFilter = document.getElementById('progress-student-filter').value;
      const subjectFilter = document.getElementById('progress-subject-filter').value;
      const levelFilter = document.getElementById('progress-level-filter').value;

      const studentMap = new Map(appData.students.map(s => [s.id, s]));
      const classMap = new Map(appData.classes.map(c => [c.id, c.name]));

      let filtered = appData.progressRecords.filter(r => {
        const matchClass = !classFilter || r.classId === classFilter;
        const matchStudent = !studentFilter || r.studentId === studentFilter;
        const matchSubject = !subjectFilter || r.subject === subjectFilter;
        const matchLevel = !levelFilter || r.level === levelFilter;
        return matchClass && matchStudent && matchSubject && matchLevel;
      });

      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:#64748b; padding:24px;">Chưa có bản ghi tiến độ nào phù hợp.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(r => {
        const s = studentMap.get(r.studentId);
        const className = classMap.get(r.classId) || '--';

        let lvlBadge = 'badge-pass';
        if (r.level === 'Hoàn thành tốt') lvlBadge = 'badge-good';
        if (r.level === 'Cần hỗ trợ thêm') lvlBadge = 'badge-danger';

        return \`
          <tr>
            <td>\${formatDate(r.date)}</td>
            <td><strong>\${s ? s.fullName : 'HS'}</strong> <span style="font-size:11px; color:#64748b;">(\${s ? s.code : ''})</span></td>
            <td><span class="badge badge-gray">\${className}</span></td>
            <td><strong>\${r.subject}</strong></td>
            <td>\${r.topic}</td>
            <td><span class="badge \${lvlBadge}">\${r.level}</span></td>
            <td style="max-width:240px;">\${r.teacherComment}</td>
            <td style="max-width:200px; color:#475569;">\${r.supportAction || '--'}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn btn-outline btn-sm" onclick="editProgress('\${r.id}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProgress('\${r.id}')">Xóa</button>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function populateSelects() {
      // Student class select
      const sSelect = document.getElementById('student-class-select');
      const sFilter = document.getElementById('student-class-filter');
      const pClassFilter = document.getElementById('progress-class-filter');
      const progClassSelect = document.getElementById('prog-class-select');

      const classOptions = appData.classes.map(c => \`<option value="\${c.id}">\${c.name} (\${c.code})</option>\`).join('');

      sSelect.innerHTML = classOptions;
      sFilter.innerHTML = '<option value="">Tất cả lớp học</option>' + classOptions;
      pClassFilter.innerHTML = '<option value="">Tất cả lớp</option>' + classOptions;
      progClassSelect.innerHTML = classOptions;

      onProgClassChange();
      onProgressClassFilterChange();
    }

    function onProgClassChange() {
      const classId = document.getElementById('prog-class-select').value;
      const select = document.getElementById('prog-student-select');
      const matched = appData.students.filter(s => s.classId === classId);
      select.innerHTML = matched.map(s => \`<option value="\${s.id}">\${s.fullName} (\${s.code})</option>\`).join('');
    }

    function onProgressClassFilterChange() {
      const classId = document.getElementById('progress-class-filter').value;
      const sFilter = document.getElementById('progress-student-filter');
      let students = appData.students;
      if (classId) {
        students = students.filter(s => s.classId === classId);
      }
      sFilter.innerHTML = '<option value="">Tất cả học sinh</option>' + students.map(s => \`<option value="\${s.id}">\${s.fullName} (\${s.code})</option>\`).join('');
      renderProgress();
    }

    function renderAll() {
      populateSelects();
      renderOverview();
      renderClasses();
      renderStudents();
      renderProgress();
    }

    // Modal Actions
    function openAddClassModal() {
      document.getElementById('classModalTitle').innerText = 'Thêm lớp học mới';
      document.getElementById('class-id').value = '';
      document.getElementById('class-code').value = '';
      document.getElementById('class-name').value = '';
      document.getElementById('class-academic-year').value = '2026-2027';
      document.getElementById('class-teacher').value = 'Nguyễn Viết Tri';
      document.getElementById('class-notes').value = '';
      openModal('classModal');
    }

    function editClass(id) {
      const c = appData.classes.find(item => item.id === id);
      if (!c) return;
      document.getElementById('classModalTitle').innerText = 'Chỉnh sửa thông tin lớp';
      document.getElementById('class-id').value = c.id;
      document.getElementById('class-code').value = c.code;
      document.getElementById('class-name').value = c.name;
      document.getElementById('class-academic-year').value = c.academicYear;
      document.getElementById('class-teacher').value = c.teacherInCharge || 'Nguyễn Viết Tri';
      document.getElementById('class-notes').value = c.notes || '';
      openModal('classModal');
    }

    function handleSaveClass(e) {
      e.preventDefault();
      const id = document.getElementById('class-id').value;
      const code = document.getElementById('class-code').value.trim();
      const name = document.getElementById('class-name').value.trim();
      const academicYear = document.getElementById('class-academic-year').value.trim();
      const teacherInCharge = document.getElementById('class-teacher').value.trim();
      const notes = document.getElementById('class-notes').value.trim();

      // Check unique code
      const duplicate = appData.classes.find(c => c.code.toLowerCase() === code.toLowerCase() && c.id !== id);
      if (duplicate) {
        alert('Mã lớp "' + code + '" đã tồn tại. Vui lòng chọn mã lớp khác!');
        return;
      }

      if (id) {
        const idx = appData.classes.findIndex(c => c.id === id);
        if (idx !== -1) {
          appData.classes[idx] = { ...appData.classes[idx], code, name, academicYear, teacherInCharge, notes };
          logActivity('Cập nhật lớp học', 'Đã sửa thông tin lớp ' + name, 'class');
          showToast('Đã cập nhật lớp học ' + name);
        }
      } else {
        const newClass = {
          id: 'cls-' + Date.now(),
          code,
          name,
          academicYear,
          teacherInCharge,
          notes,
          createdAt: new Date().toISOString()
        };
        appData.classes.push(newClass);
        logActivity('Thêm lớp học mới', 'Đã tạo lớp ' + name + ' (' + academicYear + ')', 'class');
        showToast('Đã tạo thành công lớp học ' + name);
      }

      saveData();
      closeModal('classModal');
      renderAll();
    }

    function deleteClass(id) {
      const c = appData.classes.find(item => item.id === id);
      if (!c) return;

      const studentCount = appData.students.filter(s => s.classId === id).length;
      if (studentCount > 0) {
        const confirmDel = confirm('Lớp ' + c.name + ' hiện đang có ' + studentCount + ' học sinh! Bạn có chắc chắn muốn xóa lớp này không? Học sinh sẽ không bị xóa mà cần được chuyển sang lớp mới.');
        if (!confirmDel) return;
      } else {
        if (!confirm('Bạn có chắc chắn muốn xóa lớp ' + c.name + ' không?')) return;
      }

      appData.classes = appData.classes.filter(item => item.id !== id);
      logActivity('Xóa lớp học', 'Đã xóa lớp ' + c.name, 'class');
      saveData();
      renderAll();
      showToast('Đã xóa lớp ' + c.name);
    }

    function filterStudentsByClass(classId) {
      switchTab('students');
      document.getElementById('student-class-filter').value = classId;
      renderStudents();
    }

    // Student Actions
    function openAddStudentModal() {
      if (appData.classes.length === 0) {
        alert('Vui lòng tạo ít nhất một lớp học trước khi thêm học sinh!');
        openAddClassModal();
        return;
      }
      document.getElementById('studentModalTitle').innerText = 'Thêm học sinh mới';
      document.getElementById('student-id').value = '';
      document.getElementById('student-code').value = '';
      document.getElementById('student-fullname').value = '';
      document.getElementById('student-dob').value = '2017-01-01';
      document.getElementById('student-gender').value = 'Nam';
      document.getElementById('student-status-select').value = 'Đang học';
      document.getElementById('student-notes').value = '';
      openModal('studentModal');
    }

    function editStudent(id) {
      const s = appData.students.find(item => item.id === id);
      if (!s) return;
      document.getElementById('studentModalTitle').innerText = 'Chỉnh sửa hồ sơ học sinh';
      document.getElementById('student-id').value = s.id;
      document.getElementById('student-code').value = s.code;
      document.getElementById('student-fullname').value = s.fullName;
      document.getElementById('student-class-select').value = s.classId;
      document.getElementById('student-dob').value = s.dob;
      document.getElementById('student-gender').value = s.gender;
      document.getElementById('student-status-select').value = s.status;
      document.getElementById('student-notes').value = s.notes || '';
      openModal('studentModal');
    }

    function handleSaveStudent(e) {
      e.preventDefault();
      const id = document.getElementById('student-id').value;
      const code = document.getElementById('student-code').value.trim();
      const fullName = document.getElementById('student-fullname').value.trim();
      const classId = document.getElementById('student-class-select').value;
      const dob = document.getElementById('student-dob').value;
      const gender = document.getElementById('student-gender').value;
      const status = document.getElementById('student-status-select').value;
      const notes = document.getElementById('student-notes').value.trim();

      const duplicate = appData.students.find(s => s.code.toLowerCase() === code.toLowerCase() && s.id !== id);
      if (duplicate) {
        alert('Mã học sinh "' + code + '" đã tồn tại. Vui lòng nhập mã học sinh khác!');
        return;
      }

      if (id) {
        const idx = appData.students.findIndex(s => s.id === id);
        if (idx !== -1) {
          appData.students[idx] = { ...appData.students[idx], code, fullName, classId, dob, gender, status, notes };
          logActivity('Cập nhật học sinh', 'Đã sửa hồ sơ em ' + fullName, 'student');
          showToast('Đã cập nhật hồ sơ học sinh ' + fullName);
        }
      } else {
        const newStudent = {
          id: 'std-' + Date.now(),
          code,
          fullName,
          classId,
          dob,
          gender,
          status,
          notes,
          createdAt: new Date().toISOString()
        };
        appData.students.push(newStudent);
        logActivity('Thêm học sinh mới', 'Đã thêm hồ sơ em ' + fullName, 'student');
        showToast('Đã thêm học sinh ' + fullName);
      }

      saveData();
      closeModal('studentModal');
      renderAll();
    }

    function deleteStudent(id) {
      const s = appData.students.find(item => item.id === id);
      if (!s) return;
      if (!confirm('Bạn có chắc chắn muốn xóa hồ sơ học sinh ' + s.fullName + ' (' + s.code + ')?')) return;

      appData.students = appData.students.filter(item => item.id !== id);
      logActivity('Xóa học sinh', 'Đã xóa học sinh ' + s.fullName, 'student');
      saveData();
      renderAll();
      showToast('Đã xóa học sinh ' + s.fullName);
    }

    // Progress Actions
    function openAddProgressModal() {
      if (appData.students.length === 0) {
        alert('Chưa có học sinh nào. Vui lòng thêm học sinh trước khi đánh giá!');
        openAddStudentModal();
        return;
      }
      document.getElementById('progressModalTitle').innerText = 'Thêm bản ghi tiến độ học tập';
      document.getElementById('progress-id').value = '';
      document.getElementById('prog-date').value = new Date().toISOString().slice(0, 10);
      document.getElementById('prog-topic').value = '';
      document.getElementById('prog-level').value = 'Hoàn thành';
      document.getElementById('prog-comment').value = '';
      document.getElementById('prog-support').value = '';
      openModal('progressModal');
    }

    function editProgress(id) {
      const r = appData.progressRecords.find(item => item.id === id);
      if (!r) return;
      document.getElementById('progressModalTitle').innerText = 'Chỉnh sửa đánh giá tiến độ';
      document.getElementById('progress-id').value = r.id;
      document.getElementById('prog-class-select').value = r.classId;
      onProgClassChange();
      document.getElementById('prog-student-select').value = r.studentId;
      document.getElementById('prog-subject').value = r.subject;
      document.getElementById('prog-date').value = r.date;
      document.getElementById('prog-topic').value = r.topic;
      document.getElementById('prog-level').value = r.level;
      document.getElementById('prog-comment').value = r.teacherComment;
      document.getElementById('prog-support').value = r.supportAction || '';
      openModal('progressModal');
    }

    function handleSaveProgress(e) {
      e.preventDefault();
      const id = document.getElementById('progress-id').value;
      const classId = document.getElementById('prog-class-select').value;
      const studentId = document.getElementById('prog-student-select').value;
      const subject = document.getElementById('prog-subject').value;
      const date = document.getElementById('prog-date').value;
      const topic = document.getElementById('prog-topic').value.trim();
      const level = document.getElementById('prog-level').value;
      const teacherComment = document.getElementById('prog-comment').value.trim();
      const supportAction = document.getElementById('prog-support').value.trim();

      const student = appData.students.find(s => s.id === studentId);
      const studentName = student ? student.fullName : 'học sinh';

      if (id) {
        const idx = appData.progressRecords.findIndex(r => r.id === id);
        if (idx !== -1) {
          appData.progressRecords[idx] = { ...appData.progressRecords[idx], classId, studentId, subject, date, topic, level, teacherComment, supportAction };
          logActivity('Cập nhật đánh giá', 'Đã sửa nhận xét môn ' + subject + ' của em ' + studentName, 'progress');
          showToast('Đã cập nhật đánh giá cho em ' + studentName);
        }
      } else {
        const newRecord = {
          id: 'rec-' + Date.now(),
          classId,
          studentId,
          subject,
          date,
          topic,
          level,
          teacherComment,
          supportAction,
          createdAt: new Date().toISOString()
        };
        appData.progressRecords.push(newRecord);
        logActivity('Đánh giá tiến độ', 'Đã đánh giá môn ' + subject + ' (' + level + ') cho em ' + studentName, 'progress');
        showToast('Đã lưu đánh giá tiến độ cho em ' + studentName);
      }

      saveData();
      closeModal('progressModal');
      renderAll();
    }

    let pendingDeleteProgressId = null;

    function deleteProgress(id) {
      pendingDeleteProgressId = id;
      const rec = appData.progressRecords.find(r => r.id === id);
      const student = rec ? appData.students.find(s => s.id === rec.studentId) : null;
      const sName = student ? student.fullName : 'học sinh';
      const sub = rec ? rec.subject : 'môn học';
      document.getElementById('delete-progress-desc').innerText = 'Bạn có chắc chắn muốn xóa bản ghi đánh giá môn ' + sub + ' của em ' + sName + ' không?';
      openModal('deleteProgressConfirmModal');
    }

    function confirmDeleteProgress() {
      if (!pendingDeleteProgressId) return;
      const rec = appData.progressRecords.find(r => r.id === pendingDeleteProgressId);
      const student = rec ? appData.students.find(s => s.id === rec.studentId) : null;
      const sName = student ? student.fullName : 'học sinh';
      appData.progressRecords = appData.progressRecords.filter(r => r.id !== pendingDeleteProgressId);
      logActivity('Xóa đánh giá', 'Đã xóa bản ghi đánh giá của em ' + sName, 'progress');
      saveData();
      renderAll();
      closeModal('deleteProgressConfirmModal');
      showToast('Đã xóa bản ghi đánh giá');
      pendingDeleteProgressId = null;
    }

    function quickSupportStudent(studentId, classId, subject) {
      openAddProgressModal();
      document.getElementById('prog-class-select').value = classId;
      onProgClassChange();
      document.getElementById('prog-student-select').value = studentId;
      document.getElementById('prog-subject').value = subject;
      document.getElementById('prog-level').value = 'Cần hỗ trợ thêm';
    }

    function logActivity(action, details, type) {
      if (!appData.activityLogs) appData.activityLogs = [];
      appData.activityLogs.unshift({
        id: 'act-' + Date.now(),
        timestamp: new Date().toISOString(),
        action,
        details,
        type
      });
      if (appData.activityLogs.length > 30) appData.activityLogs.pop();
    }

    // Backup & Restore
    function exportBackupData() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "Sao_Luu_Quan_Tri_Lop_Hoc_Nguyen_Viet_Tri_" + new Date().toISOString().slice(0, 10) + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Đã tải xuống tệp sao lưu dữ liệu');
    }

    function handleRestoreFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.classes) && Array.isArray(parsed.students)) {
            if (confirm('CẢNH BÁO: Thao tác này sẽ ghi đè toàn bộ dữ liệu hiện tại bằng dữ liệu từ tệp sao lưu. Bạn có chắc chắn muốn tiếp tục?')) {
              appData = parsed;
              saveData();
              renderAll();
              alert('Khôi phục dữ liệu thành công!');
            }
          } else {
            alert('Tệp sao lưu không hợp lệ hoặc thiếu thông tin lớp học/học sinh.');
          }
        } catch(err) {
          alert('Lỗi đọc tệp sao lưu: ' + err.message);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }

    // CSV Downloads
    function downloadStudentsCSV() {
      const classMap = new Map(appData.classes.map(c => [c.id, c.name]));
      let csv = "STT,Mã học sinh,Họ và tên,Lớp,Ngày sinh,Giới tính,Trạng thái,Ghi chú\\r\\n";
      appData.students.forEach((s, i) => {
        csv += \`\${i + 1},"\${s.code}","\${s.fullName}","\${classMap.get(s.classId) || ''}",\${formatDate(s.dob)},\${s.gender},\${s.status},"\${s.notes || ''}"\\r\\n\`;
      });
      const blob = new Blob(["\\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "Danh_Sach_Hoc_Sinh_Tu_Mo_Rong.csv";
      link.click();
    }

    function downloadProgressCSV() {
      const studentMap = new Map(appData.students.map(s => [s.id, s]));
      const classMap = new Map(appData.classes.map(c => [c.id, c.name]));
      let csv = "STT,Mã học sinh,Họ và tên,Lớp,Môn học,Ngày đánh giá,Nội dung kỹ năng,Mức độ,Nhận xét của giáo viên,Đề xuất hỗ trợ\\r\\n";
      appData.progressRecords.forEach((r, i) => {
        const s = studentMap.get(r.studentId);
        csv += \`\${i + 1},"\${s ? s.code : ''}","\${s ? s.fullName : ''}","\${classMap.get(r.classId) || ''}","\${r.subject}",\${formatDate(r.date)},"\${r.topic}","\${r.level}","\${r.teacherComment}","\${r.supportAction || ''}"\\r\\n\`;
      });
      const blob = new Blob(["\\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = "Bao_Cao_Tien_Do_Hoc_Tap.csv";
      link.click();
    }

    // Boot
    window.onload = initData;
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(data: SystemData) {
  const htmlContent = generateStandaloneHtml(data);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'quan-tri-lop-hoc.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
