/* Ace Records — browser-only academic record demo by Ayush Agnihotri.
   Data is stored in this browser's LocalStorage. This is a demo, not secure production authentication. */
(() => {
  'use strict';

  const DB_KEY = 'aceRecordsDemoDB_v1';
  const MAX_EVIDENCE_BYTES = 700 * 1024;
  const DEMO_PASSWORD = 'ayush@2525';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let db;
  let activeUser = null;
  let currentView = 'dashboard';
  let focusedStudentId = null;
  let correctionFilterStudentId = ''; 

  const studentSeed = [
    ['STU1001','Ayush Agnihotri','ayush.agnihotri@itmud.in','B.Tech Computer Science & Engineering','Computer Science',2],
    ['STU1002','Mack Kushwah','mack@itmud.in','BBA / BBA (Honours / Research)','Business & Management',1],
    ['STU1003','Neotri Sharma','neotri@itmud.in','BCA / BCA (Honours / Research)','Computer Applications',3],
    ['STU1004','Mack Pushpa','mack.pushpa@itmud.in','B.Com / B.Com (Honours / Research)','Commerce',4],
    ['STU1005','Riya Sinha','riya.sinha@itmud.in','B.Sc Agriculture','Agriculture',1],
    ['STU1006','Tejas Reddy','tejas.reddy@itmud.in','B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)','Computer Science & Intelligent Systems',3],
    ['STU1007','Kavya Nair','kavya.nair@itmud.in','B.A. LL.B (Honours)','Law',2],
    ['STU1008','Arjun Mehta','arjun.mehta@itmud.in','B.Pharm','Pharmacy',2],
    ['STU1009','Sana Khan','sana.khan@itmud.in','B.Sc Nursing','Nursing Sciences',4],
    ['STU1010','Devansh Rao','devansh.rao@itmud.in','MBA','Business & Management',1]
  ];
  const COURSE_OPTIONS = [
    'B.Tech Computer Science', 'B.Tech Computer Science & Engineering',
    'B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning)',
    'B.Tech Computer Science & Engineering (Data Science)', 'B.Tech Computer Science & Engineering (Cyber Security)',
    'B.Tech Information Technology', 'B.Tech Electronics & Communication Engineering',
    'B.Tech Electrical Engineering', 'B.Tech Mechanical Engineering', 'B.Tech Civil Engineering',
    'B.Tech + M.Tech / MBA (Integrated)', 'BCA / BCA (Honours / Research)', 'BBA / BBA (Honours / Research)',
    'B.Com / B.Com (Honours / Research)', 'B.Com Digital Sales & Marketing',
    'B.Com Real Estate & Property Management', 'B.Pharm', 'B.Sc Nursing', 'B.Sc Agriculture',
    'B.Sc Forensic Science', 'B.Sc Biotechnology', 'B.Sc Microbiology', 'B.Sc Food Technology',
    'B.Sc PCM / Computer Science', 'B.Sc Interior Design / Fashion Design', 'B.P.E.S', 'B.P.Ed', 'B.Ed',
    'B.A. LL.B (Honours)', 'BBA LL.B (Honours)', 'B.Com LL.B (Honours)',
    'B.A. Journalism & Mass Communication', 'Bachelor of Physiotherapy (BPT)',
    'BMLT (Medical Laboratory Technology)', 'M.Tech', 'MCA', 'MBA', 'M.Pharm', 'M.Sc Nursing',
    'M.Sc Agriculture', 'M.Sc Food Technology', 'M.Sc Biotechnology', 'M.Sc Mathematics',
    'M.Sc Physics', 'M.Sc Chemistry', 'M.Sc Forensic Science', 'M.P.E.S', 'LL.M'
  ];
  const DEPARTMENT_OPTIONS = [
    'Computer Science', 'Computer Science & Intelligent Systems', 'Computer Applications',
    'Civil Engineering', 'Mechanical Engineering', 'Electronics & Communication Engineering',
    'Electrical Engineering', 'Information Technology', 'Business & Management', 'Commerce', 'Law',
    'Pharmacy', 'Nursing Sciences', 'Agriculture', 'Sciences', 'Sports Education', 'Education',
    'Arts & Design', 'Journalism & Mass Communication', 'Medical & Allied Healthcare',
    'Humanities & Literary Studies'
  ];
  function optionOptions(values, selected = '') {
    const options = selected && !values.includes(selected) ? [selected, ...values] : values;
    return options.map(value => `<option value="${escapeHTML(value)}" ${selected === value ? 'selected' : ''}>${escapeHTML(value)}</option>`).join('');
  }

  const firstNames = ['Aarav','Anvi','Vihaan','Kiara','Rudra','Sara','Dhruv','Ishita','Yuvaan','Navya'];
  const surnames = ['Mehta','Shah','Reddy','Saxena','Chauhan','Pillai','Sinha','Kulkarni','Bhatia','Arora'];

  function makeSeedStudent(row, index) {
    const [id, name, email, course, department, year] = row;
    const base10 = 72 + ((index * 7) % 23);
    const base12 = 68 + ((index * 9) % 28);
    const semesters = Array.from({ length: 8 }, (_, i) => {
      const semIndex = i + 1;
      const isCompleted = semIndex <= Number(year) * 2;
      const sgpa = isCompleted ? Number((6.1 + ((index * 5 + semIndex * 3) % 36) / 10).toFixed(2)) : '';
      return { label: `Semester ${semIndex}`, sgpa, credits: isCompleted ? 20 + (semIndex % 2) * 2 : '', attendance: isCompleted ? 66 + ((index * 7 + semIndex * 5) % 33) : '', backlogs: isCompleted ? ((index + semIndex) % 11 === 0 ? 1 : 0) : 0 };
    });
    const activities = index % 3 === 0 ? [
      { id: `ACT-${id}-1`, title: 'Tech Fest Volunteer', type: 'Volunteering', date: '2026-08-18', description: 'Helped coordinate student registrations and event flow.' },
      { id: `ACT-${id}-2`, title: 'Presentation Skills Workshop', type: 'Workshop', date: '2026-09-06', description: 'Completed a college communication workshop.' }
    ] : [{ id: `ACT-${id}-1`, title: index % 2 ? 'Inter-college Quiz' : 'Campus Club Meet', type: index % 2 ? 'Competition' : 'Club', date: '2026-09-12', description: 'Participated in a campus learning activity.' }];
    return {
      id, password: DEMO_PASSWORD, profile: {
        name, email, phone: String(9000000101 + index),
        dob: `${String(4 + (index % 22)).padStart(2,'0')}-0${1 + (index % 8)}-200${4 + (index % 4)}`,
        gender: index % 2 ? 'Female' : 'Male', address: 'Gwalior, Madhya Pradesh', guardian: `Parent / Guardian of ${name.split(' ')[0]}`,
        rollNo: `CS26${String(100 + index)}`, course, department, currentYear: year,
        section: ['A','B','C'][index % 3], admissionYear: 2026 - year + 1, expectedGraduation: 2026 - year + 4,
        feeStatus: ['Paid','Pending','Partly paid','Scholarship','Paid','Partly paid','Pending','Paid','Scholarship','Paid'][index % 10],
        feePaid: [125000,0,48000,90000,100000,76000,0,118000,85000,142000][index % 10]
      },
      academics: {
        class10: { board: index % 2 ? 'CBSE' : 'MP Board', school: `${['Central Public School','Sunrise Academy','City Model School'][index % 3]}`, passingYear: 2020 + (index % 4), marks: base10, maxMarks: 100, percentage: base10 },
        class12: { board: index % 2 ? 'CBSE' : 'MP Board', school: `${['Central Public School','Sunrise Academy','City Model School'][index % 3]}`, passingYear: 2022 + (index % 3), stream: ['Science','Commerce','Arts'][index % 3], marks: base12, maxMarks: 100, percentage: base12 },
        semesters
      },
      activities,
      attendance: 75 + ((index * 7) % 23),
      achievements: index % 4 === 0 ? ['Department Merit Mention','Certificate of Participation'] : ['Certificate of Participation'],
      notes: 'Fictional demonstration record — all names, contact details and academic details are sample data.'
    };
  }

  function seedDatabase() {
    const students = studentSeed.map(makeSeedStudent);
    const faculty = [
      { email: 'manish.g@direct.itmud.in', password: DEMO_PASSWORD, role: 'faculty', name: 'Manish Gupta', phone: '9000000201', department: 'Computer Science & Intelligent Systems', course: 'B.Tech Computer Science & Engineering' },
      { email: 'priya.s@direct.itmud.in', password: DEMO_PASSWORD, role: 'faculty', name: 'Priya Sharma', phone: '9000000202', department: 'Business & Management', course: 'BBA / BBA (Honours / Research)' },
      { email: 'rahul.m@direct.itmud.in', password: DEMO_PASSWORD, role: 'faculty', name: 'Rahul Mehta', phone: '9000000203', department: 'Pharmacy', course: 'B.Pharm' }
    ];
    const admin = { email: 'admin@ace.demo', password: DEMO_PASSWORD, role: 'admin', name: 'Ace Records Administrator', phone: '9000000200', department: 'Administration', course: 'University Administration' };
    const users = [
      admin,
      ...faculty,
      ...students.map(student => ({ email: student.profile.email, password: DEMO_PASSWORD, role: 'student', name: student.profile.name, studentId: student.id }))
    ];
    return {
      version: 4,
      users,
      students,
      events: [],
      requests: [],
      logs: [{ id: 'LOG-INIT', timestamp: new Date().toISOString(), actor: 'Ace Records', role: 'system', action: 'DEMO WORKSPACE CREATED', studentId: '', details: 'Three faculty and ten student example accounts are loaded. All sample accounts use the shared demonstration password.' }]
    };
  }

  function normalizeDatabase(parsed) {
    const demoDefaults = seedDatabase();
    const sampleStudentIds = new Set(demoDefaults.students.map(student => student.id));
    const legacyDemoIds = new Set(Array.from({ length: 19 }, (_, i) => `STU${1002 + i}`));

    // Replace only reserved sample IDs with the current sample records.
    // All accounts and records created by the site owner are retained.
    parsed.students = (parsed.students || []).filter(student => !sampleStudentIds.has(student.id) && !legacyDemoIds.has(student.id));
    parsed.users = (parsed.users || []).filter(user =>
      user.role === 'admin' ||
      user.role === 'faculty' ||
      (user.role === 'student' && parsed.students.some(student => student.id === user.studentId))
    );

    // Update the built-in Admin credentials without changing any custom Admin accounts.
    let admin = parsed.users.find(user => user.role === 'admin' && user.email === 'admin@ace.demo');
    const seededAdmin = demoDefaults.users.find(user => user.role === 'admin');
    if (admin) Object.assign(admin, seededAdmin);
    else parsed.users.unshift({ ...seededAdmin });

    // Rename the previous generic faculty demo account to the sample Manish Gupta account.
    const oldFaculty = parsed.users.find(user => user.role === 'faculty' && user.email === 'faculty@ace.demo');
    const facultyDefaults = demoDefaults.users.filter(user => user.role === 'faculty');
    facultyDefaults.forEach((sampleFaculty, index) => {
      let existing = parsed.users.find(user => user.role === 'faculty' && user.email === sampleFaculty.email);
      if (!existing && index === 0 && oldFaculty) existing = oldFaculty;
      if (existing) Object.assign(existing, sampleFaculty);
      else parsed.users.push({ ...sampleFaculty });
    });
    if (oldFaculty && oldFaculty.email === 'faculty@ace.demo') {
      parsed.users = parsed.users.filter(user => user !== oldFaculty);
    }

    parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
    parsed.events.forEach(event => {
      event.signups = Array.isArray(event.signups) ? event.signups : [];
      event.signupDeadline = event.signupDeadline || event.date || '';
    });
    parsed.requests = Array.isArray(parsed.requests) ? parsed.requests : [];
    parsed.logs = Array.isArray(parsed.logs) ? parsed.logs : [];

    // Restore the ten reserved sample student profiles and their logins.
    demoDefaults.students.forEach(student => {
      student.academics.semesters = Array.from({ length: 8 }, (_, index) =>
        student.academics.semesters?.[index] || ({ label: `Semester ${index + 1}`, sgpa: '', credits: '', attendance: '', backlogs: 0 })
      );
    });
    parsed.students.push(...demoDefaults.students);
    parsed.users.push(...demoDefaults.users.filter(user => user.role === 'student'));

    parsed.students.forEach(student => {
      if (student.cgpaOverride === undefined) student.cgpaOverride = '';
      student.academics = student.academics || {};
      student.academics.semesters = Array.from({ length: 8 }, (_, index) =>
        student.academics.semesters?.[index] || ({ label: `Semester ${index + 1}`, sgpa: '', credits: '', attendance: '', backlogs: 0 })
      );
    });
    parsed.version = 4;
    return parsed;
  }

  function loadDatabase() {
    try {
      const saved = localStorage.getItem(DB_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.students) && Array.isArray(parsed.users)) {
          const migrated = normalizeDatabase(parsed);
          try { localStorage.setItem(DB_KEY, JSON.stringify(migrated)); } catch (error) { console.warn(error); }
          return migrated;
        }
      }
    } catch (error) {
      console.warn('Ace Records could not read saved demo data:', error);
    }
    const fresh = seedDatabase();
    try { localStorage.setItem(DB_KEY, JSON.stringify(fresh)); } catch (error) { console.warn(error); }
    return fresh;
  }

  function saveDatabase() {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return true;
    } catch (error) {
      console.error(error);
      toast('Browser storage is full. Try a smaller evidence file or export your data.', 'error');
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]));
  }
  function initials(name) { return String(name || 'A').split(/\s+/).map(part => part[0]).slice(0,2).join('').toUpperCase(); }
  function getCurrentStudent() { return db.students.find(s => s.id === activeUser?.studentId); }
  function getStudent(id) { return db.students.find(s => s.id === id); }
  function getPendingCount() { return db.requests.filter(r => r.status === 'Pending').length; }
  function logAction(action, details, studentId = '', extra = {}) {
    db.logs.unshift({ id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, timestamp: new Date().toISOString(), actor: activeUser?.name || 'Ace Records', role: activeUser?.role || 'system', action, details, studentId, ...extra });
    if (db.logs.length > 500) db.logs.length = 500;
  }
  function toast(message, type = 'success') {
    const root = $('#toastRoot');
    if (!root) return;
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.textContent = message;
    root.append(node);
    setTimeout(() => node.remove(), 3300);
  }
  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  function formatDate(date) {
    if (!date) return '—';
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? escapeHTML(date) : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function formatDateTime(date) {
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
  function cgpa(student) {
    if (student.cgpaOverride !== undefined && student.cgpaOverride !== null && student.cgpaOverride !== '' && Number.isFinite(Number(student.cgpaOverride))) return Number(student.cgpaOverride).toFixed(2);
    const attended = student.academics.semesters.filter((s, i) => i < Number(student.profile.currentYear || 1) * 2 && Number(s.sgpa) > 0);
    if (!attended.length) return '—';
    return (attended.reduce((sum, sem) => sum + Number(sem.sgpa || 0), 0) / attended.length).toFixed(2);
  }
  function activeSemesters(student) { return student.academics.semesters.slice(0, Math.min(8, Number(student.profile.currentYear || 1) * 2)); }
  function averageAttendance(student) {
    const sems = activeSemesters(student).filter(sem => sem.attendance !== '' && sem.attendance !== null && sem.attendance !== undefined && Number.isFinite(Number(sem.attendance)));
    return sems.length ? Math.round(sems.reduce((sum, sem) => sum + Number(sem.attendance), 0) / sems.length) : Number(student.attendance || 0);
  }
  function statCard(label, value, icon, foot = '') {
    return `<div class="stat-card"><div class="stat-top"><span>${escapeHTML(label)}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${escapeHTML(value)}</div><div class="stat-foot">${escapeHTML(foot)}</div></div>`;
  }
  function pageHeading(title, subtitle, right = '') {
    return `<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div>${right || `<div class="date-chip">☀ ${new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div>`}</div>`;
  }
  function navItems() {
    if (activeUser.role === 'admin') return [
      ['dashboard','⌂','Admin overview'], ['students','🎒','Student directory'], ['faculty','🧑‍🏫','Faculty accounts'],
      ['approvals','✓','Approval inbox', getPendingCount()], ['activities','✦','Activities'], ['audit','◷','Audit trail']
    ];
    if (activeUser.role === 'faculty') return [
      ['dashboard','⌂','Faculty overview'], ['students','🎒','Student directory'],
      ['approvals','✓','Approval inbox', getPendingCount()], ['activities','✦','Activities'], ['my-profile','♙','My account']
    ];
    return [
      ['dashboard','⌂','Dashboard'], ['my-records','▤','My academics'], ['activities','✦','Activities'],
      ['corrections','↗','Correction requests', db.requests.filter(r => r.studentId === activeUser.studentId && r.status === 'Pending').length]
    ];
  }
  function renderNav() {
    $('#sideNav').innerHTML = navItems().map(([id, icon, label, count]) => `<button type="button" class="nav-item ${currentView === id ? 'active' : ''}" data-view="${id}"><span class="nav-icon">${icon}</span><span>${label}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`).join('');
  }
  function switchView(view) {
    currentView = view;
    renderNav();
    renderView();
    if (window.innerWidth < 650) $('#viewRoot')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderDashboard() {
    if (activeUser.role === 'faculty' || activeUser.role === 'admin') {
      const isAdmin = activeUser.role === 'admin';
      const total = db.students.length;
      const avgAttend = total ? Math.round(db.students.reduce((sum, s) => sum + averageAttendance(s), 0) / total) : 0;
      const cgpaValues = db.students.map(student => Number(cgpa(student))).filter(Number.isFinite);
      const avgCgpa = cgpaValues.length ? (cgpaValues.reduce((sum, value) => sum + value, 0) / cgpaValues.length).toFixed(2) : '—';
      const latest = db.logs.slice(0,5);
      const requests = db.requests.filter(r => r.status === 'Pending').slice(0,4);
      return `${pageHeading(isAdmin ? 'Admin overview' : 'Faculty overview', isAdmin ? 'Manage students, faculty accounts, activities and approvals.' : 'A clear snapshot of your students, their progress and updates.')}
        <div class="welcome-banner"><div><h2>Hello, ${escapeHTML(activeUser.name)}! 👋</h2><p>${isAdmin ? "Your administrator workspace is ready. Manage university records, accounts and activities." : "Your faculty workspace is ready. Review requests and keep student records moving forward."}</p></div><div class="welcome-emoji">${isAdmin ? "🛡️" : "🧑‍🏫"}</div></div>
        <div class="stats-grid">${statCard('Total students', total, '🎒', 'Across all departments')}${statCard('Pending approvals', getPendingCount(), '📝', 'Waiting for your review')}${statCard('Average attendance', `${avgAttend}%`, '📅', 'Across current student records')}${statCard('Average CGPA', avgCgpa, '⭐', 'Based on available semesters')}</div>
        <div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h3>Needs your attention</h3><button class="text-action" data-view="approvals">Open inbox →</button></div>${requests.length ? requests.map(requestCard).join('') : `<div class="empty-state"><b>All caught up! 🎉</b>No pending corrections right now.</div>`}</section>
        <section class="panel"><div class="panel-heading"><h3>${isAdmin ? 'Recent activity' : 'Faculty workspace'}</h3>${isAdmin ? '<button class="text-action" data-view="audit">View audit trail →</button>' : '<span class="pill">Faculty</span>'}</div>${isAdmin ? `<div class="log-list">${latest.map(logRow).join('')}</div>` : '<div class="empty-state">Use the student directory to view and update student records. Review pending corrections in the approval inbox. Your faculty account details are under My account.</div>'}</section></div>
        <div class="quick-actions">
          <button class="btn btn-blue btn-small" data-view="students">Browse student directory</button>
          <button class="btn btn-plain btn-small" data-view="approvals">Open approval inbox</button>
          <button class="btn btn-plain btn-small" data-view="activities">View activities</button>
          ${isAdmin ? '<button class="btn btn-blue btn-small" data-action="add-student">＋ Add student</button><button class="btn btn-plain btn-small" data-view="faculty">Manage faculty</button>' : ''}
          <button class="btn btn-plain btn-small" data-action="add-event">＋ Create activity</button>
          <button class="btn btn-plain btn-small" data-action="export">⇩ Export records</button>
        </div>`;
    }
    const student = getCurrentStudent();
    if (!student) return `<div class="empty-state"><b>Student record not found</b>Sign out and use a demo login.</div>`;
    const pending = db.requests.filter(r => r.studentId === student.id && r.status === 'Pending').length;
    const today = localDateString();
    const registeredEvents = db.events.filter(event => (event.signups || []).some(entry => entry.studentId === student.id)).sort((a,b) => String(a.date).localeCompare(String(b.date)));
    const upcomingRegisteredEvents = registeredEvents.filter(event => !event.date || event.date >= today).slice(0,4);
    const sems = activeSemesters(student);
    const completion = Math.min(100, Math.round((sems.length / 8) * 100));
    return `${pageHeading('Your dashboard', 'Your college journey, all in one bright little place.')}
      <div class="welcome-banner"><div><h2>Hey, ${escapeHTML(student.profile.name.split(' ')[0])}! Keep shining ✨</h2><p>Every class, project and achievement adds to your story. Here is your progress so far.</p></div><div class="welcome-emoji">🎓</div></div>
      <div class="stats-grid">${statCard('Attendance', `${averageAttendance(student)}%`, '📅', 'Across completed semesters')}${statCard('Current CGPA', cgpa(student), '⭐', `${sems.length} semester records available`)}${statCard('Signed-up activities', registeredEvents.length, '🎨', 'Your activity registrations')}${statCard('Pending updates', pending, '📝', 'Waiting for faculty approval')}</div>
      <div class="dashboard-grid"><section class="panel"><div class="panel-heading"><h3>Your academic journey</h3><button class="text-action" data-view="my-records">View records →</button></div><div class="academic-progress"><div class="progress-ring" style="--progress:${completion}%"><strong>${completion}%</strong></div><div class="progress-copy"><strong>${sems.length} of 8 semesters have a record</strong><p>Keep your marks and attendance accurate. Any correction needs supporting proof and faculty approval.</p><div class="mini-progress"><span style="width:${completion}%"></span></div></div></div><div class="quick-actions"><button class="btn btn-yellow btn-small" data-action="new-correction">＋ Request a correction</button><button class="btn btn-plain btn-small" data-view="activities">View activities</button></div></section>
      <section class="panel"><div class="panel-heading"><h3>Next signed-up activities</h3><button class="text-action" data-view="activities">View activities →</button></div><div class="activity-list">${upcomingRegisteredEvents.length ? upcomingRegisteredEvents.map(event => `<div class="activity-row"><span class="activity-dot">✓</span><div><strong>${escapeHTML(event.title)}</strong><small>${formatDate(event.date)} · Registration deadline ${formatDate(event.signupDeadline || event.date)}</small></div></div>`).join('') : `<div class="empty-state">You have no upcoming sign-ups. Explore the Activities tab to register.</div>`}</div></section></div>`;
  }

  function renderStudentRecords(student) {
    const p = student.profile; const a = student.academics;
    const detail = (label, value) => `<div class="detail-item"><small>${label}</small><strong>${escapeHTML(value || '—')}</strong></div>`;
    const schoolBlock = (label, data) => `<section class="detail-card academic-block"><h4>${label}<span>${escapeHTML(data.passingYear || '')}</span></h4><div class="detail-list">${detail('Board',data.board)}${detail('School',data.school)}${detail('Marks',`${data.marks ?? '—'} / ${data.maxMarks ?? 100}`)}${detail('Percentage',`${data.percentage ?? data.marks ?? '—'}%`)}${label === 'Class XII' ? detail('Stream',data.stream) : ''}</div></section>`;
    const semesters = a.semesters.map((sem, i) => `<tr><td><strong>${escapeHTML(sem.label || `Semester ${i+1}`)}</strong></td><td>${escapeHTML(sem.sgpa)}</td><td>${escapeHTML(sem.credits)}</td><td>${escapeHTML(sem.attendance)}%</td><td>${escapeHTML(sem.backlogs)}</td></tr>`).join('');
    return `<div class="student-summary"><div class="large-avatar">${initials(p.name)}</div><div><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.rollNo)} · ${escapeHTML(p.course)} · Year ${escapeHTML(p.currentYear)}</p></div><div class="summary-spacer"><strong>${cgpa(student)}</strong><small>Current CGPA</small></div></div>
      <h2 class="section-title">Student profile</h2><div class="profile-grid"><section class="detail-card"><h3>Personal details</h3><div class="detail-list">${detail('Email',p.email)}${detail('Mobile',p.phone)}${detail('Date of birth',p.dob)}${detail('Gender',p.gender)}${detail('Address',p.address)}${detail('Parent / guardian',p.guardian)}</div></section><section class="detail-card"><h3>College details</h3><div class="detail-list">${detail('Roll number',p.rollNo)}${detail('Course',p.course)}${detail('Department',p.department)}${detail('Current year',`Year ${p.currentYear}`)}${detail('Section',p.section)}${detail('Admission year',p.admissionYear)}${detail('Expected graduation',p.expectedGraduation)}${detail('Fee status',p.feeStatus)}</div></section></div>
      <h2 class="section-title" style="margin-top:22px">Academic history</h2><div class="profile-grid">${schoolBlock('Class X',a.class10)}${schoolBlock('Class XII',a.class12)}</div>
      <section class="panel" style="margin-top:14px"><div class="panel-heading"><h3>Undergraduate semester records</h3><span class="pill">Year 1 – Final year</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Semester</th><th>SGPA</th><th>Credits</th><th>Attendance</th><th>Backlogs</th></tr></thead><tbody>${semesters}</tbody></table></div><p style="margin:10px 0 0;color:#9aa5b5;font-size:9px">Semester rows are demo fields. Only completed semesters should be updated with verified results.</p></section>
      <div class="quick-actions">${activeUser.role === 'student' ? `<button class="btn btn-yellow btn-small" data-action="new-correction">Request a correction</button>` : `<button class="btn btn-yellow btn-small" data-action="view-corrections" data-id="${student.id}">View corrections</button><button class="btn btn-outline btn-small" data-action="edit-student" data-id="${student.id}">Edit student record</button>`}</div>`;
  }

  function renderRecordsView() {
    const student = activeUser.role === 'student' ? getCurrentStudent() : getStudent(focusedStudentId);
    if (!student) return `${pageHeading('Student academics','Select a student from the directory to view their record.')}<button class="btn btn-blue" data-view="students">Open student directory</button>`;
    return `${pageHeading(activeUser.role === 'student' ? 'My academic records' : `${escapeHTML(student.profile.name)} · academic record`, 'Academic history from school through every undergraduate semester.')} ${renderStudentRecords(student)}`;
  }

  function activityRow(activity) {
    const emoji = ({ Volunteering:'🤝', Workshop:'🧠', Competition:'🏆', Club:'🎨', Internship:'💼', Project:'🛠️', Sports:'⚽', Certificate:'📜' })[activity.type] || '✦';
    return `<div class="activity-row"><span class="activity-dot">${emoji}</span><div><strong>${escapeHTML(activity.title)}</strong><small>${escapeHTML(activity.type)} · ${formatDate(activity.date)}${activity.description ? ` · ${escapeHTML(activity.description)}` : ''}</small></div></div>`;
  }
  function eventCard(event, allowActions = false) {
    return `<article class="request-card"><div><h4>${escapeHTML(event.title)}</h4><p><strong>${escapeHTML(event.type || 'College activity')}</strong> · ${formatDate(event.date)}${event.time ? ` · ${escapeHTML(event.time)}` : ''}</p><p>📍 ${escapeHTML(event.venue || 'Venue to be announced')}</p><p>${escapeHTML(event.description || '')}</p>${event.marks !== '' && event.marks !== null && event.marks !== undefined ? `<div class="request-meta"><span class="pill">Marks / points: ${escapeHTML(event.marks)}</span></div>` : ''}</div>${allowActions ? `<div class="request-actions"><button class="tiny-btn" data-action="edit-event" data-id="${event.id}">Edit</button><button class="tiny-btn danger" data-action="delete-event" data-id="${event.id}">Delete</button></div>` : ''}</article>`;
  }

  function eventCard(event, allowActions = false, allowSignup = false) {
    const signups = Array.isArray(event.signups) ? event.signups : [];
    const studentId = activeUser?.studentId;
    const registered = studentId ? signups.some(entry => entry.studentId === studentId) : false;
    const today = localDateString();
    const deadline = event.signupDeadline || event.date;
    const registrationClosed = today > deadline || today > event.date;
    return `<article class="request-card"><div>
      <h4>${escapeHTML(event.title)}</h4>
      <p><strong>${escapeHTML(event.type || 'College activity')}</strong> · ${formatDate(event.date)} · ${escapeHTML(event.time || 'Time to be announced')}</p>
      <p>📍 ${escapeHTML(event.venue || 'Venue to be announced')}</p>
      <p>${escapeHTML(event.description || '')}</p>
      <div class="request-meta"><span class="pill">Registration closes: ${formatDate(deadline)}</span><span class="pill">${signups.length} signed up</span>${event.marks !== '' && event.marks !== null && event.marks !== undefined ? `<span class="pill">Marks / points: ${escapeHTML(event.marks)}</span>` : ''}</div>
    </div>
    ${allowActions ? `<div class="request-actions"><button class="tiny-btn" data-action="edit-event" data-id="${event.id}">Edit</button><button class="tiny-btn danger" data-action="delete-event" data-id="${event.id}">Delete</button></div>` : ''}
    ${allowSignup ? `<div class="request-actions">${registered ? '<span class="pill approved">Signed up ✓</span><button class="tiny-btn danger" data-action="cancel-signup" data-id="' + event.id + '">Cancel sign-up</button>' : registrationClosed ? '<span class="pill rejected">Registration closed</span>' : '<button class="btn btn-blue btn-small" data-action="signup-event" data-id="' + event.id + '">Sign up →</button>'}</div>` : ''}
    </article>`;
  }

  function renderActivities() {
    const events = (db.events || []).slice().sort((a,b) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`));
    const today = localDateString();
    const upcoming = events.filter(event => !event.date || event.date >= today);
    if (activeUser.role === 'admin' || activeUser.role === 'faculty') {
      const isAdmin = activeUser.role === 'admin';
      const headingAction = '<button class="btn btn-blue btn-small" data-action="add-event">＋ Create activity</button>';
      return `${pageHeading(isAdmin ? 'Activities & events' : 'College activities', isAdmin ? 'Publish and manage activities students can sign up for.' : 'Create activities for students and manage the ones you publish.', headingAction)}
        <section class="panel"><div class="panel-heading"><h3>Upcoming activities (${upcoming.length})</h3><span class="pill">${isAdmin ? 'Admin & faculty managed' : 'Faculty managed'}</span></div>${upcoming.length ? upcoming.map(event => eventCard(event, canManageEvent(event), false)).join('') : '<div class="empty-state"><b>No upcoming activities</b>Create an activity for students to sign up for.</div>'}</section>
        ${isAdmin ? `<section class="panel" style="margin-top:16px"><div class="panel-heading"><h3>Past activities (${events.length-upcoming.length})</h3></div>${events.filter(event => event.date && event.date < today).length ? events.filter(event => event.date && event.date < today).map(event => eventCard(event, canManageEvent(event), false)).join('') : '<div class="empty-state">No past activities.</div>'}</section>` : ''}`;
    }
    const student = getCurrentStudent();
    const registrations = events.filter(event => (event.signups || []).some(entry => entry.studentId === student?.id));
    const openActivities = upcoming.filter(event => !(event.signups || []).some(entry => entry.studentId === student?.id));
    return `${pageHeading('Activities', 'Discover university activities, sign up before the deadline and keep track of what is coming up.')}
      <section class="panel"><div class="panel-heading"><h3>My signed-up activities (${registrations.length})</h3><span class="pill">Your registrations</span></div>
        ${registrations.length ? registrations.map(event => `<div class="activity-row"><span class="activity-dot">✓</span><div><strong>${escapeHTML(event.title)}</strong><small>${formatDate(event.date)} · ${escapeHTML(event.time || 'Time to be announced')} · Registration deadline ${formatDate(event.signupDeadline || event.date)}</small></div><span class="pill">${event.date < today ? 'Completed' : 'Upcoming'}</span></div>`).join('') : '<div class="empty-state"><b>You have not signed up for an activity yet.</b>Choose an activity below to register.</div>'}
      </section>
      <section class="panel" style="margin-top:16px"><div class="panel-heading"><h3>Activities open for sign-up (${openActivities.filter(event => today <= (event.signupDeadline || event.date)).length})</h3><span class="pill">Published by staff</span></div>
        ${openActivities.length ? openActivities.map(event => eventCard(event, false, true)).join('') : '<div class="empty-state">No other upcoming activities are available right now.</div>'}
      </section>
      <div class="notice" style="margin-top:16px"><strong>Keep an eye on the dates:</strong> Each activity shows its event date and the last date to sign up. Once the registration deadline passes, sign-up closes.</div>`;
  }

  function renderFaculty() {
    if (activeUser?.role !== 'admin') return '';
    const facultyMembers = db.users.filter(user => user.role === 'faculty');
    const rows = facultyMembers.map(user => `<tr><td><strong>${escapeHTML(user.name)}</strong></td><td>${escapeHTML(user.phone || '—')}</td><td>${escapeHTML(user.email)}</td><td>${escapeHTML(user.department || '—')}</td><td>${escapeHTML(user.course || '—')}</td><td><div class="table-actions"><button class="tiny-btn" data-action="edit-faculty" data-id="${encodeURIComponent(user.email)}">Edit</button><button class="tiny-btn danger" data-action="delete-faculty" data-id="${encodeURIComponent(user.email)}">Delete</button></div></td></tr>`).join('');
    return `${pageHeading('Faculty accounts', 'Only administrators can create, update or remove faculty logins.', `<button class="btn btn-blue btn-small" data-action="add-faculty">＋ Add faculty</button>`)}
      <section class="panel" style="padding:0"><div class="panel-heading" style="padding:17px 17px 0"><h3>Faculty accounts</h3><span class="pill">${facultyMembers.length} accounts</span></div><div class="table-wrap" style="border:0;border-radius:0 0 13px 13px"><table class="data-table"><thead><tr><th>Name</th><th>Mobile</th><th>Email / Login</th><th>Department</th><th>Course</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div></section>
      <div class="notice" style="margin-top:15px"><strong>Administrator permission:</strong> Faculty account management is reserved for the Admin role.</div>`;
  }

  function renderFacultyProfile() {
    if (activeUser?.role !== 'faculty') return '';
    const account = db.users.find(user => user.role === 'faculty' && user.email === activeUser.email) || activeUser;
    return `${pageHeading('My faculty account', 'Your own account details. Other faculty accounts are not visible from this login.')}
      <section class="panel"><div class="panel-heading"><h3>Account information</h3><span class="pill">Faculty</span></div>
        <div class="detail-grid">
          <div><small>Full name</small><strong>${escapeHTML(account.name)}</strong></div>
          <div><small>Mobile number</small><strong>${escapeHTML(account.phone || 'Not added')}</strong></div>
          <div><small>Email / login</small><strong>${escapeHTML(account.email)}</strong></div>
          <div><small>Department</small><strong>${escapeHTML(account.department || 'Not assigned')}</strong></div>
          <div><small>Course</small><strong>${escapeHTML(account.course || 'Not assigned')}</strong></div>
        </div>
      </section>`;
  }

  function openFacultyModal(email = '') {
    if (activeUser?.role !== 'admin') return toast('Only an administrator can manage faculty accounts.', 'error');
    if (email) email = decodeURIComponent(email);
    const existing = email ? db.users.find(user => user.role === 'faculty' && user.email === email) : null;
    if (email && !existing) return;
    const body = `<form id="modalForm"><div class="form-grid">
      <div class="field"><label>Faculty name *</label><input name="name" value="${escapeHTML(existing?.name || '')}" required /></div>
      <div class="field"><label>Mobile number *</label><input name="phone" type="tel" inputmode="tel" value="${escapeHTML(existing?.phone || '')}" required /></div>
      <div class="field"><label>Email / login *</label><input name="email" type="email" value="${escapeHTML(existing?.email || '')}" required /></div>
      <div class="field"><label>${existing ? 'New password (leave blank to keep current)' : 'Initial password *'}</label><input name="password" type="password" ${existing ? '' : 'required minlength="6"'} minlength="6" /></div>
      <div class="field"><label>Department headed *</label><select name="department" required><option value="">Select department</option>${optionOptions(DEPARTMENT_OPTIONS, existing?.department || '')}</select></div>
      <div class="field"><label>Course / programme *</label><select name="course" required><option value="">Select course</option>${optionOptions(COURSE_OPTIONS, existing?.course || '')}</select></div>
      </div><div class="modal-actions"><button type="button" class="btn btn-plain btn-small" data-action="close-modal">Cancel</button><button class="btn btn-blue btn-small" type="submit">${existing ? 'Save faculty details' : 'Create faculty account'}</button></div></form>`;
    openModal(existing ? 'Edit faculty account' : 'Create faculty account', 'Enter only the faculty details needed for their login.', body, formData => {
      const name = String(formData.get('name')).trim();
      const phone = String(formData.get('phone')).trim();
      const nextEmail = String(formData.get('email')).trim().toLowerCase();
      const password = String(formData.get('password') || '');
      const department = String(formData.get('department') || '');
      const course = String(formData.get('course') || '');
      if (!/^\+?[0-9 ()-]{8,18}$/.test(phone)) return toast('Enter a valid faculty mobile number.', 'error');
      const duplicate = db.users.some(user => user.email.toLowerCase() === nextEmail && user !== existing);
      if (duplicate) return toast('That email is already assigned to an account.', 'error');
      if (!existing && password.length < 6) return toast('Password must be at least 6 characters.', 'error');
      if (existing) {
        const oldEmail = existing.email;
        Object.assign(existing, { name, phone, email: nextEmail, department, course });
        if (password) existing.password = password;
        if (activeUser.email === oldEmail) {
          activeUser = { ...existing };
          $('#topUserName').textContent = existing.name;
          $('#userAvatar').textContent = initials(existing.name);
        }
        logAction('FACULTY ACCOUNT EDITED', `Administrator updated faculty account: ${oldEmail} → ${nextEmail}.`);
      } else {
        db.users.push({ email: nextEmail, password, role: 'faculty', name, phone, department, course });
        logAction('FACULTY ACCOUNT CREATED', `Administrator created faculty login for ${name} (${nextEmail}).`);
      }
      if (saveDatabase()) { closeModal(); renderView(); toast(existing ? 'Faculty account updated.' : 'Faculty account created.'); }
    });
  }

  function deleteFaculty(encodedEmail) {
    if (activeUser?.role !== 'admin') return toast('Only an administrator can remove faculty accounts.', 'error');
    const email = decodeURIComponent(encodedEmail);
    const facultyMembers = db.users.filter(user => user.role === 'faculty');
    if (facultyMembers.length <= 1) return toast('At least one faculty account must remain.', 'error');
    const target = db.users.find(user => user.role === 'faculty' && user.email === email);
    if (!target) return;
    if (!window.confirm(`Delete the faculty account for ${target.name} (${target.email})?`)) return;
    db.users = db.users.filter(user => user !== target);
    logAction('FACULTY ACCOUNT DELETED', `Administrator deleted faculty login for ${target.name} (${target.email}).`);
    if (saveDatabase()) { renderView(); toast('Faculty account deleted.'); }
  }

  function canManageEvent(event) {
    if (!event || !activeUser) return false;
    return activeUser.role === 'admin' || (activeUser.role === 'faculty' && (event.createdByEmail === activeUser.email || (!event.createdByEmail && event.createdBy === activeUser.name)));
  }

  function openEventModal(id = '') {
    if (!['admin','faculty'].includes(activeUser?.role)) return toast('Only faculty or an administrator can publish activities.', 'error');
    const existing = id ? db.events.find(event => event.id === id) : null;
    if (id && !existing) return;
    if (existing && !canManageEvent(existing)) return toast('You can only edit activities you created.', 'error');
    const body = `<form id="modalForm"><div class="form-grid">
      <div class="field"><label>Activity title *</label><input name="title" value="${escapeHTML(existing?.title || '')}" required /></div>
      <div class="field"><label>Activity type *</label><select name="type">${['Workshop','Seminar','Competition','Cultural','Sports','Guest Lecture','Club','Other'].map(type => `<option ${existing?.type === type ? 'selected' : ''}>${type}</option>`).join('')}</select></div>
      <div class="field"><label>Activity date *</label><input name="date" type="date" value="${escapeHTML(existing?.date || '')}" required /></div>
      <div class="field"><label>Activity time *</label><input name="time" type="time" value="${escapeHTML(existing?.time || '')}" required /></div>
      <div class="field"><label>Registration deadline *</label><input name="signupDeadline" type="date" value="${escapeHTML(existing?.signupDeadline || existing?.date || '')}" required /></div>
      <div class="field"><label>Venue *</label><input name="venue" value="${escapeHTML(existing?.venue || '')}" required placeholder="Auditorium / Lab / Sports ground" /></div>
      <div class="field full"><label>Short description *</label><textarea name="description" rows="3" required>${escapeHTML(existing?.description || '')}</textarea></div>
      <div class="field"><label>Marks / points (optional)</label><input name="marks" type="number" min="0" max="1000" step="0.5" value="${escapeHTML(existing?.marks ?? '')}" /></div>
      </div><div class="modal-actions"><button type="button" class="btn btn-plain btn-small" data-action="close-modal">Cancel</button><button class="btn btn-blue btn-small" type="submit">${existing ? 'Save activity' : 'Publish activity'}</button></div></form>`;
    openModal(existing ? 'Edit activity' : 'Create activity', 'Publish a short event listing with a student registration deadline.', body, formData => {
      const values = {
        title: String(formData.get('title')).trim(), type: formData.get('type'),
        date: formData.get('date'), time: formData.get('time'),
        signupDeadline: formData.get('signupDeadline'),
        venue: String(formData.get('venue')).trim(),
        description: String(formData.get('description')).trim(),
        marks: formData.get('marks') === '' ? '' : Number(formData.get('marks'))
      };
      if (values.signupDeadline > values.date) return toast('The registration deadline cannot be after the activity date.', 'error');
      if (existing) {
        Object.assign(existing, values);
        logAction('COLLEGE ACTIVITY EDITED', `${activeUser.role === 'admin' ? 'Admin' : 'Faculty'} updated activity ${existing.title}; registration deadline ${existing.signupDeadline}.`);
      } else {
        const event = { id: `EVT-${Date.now()}`, ...values, signups: [], createdAt: new Date().toISOString(), createdBy: activeUser.name, createdByEmail: activeUser.email };
        db.events.unshift(event);
        logAction('COLLEGE ACTIVITY CREATED', `${activeUser.role === 'admin' ? 'Admin' : 'Faculty'} published ${event.title} for ${event.date}; registration closes ${event.signupDeadline}.`);
      }
      if (saveDatabase()) { closeModal(); renderView(); toast(existing ? 'Activity updated.' : 'Activity published.'); }
    });
  }

  function deleteEvent(id) {
    if (!['admin','faculty'].includes(activeUser?.role)) return toast('Only staff can remove activities.', 'error');
    const event = db.events.find(item => item.id === id);
    if (!event) return;
    if (!canManageEvent(event)) return toast('You can only delete activities you created.', 'error');
    if (!window.confirm(`Delete the college activity “${event.title}”?`)) return;
    db.events = db.events.filter(item => item.id !== id);
    logAction('COLLEGE ACTIVITY DELETED', `Deleted activity ${event.title} scheduled for ${event.date}.`);
    if (saveDatabase()) { renderView(); toast('College activity deleted.'); }
  }

  function signUpForEvent(id, cancel = false) {
    if (activeUser?.role !== 'student') return toast('Only students can sign up for activities.', 'error');
    const event = db.events.find(item => item.id === id);
    if (!event) return toast('This activity is no longer available.', 'error');
    event.signups = Array.isArray(event.signups) ? event.signups : [];
    const studentId = activeUser.studentId;
    const registered = event.signups.some(entry => entry.studentId === studentId);
    if (cancel) {
      if (!registered) return;
      event.signups = event.signups.filter(entry => entry.studentId !== studentId);
      logAction('ACTIVITY SIGN-UP CANCELLED', `Cancelled registration for ${event.title}.`, studentId, { eventId: event.id });
    } else {
      const today = localDateString();
      const deadline = event.signupDeadline || event.date;
      if (today > deadline || today > event.date) return toast('Registration for this activity has closed.', 'error');
      if (registered) return toast('You are already signed up for this activity.', 'error');
      event.signups.push({ studentId, signedUpAt: new Date().toISOString() });
      logAction('ACTIVITY SIGN-UP', `Signed up for ${event.title}; event date ${event.date}.`, studentId, { eventId: event.id });
    }
    if (saveDatabase()) { renderNav(); renderView(); toast(cancel ? 'Your sign-up was cancelled.' : 'You are signed up for the activity.'); }
  }

  function statusPill(status) { return `<span class="pill ${String(status).toLowerCase()}">${escapeHTML(status)}</span>`; }
  function requestCard(request, includeActions = false) {
    const student = getStudent(request.studentId);
    const evidence = request.evidence?.data ? `<a class="evidence-link" href="${request.evidence.data}" download="${encodeURIComponent(request.evidence.name || 'supporting-document')}">↗ ${escapeHTML(request.evidence.name || 'View evidence')}</a>` : '<span class="evidence-link">No attachment</span>';
    return `<article class="request-card"><div><h4>${escapeHTML(request.section)} · ${escapeHTML(request.field)}</h4><p>${activeUser.role === 'faculty' ? `<strong>${escapeHTML(student?.profile.name || 'Student')}</strong> · ` : ''}${escapeHTML(request.reason || 'No additional note')}</p><p><strong>Proposed update:</strong> ${escapeHTML(request.newValue)}</p><div class="request-meta">${statusPill(request.status)}<span class="pill">${formatDateTime(request.createdAt)}</span>${evidence}</div>${request.reviewNote ? `<p><strong>Faculty note:</strong> ${escapeHTML(request.reviewNote)}</p>` : ''}${request.reviewedBy ? `<p>Reviewed by ${escapeHTML(request.reviewedBy)} · ${formatDateTime(request.reviewedAt)}</p>` : ''}</div>${includeActions && request.status === 'Pending' ? `<div class="request-actions"><button class="tiny-btn" data-action="approve-request" data-id="${request.id}">✓ Approve</button><button class="tiny-btn danger" data-action="reject-request" data-id="${request.id}">✕ Reject</button></div>` : ''}</article>`;
  }
  function renderCorrections() {
    const requests = db.requests.filter(r => r.studentId === activeUser.studentId).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    return `${pageHeading('Correction requests', 'Ask for an update and attach proof. Your official record changes only after faculty approval.', `<button class="btn btn-yellow btn-small" data-action="new-correction">＋ New request</button>`)}
      <div class="notice"><strong>How it works:</strong> Submit the correct details and a supporting document. Faculty reviews the request, then approves or rejects it. Approved changes are added to your academic record and audit trail.</div>
      ${requests.length ? requests.map(r => requestCard(r)).join('') : `<section class="panel"><div class="empty-state"><b>No requests yet 🌻</b>When you spot an error in your record, submit a correction request here.</div></section>`}`;
  }
  function renderApprovals() {
    const allRequests = db.requests.slice();
    const requests = allRequests.filter(r => !correctionFilterStudentId || r.studentId === correctionFilterStudentId).sort((a,b) => (a.status === 'Pending' ? -1 : 1) - (b.status === 'Pending' ? -1 : 1) || b.createdAt.localeCompare(a.createdAt));
    const pending = requests.filter(r => r.status === 'Pending');
    return `${pageHeading('Approval inbox', correctionFilterStudentId ? `Review corrections for ${escapeHTML(getStudent(correctionFilterStudentId)?.profile.name || 'selected student')}.` : 'Review student-submitted corrections and evidence before changing official records.', correctionFilterStudentId ? `<button class="btn btn-plain btn-small" data-action="clear-correction-filter">Show all corrections</button>` : '')}
      <div class="stats-grid" style="grid-template-columns:repeat(3,minmax(0,1fr))">${statCard('Awaiting review',pending.length,'📝','Needs faculty action')}${statCard('Approved',requests.filter(r=>r.status==='Approved').length,'✅','Changes applied')}${statCard('Rejected',requests.filter(r=>r.status==='Rejected').length,'↩','Returned to students')}</div>
      ${pending.length ? `<h2 class="section-title">Pending requests</h2>${pending.map(r => requestCard(r,true)).join('')}` : `<section class="panel"><div class="empty-state"><b>Inbox clear! 🎉</b>There are no requests waiting for approval.</div></section>`}
      ${requests.some(r => r.status !== 'Pending') ? `<h2 class="section-title" style="margin-top:22px">Recently reviewed</h2>${requests.filter(r => r.status !== 'Pending').slice(0,8).map(r => requestCard(r,false)).join('')}` : ''}`;
  }

  function renderStudents() {
    const rows = db.students.map(s => `<tr><td><strong>${escapeHTML(s.profile.name)}</strong><br><span style="color:#9aa5b5;font-size:9px">${escapeHTML(s.profile.email)}</span></td><td>${escapeHTML(s.id)}<br><span style="color:#9aa5b5;font-size:9px">${escapeHTML(s.profile.rollNo)}</span></td><td>${escapeHTML(s.profile.course)}</td><td>${escapeHTML(s.profile.department)}</td><td>Year ${escapeHTML(s.profile.currentYear)}</td><td>${averageAttendance(s)}%</td><td><strong>${cgpa(s)}</strong></td><td><div class="table-actions"><button class="tiny-btn" data-action="view-student" data-id="${s.id}">View</button><button class="tiny-btn" data-action="edit-student" data-id="${s.id}">Edit</button><button class="tiny-btn danger" data-action="delete-student" data-id="${s.id}">Delete</button></div></td></tr>`).join('');
    const addButton = activeUser.role === 'admin' ? '<button class="btn btn-blue btn-small" data-action="add-student">＋ Add student</button>' : '';
    return `${pageHeading('Student directory', 'Find, review, update or remove student academic information.', addButton)}
      <div class="toolbar"><input class="search-box" id="studentSearch" placeholder="Search by name, ID, course or email…" /><select class="filter-select" id="departmentFilter"><option value="">All departments</option>${[...new Set(db.students.map(s=>s.profile.department))].sort().map(d=>`<option>${escapeHTML(d)}</option>`).join('')}</select></div>
      <section class="panel" style="padding:0"><div class="panel-heading" style="padding:17px 17px 0"><h3>All students</h3><span class="pill">${db.students.length} records</span></div><div class="table-wrap" style="border:0;border-radius:0 0 13px 13px"><table class="data-table" id="studentsTable"><thead><tr><th>Student</th><th>Student ID</th><th>Course</th><th>Department</th><th>Year</th><th>Attendance</th><th>CGPA</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function deleteStudent(id) {
    if (!['admin','faculty'].includes(activeUser?.role)) return toast('Only faculty or an administrator can delete students.', 'error');
    const student = getStudent(id);
    if (!student) return toast('Student record was not found.', 'error');
    if (!window.confirm(`Delete ${student.profile.name}'s student account and record? This also removes their correction requests and activity sign-ups.`)) return;
    const name = student.profile.name;
    db.students = db.students.filter(item => item.id !== id);
    db.users = db.users.filter(user => !(user.role === 'student' && user.studentId === id));
    db.requests = db.requests.filter(request => request.studentId !== id);
    db.events.forEach(event => { event.signups = (event.signups || []).filter(entry => entry.studentId !== id); });
    if (focusedStudentId === id) { focusedStudentId = null; if (currentView === 'my-records') currentView = 'students'; }
    logAction('STUDENT DELETED', `Deleted student account and profile for ${name}; linked correction requests and activity sign-ups were removed.`, id);
    if (saveDatabase()) { renderNav(); renderView(); toast(`Student ${name} was deleted.`); }
  }

  function logRow(log) {
    const icon = log.action.includes('APPROV') ? '✅' : log.action.includes('REJECT') ? '↩' : log.action.includes('LOGIN') ? '🔐' : log.action.includes('STUDENT') ? '🎒' : '✏️';
    return `<div class="log-row"><span class="log-icon">${icon}</span><div><strong>${escapeHTML(log.actor)} <span style="color:#9ba7b7;font-weight:600">· ${escapeHTML(log.action)}</span></strong><p>${escapeHTML(log.details)}${log.studentId ? ` · ${escapeHTML(log.studentId)}` : ''}</p></div><time>${formatDateTime(log.timestamp)}</time></div>`;
  }
  function renderAudit() {
    if (activeUser?.role !== 'admin') return '';
    const logs = db.logs;
    return `${pageHeading('Audit trail', 'A transparent timeline of record access, edits, requests and faculty decisions.')}
      <div class="notice"><strong>Accountability matters:</strong> Each meaningful change records who performed it, when it happened and which student record was affected.</div>
      <section class="panel"><div class="panel-heading"><h3>${logs.length} activity log entries</h3><span class="pill">Newest first</span></div><div class="log-list">${logs.length ? logs.map(logRow).join('') : `<div class="empty-state">No log entries yet.</div>`}</div></section>`;
  }

  function renderView() {
    const root = $('#viewRoot');
    if (!root || !activeUser) return;
    const views = {
      dashboard: renderDashboard,
      'my-records': renderRecordsView,
      activities: renderActivities,
      corrections: renderCorrections,
      approvals: renderApprovals,
      students: renderStudents,
      faculty: renderFaculty,
      'my-profile': renderFacultyProfile,
      audit: renderAudit
    };
    const allowed = activeUser.role === 'admin'
      ? ['dashboard','students','faculty','my-records','approvals','activities','audit']
      : activeUser.role === 'faculty'
        ? ['dashboard','students','my-records','approvals','activities','my-profile']
        : ['dashboard','my-records','activities','corrections'];
    if (!allowed.includes(currentView)) currentView = 'dashboard';
    root.innerHTML = (views[currentView] || renderDashboard)();
    root.focus({ preventScroll: true });
  }

  function login(email, password) {
    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!user) {
      $('#loginMessage').textContent = 'Those email and password details do not match an account. Please check and try again.';
      return;
    }
    activeUser = { ...user };
    currentView = 'dashboard';
    focusedStudentId = user.studentId || null;
    $('#authScreen').classList.add('hidden');
    $('#appScreen').classList.remove('hidden');
    $('#topUserName').textContent = user.name;
    $('#topUserRole').textContent = user.role === 'admin' ? 'Admin' : user.role === 'faculty' ? 'Faculty' : 'Student';
    $('#userAvatar').textContent = initials(user.name);
    $('#exportButton').classList.toggle('hidden', !['admin','faculty'].includes(user.role));
    logAction('LOGIN', `${user.role === 'admin' ? 'Admin' : user.role === 'faculty' ? 'Faculty' : 'Student'} signed in.`, user.studentId || '');
    saveDatabase();
    renderNav(); renderView();
  }

  function logout() {
    if (activeUser && ['faculty','admin'].includes(activeUser.role)) {
      const approved = window.confirm('Are you sure you want to log out of Ace Records?');
      if (!approved) return;
    }
    if (activeUser) {
      logAction('LOGOUT', `${activeUser.role} signed out.`, activeUser.studentId || '');
      saveDatabase();
    }
    activeUser = null;
    $('#appScreen').classList.add('hidden');
    $('#authScreen').classList.remove('hidden');
    $('#exportButton').classList.add('hidden');
    $('#loginPassword').value = '';
    $('#loginMessage').textContent = '';
  }

  function openModal(title, subtitle, body, onSubmit) {
    const root = $('#modalRoot');
    root.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><div class="modal-head"><div><h3 id="modalTitle">${title}</h3><p>${subtitle}</p></div><button type="button" class="modal-close" data-action="close-modal" aria-label="Close">×</button></div><div class="modal-body">${body}</div></div>`;
    root.onclick = event => { if (event.target === root) closeModal(); };
    const form = $('#modalForm', root);
    if (form) form.addEventListener('submit', event => { event.preventDefault(); onSubmit(new FormData(form), form); });
    $('.modal-close', root)?.focus();
  }
  function closeModal() { $('#modalRoot').innerHTML = ''; }

  function openCorrectionModal() {
    const student = getCurrentStudent();
    if (!student) return;
    const sectionOptions = ['Profile','Class X','Class XII', ...Array.from({length:8},(_,i)=>`Semester ${i+1}`)];
    const defaultSection = 'Profile';
    const body = `<form id="modalForm"><div class="form-grid">
      <div class="field"><label for="requestSection">Record section *</label><select id="requestSection" name="section" required>${sectionOptions.map(s=>`<option ${s===defaultSection?'selected':''}>${s}</option>`).join('')}</select></div>
      <div class="field"><label for="requestField">Field to update *</label><select id="requestField" name="field" required></select></div>
      <div class="field full"><label for="requestValue">Correct value / activity details *</label><textarea id="requestValue" name="newValue" required placeholder="Enter the correct value or describe your activity…"></textarea></div>
      <div class="field full"><label for="requestReason">Reason for the change *</label><textarea id="requestReason" name="reason" required placeholder="Briefly explain why this record needs an update."></textarea></div>
      <div class="field full"><label for="requestEvidence">Supporting document *</label><input id="requestEvidence" name="evidence" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx" required /><small>Upload a marksheet, certificate or other relevant proof. Maximum file size: 700 KB.</small></div>
      <div class="field full"><div class="file-note">🔐 The request stays pending until a faculty member reviews the attached document. Your existing record will not change before approval.</div></div>
      </div><div class="modal-actions"><button type="button" class="btn btn-plain btn-small" data-action="close-modal">Cancel</button><button class="btn btn-blue btn-small" type="submit">Submit for approval →</button></div></form>`;
    openModal('Request a record correction', 'Attach proof so faculty can verify your update.', body, async (formData, form) => {
      const file = form.querySelector('[name="evidence"]').files[0];
      if (!file) return toast('Please attach a supporting document.', 'error');
      if (file.size > MAX_EVIDENCE_BYTES) return toast('Please choose a file smaller than 700 KB.', 'error');
      const section = formData.get('section');
      const field = formData.get('field');
      const newValue = String(formData.get('newValue') || '').trim();
      const reason = String(formData.get('reason') || '').trim();
      if (!newValue || !reason) return toast('Complete all required fields.', 'error');
      try {
        const data = await readFileAsDataURL(file);
        const request = { id: `REQ-${Date.now()}`, studentId: student.id, section, field, newValue, reason, evidence: { name: file.name, type: file.type || 'application/octet-stream', data }, status: 'Pending', createdAt: new Date().toISOString(), reviewedAt: null, reviewedBy: null, reviewNote: '' };
        db.requests.unshift(request);
        logAction('CORRECTION REQUEST SUBMITTED', `${section} · ${field}; supporting document: ${file.name}.`, student.id, { requestId: request.id });
        if (saveDatabase()) { closeModal(); renderNav(); renderView(); toast('Request submitted. It is now waiting for faculty approval.'); }
      } catch (error) { toast(error.message || 'Could not read that file.', 'error'); }
    });
    const sectionSelect = $('#requestSection');
    const fieldSelect = $('#requestField');
    const updateFields = () => {
      const value = sectionSelect.value;
      const options = value === 'Profile' ? ['phone','email','address','guardian','department','course','currentYear']
        : value === 'Class X' || value === 'Class XII' ? ['marks','board','school','passingYear', ...(value === 'Class XII' ? ['stream'] : [])]
        : ['sgpa','attendance','credits','backlogs'];
      fieldSelect.innerHTML = options.map(v=>`<option value="${escapeHTML(v)}">${escapeHTML(v === 'currentYear' ? 'Current year' : v.charAt(0).toUpperCase()+v.slice(1))}</option>`).join('');
      $('#requestValue').placeholder = 'Enter the correct value…';
    };
    sectionSelect.addEventListener('change', updateFields);
    updateFields();
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('The selected file could not be read.'));
      reader.readAsDataURL(file);
    });
  }

  function applyApprovedRequest(request) {
    const student = getStudent(request.studentId);
    if (!student) throw new Error('The student record no longer exists.');
    const oldValue = request.section === 'Activity' ? '—' : getRequestCurrentValue(student, request.section, request.field);
    if (request.section === 'Activity') {
      throw new Error('Student activities are no longer submitted as corrections. Use the Activities page to sign up for published events.');
    } else if (request.section === 'Profile') {
      const allowed = ['phone','email','address','guardian','department','course','currentYear'];
      if (!allowed.includes(request.field)) throw new Error('This profile field is not editable through a student request.');
      student.profile[request.field] = request.field === 'currentYear' ? Math.max(1, Math.min(4, Number(request.newValue))) : request.newValue;
    } else if (request.section === 'Class X' || request.section === 'Class XII') {
      const key = request.section === 'Class X' ? 'class10' : 'class12';
      const allowed = request.section === 'Class X' ? ['marks','board','school','passingYear'] : ['marks','board','school','passingYear','stream'];
      if (!allowed.includes(request.field)) throw new Error('This school field is not editable through a student request.');
      student.academics[key][request.field] = ['marks','passingYear'].includes(request.field) ? Number(request.newValue) : request.newValue;
      if (request.field === 'marks') student.academics[key].percentage = Number(request.newValue) / Number(student.academics[key].maxMarks || 100) * 100;
    } else if (request.section.startsWith('Semester ')) {
      const semNumber = Number(request.section.replace('Semester ',''));
      const allowed = ['sgpa','attendance','credits','backlogs'];
      if (!allowed.includes(request.field) || semNumber < 1 || semNumber > 8) throw new Error('This semester field is not valid.');
      student.academics.semesters[semNumber - 1][request.field] = Number(request.newValue);
    } else {
      throw new Error('Unsupported record section.');
    }
    request.status = 'Approved';
    request.reviewedAt = new Date().toISOString();
    request.reviewedBy = activeUser.name;
    logAction('CORRECTION APPROVED', `${request.section} · ${request.field}: “${oldValue ?? '—'}” → “${request.newValue}”. Evidence reviewed: ${request.evidence?.name || 'file attached'}.`, student.id, { requestId: request.id, teacherApproval: activeUser.name });
  }
  function getRequestCurrentValue(student, section, field) {
    if (section === 'Profile') return student.profile[field];
    if (section === 'Class X') return student.academics.class10[field];
    if (section === 'Class XII') return student.academics.class12[field];
    if (section.startsWith('Semester ')) return student.academics.semesters[Number(section.replace('Semester ',''))-1]?.[field];
    return '—';
  }

  function reviewRequest(id, approve) {
    if (!['admin','faculty'].includes(activeUser?.role)) return toast('Only staff can review correction requests.', 'error');
    const request = db.requests.find(r => r.id === id);
    if (!request || request.status !== 'Pending') return toast('This request has already been reviewed.', 'error');
    if (approve && !request.evidence?.data) return toast('This request has no supporting evidence attached.', 'error');
    if (approve) {
      try { applyApprovedRequest(request); }
      catch (error) { return toast(error.message, 'error'); }
    } else {
      const note = window.prompt('Optional note for the student (why is this request being rejected?):', 'Please provide clearer or more relevant supporting proof.');
      request.reviewNote = note === null ? '' : note.trim();
      request.status = 'Rejected';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = activeUser.name;
      logAction('CORRECTION REJECTED', `${request.section} · ${request.field}. Faculty note: ${request.reviewNote || 'No note added.'}`, request.studentId, { requestId: request.id, teacherApproval: activeUser.name });
    }
    if (saveDatabase()) { renderNav(); renderView(); toast(approve ? 'Approved! The student record has been updated.' : 'Request rejected. The student can review the faculty note.'); }
  }

  function semesterFormRows(student = null) {
    return Array.from({ length: 8 }, (_, index) => {
      const sem = student?.academics?.semesters?.[index] || {};
      return `<div class="field full"><div class="file-note"><strong>Semester ${index + 1}</strong> — enter marks and attendance where available.</div></div>
        <div class="field"><label>Semester ${index + 1} SGPA</label><input name="sgpa${index + 1}" type="number" min="0" max="10" step="0.01" value="${escapeHTML(sem.sgpa ?? '')}" /></div>
        <div class="field"><label>Semester ${index + 1} attendance (%)</label><input name="attendance${index + 1}" type="number" min="0" max="100" step="0.1" value="${escapeHTML(sem.attendance ?? '')}" /></div>
        <div class="field"><label>Semester ${index + 1} credits</label><input name="credits${index + 1}" type="number" min="0" max="60" step="1" value="${escapeHTML(sem.credits ?? '')}" /></div>
        <div class="field"><label>Semester ${index + 1} backlogs</label><input name="backlogs${index + 1}" type="number" min="0" max="30" step="1" value="${escapeHTML(sem.backlogs ?? 0)}" /></div>`;
    }).join('');
  }

  function openAddStudentModal() {
    if (activeUser?.role !== 'admin') return toast('Only an administrator can create student accounts.', 'error');
    const body = `<form id="modalForm"><div class="form-grid">
      <div class="field"><label>Full name *</label><input name="name" required /></div>
      <div class="field"><label>Student email / username *</label><input name="email" type="email" required /></div>
      <div class="field"><label>Initial password *</label><input name="password" type="password" minlength="6" required /></div>
      <div class="field"><label>Mobile number *</label><input name="phone" inputmode="tel" required /></div>
      <div class="field"><label>Date of birth</label><input name="dob" type="date" /></div>
      <div class="field"><label>Gender</label><select name="gender"><option value="">Select</option><option>Female</option><option>Male</option><option>Other</option></select></div>
      <div class="field"><label>Course / programme *</label><select name="course" required><option value="">Select course</option>${optionOptions(COURSE_OPTIONS)}</select></div>
      <div class="field"><label>Department / school *</label><select name="department" required><option value="">Select department</option>${optionOptions(DEPARTMENT_OPTIONS)}</select></div>
      <div class="field"><label>Current year *</label><select name="year">${[1,2,3,4].map(n=>`<option value="${n}">${n}</option>`).join('')}</select></div>
      <div class="field"><label>Roll number *</label><input name="rollNo" required /></div>
      <div class="field"><label>Section</label><select name="section"><option>A</option><option>B</option><option>C</option><option>D</option></select></div>
      <div class="field"><label>Guardian name</label><input name="guardian" /></div>
      <div class="field full"><label>Address</label><input name="address" /></div>
      <div class="field"><label>Admission year</label><input name="admissionYear" type="number" min="2000" max="2100" /></div>
      <div class="field"><label>Expected graduation</label><input name="expectedGraduation" type="number" min="2000" max="2100" /></div>
      <div class="field"><label>Fee status</label><select name="feeStatus"><option>Paid</option><option>Partly paid</option><option>Pending</option><option>Scholarship</option></select></div>
      <div class="field"><label>CGPA (optional)</label><input name="cgpaOverride" type="number" min="0" max="10" step="0.01" placeholder="Auto-calculated if blank" /></div>
      <div class="field full"><h3 class="section-title" style="margin:8px 0 0">Class X record</h3></div>
      <div class="field"><label>Board</label><input name="class10Board" value="CBSE" /></div>
      <div class="field"><label>School</label><input name="class10School" /></div>
      <div class="field"><label>Passing year</label><input name="class10Year" type="number" min="1990" max="2100" /></div>
      <div class="field"><label>Marks obtained</label><input name="class10Marks" type="number" min="0" step="0.01" /></div>
      <div class="field"><label>Maximum marks</label><input name="class10Max" type="number" min="1" step="0.01" value="100" /></div>
      <div class="field full"><h3 class="section-title" style="margin:8px 0 0">Class XII record</h3></div>
      <div class="field"><label>Board</label><input name="class12Board" value="CBSE" /></div>
      <div class="field"><label>School</label><input name="class12School" /></div>
      <div class="field"><label>Passing year</label><input name="class12Year" type="number" min="1990" max="2100" /></div>
      <div class="field"><label>Stream</label><select name="class12Stream"><option>Science</option><option>Commerce</option><option>Arts</option><option>Other</option></select></div>
      <div class="field"><label>Marks obtained</label><input name="class12Marks" type="number" min="0" step="0.01" /></div>
      <div class="field"><label>Maximum marks</label><input name="class12Max" type="number" min="1" step="0.01" value="100" /></div>
      <div class="field full"><h3 class="section-title" style="margin:8px 0 0">Semester-wise academics and attendance</h3><small>Enter all available semester SGPA, attendance, credits and backlog details. Leave future semesters blank.</small></div>
      ${semesterFormRows()}
      <div class="field full"><div class="file-note">The student account will be created with the password you set here. CGPA is calculated from the available semesters unless you enter a verified CGPA override.</div></div>
      </div><div class="modal-actions"><button type="button" class="btn btn-plain btn-small" data-action="close-modal">Cancel</button><button class="btn btn-blue btn-small" type="submit">Create student account</button></div></form>`;
    openModal('Create a student account', 'Enter the student profile and academic history, then set their login password.', body, (formData) => {
      const name = String(formData.get('name')).trim();
      const email = String(formData.get('email')).trim().toLowerCase();
      const password = String(formData.get('password') || '');
      if (password.length < 6) return toast('Student password must be at least 6 characters.', 'error');
      if (db.users.some(u => u.email.toLowerCase() === email)) return toast('That email already has an account.', 'error');
      const id = `STU${String(Date.now()).slice(-7)}`;
      const year = Number(formData.get('year'));
      const course = String(formData.get('course')).trim();
      const department = String(formData.get('department')).trim();
      const student = makeSeedStudent([id, name, email, course, department, year], db.students.length + 1);
      student.password = password;
      student.profile.phone = String(formData.get('phone') || '').trim();
      student.profile.dob = String(formData.get('dob') || '');
      student.profile.gender = String(formData.get('gender') || '');
      student.profile.address = String(formData.get('address') || '').trim();
      student.profile.guardian = String(formData.get('guardian') || '').trim();
      student.profile.rollNo = String(formData.get('rollNo')).trim();
      student.profile.section = formData.get('section');
      student.profile.admissionYear = Number(formData.get('admissionYear')) || new Date().getFullYear() - year + 1;
      student.profile.expectedGraduation = Number(formData.get('expectedGraduation')) || student.profile.admissionYear + 4;
      student.profile.feeStatus = formData.get('feeStatus');
      student.cgpaOverride = formData.get('cgpaOverride') === '' ? '' : Number(formData.get('cgpaOverride'));
      student.activities = [];
      student.achievements = [];
      const setSchool = (key, prefix, stream = false) => {
        const record = student.academics[key];
        record.board = String(formData.get(`${prefix}Board`) || '').trim();
        record.school = String(formData.get(`${prefix}School`) || '').trim();
        record.passingYear = Number(formData.get(`${prefix}Year`)) || '';
        record.marks = formData.get(`${prefix}Marks`) === '' ? '' : Number(formData.get(`${prefix}Marks`));
        record.maxMarks = Number(formData.get(`${prefix}Max`)) || 100;
        record.percentage = record.marks === '' ? '' : Number((record.marks / record.maxMarks * 100).toFixed(2));
        if (stream) record.stream = formData.get(`${prefix}Stream`);
      };
      setSchool('class10', 'class10');
      setSchool('class12', 'class12', true);
      student.academics.semesters = Array.from({ length: 8 }, (_, index) => ({
        label: `Semester ${index + 1}`,
        sgpa: formData.get(`sgpa${index + 1}`) === '' ? '' : Number(formData.get(`sgpa${index + 1}`)),
        attendance: formData.get(`attendance${index + 1}`) === '' ? '' : Number(formData.get(`attendance${index + 1}`)),
        credits: formData.get(`credits${index + 1}`) === '' ? '' : Number(formData.get(`credits${index + 1}`)),
        backlogs: Number(formData.get(`backlogs${index + 1}`) || 0)
      }));
      db.students.unshift(student);
      db.users.push({ email, password, role: 'student', name, studentId: id });
      logAction('STUDENT CREATED', `New student account and academic profile created for ${name}; login credentials assigned by faculty.`, id);
      if (saveDatabase()) { closeModal(); renderView(); toast(`Student account created. Login: ${email}`); }
    });
  }

  function openEditStudentModal(id) {
    if (!['faculty','admin'].includes(activeUser?.role)) return toast('You do not have permission to edit student records.', 'error');
    const student = getStudent(id); if (!student) return;
    const p = student.profile;
    const body = `<form id="modalForm"><div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" value="${escapeHTML(p.name)}" required /></div>
      <div class="field"><label>Email</label><input name="email" type="email" value="${escapeHTML(p.email)}" required /></div>
      <div class="field"><label>Mobile number</label><input name="phone" value="${escapeHTML(p.phone)}" /></div>
      <div class="field"><label>Course / programme</label><select name="course" required>${optionOptions(COURSE_OPTIONS, p.course)}</select></div>
      <div class="field"><label>Department / school</label><select name="department" required>${optionOptions(DEPARTMENT_OPTIONS, p.department)}</select></div>
      <div class="field"><label>Current year</label><select name="currentYear">${[1,2,3,4].map(n=>`<option value="${n}" ${Number(p.currentYear)===n?'selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>Fee status</label><select name="feeStatus">${['Paid','Partly paid','Pending','Scholarship'].map(v=>`<option ${p.feeStatus===v?'selected':''}>${v}</option>`).join('')}</select></div>
      <div class="field"><label>CGPA override (optional)</label><input name="cgpaOverride" type="number" min="0" max="10" step="0.01" value="${escapeHTML(student.cgpaOverride ?? '')}" placeholder="Auto-calculate if blank" /></div>
      <div class="field"><label>Class X marks</label><input name="class10" type="number" min="0" step="0.1" value="${escapeHTML(student.academics.class10.marks ?? '')}" /></div>
      <div class="field"><label>Class XII marks</label><input name="class12" type="number" min="0" step="0.1" value="${escapeHTML(student.academics.class12.marks ?? '')}" /></div>
      <div class="field"><label>Attendance (fallback %)</label><input name="attendance" type="number" min="0" max="100" value="${escapeHTML(student.attendance ?? '')}" /></div>
      <div class="field full"><h3 class="section-title" style="margin:8px 0 0">All semester records</h3></div>
      ${semesterFormRows(student)}
      <div class="field full"><div class="file-note">Faculty edits are applied immediately and recorded in the audit trail. Student-submitted corrections still require document-backed faculty approval.</div></div>
      </div><div class="modal-actions"><button type="button" class="btn btn-plain btn-small" data-action="close-modal">Cancel</button><button class="btn btn-blue btn-small" type="submit">Save faculty changes</button></div></form>`;
    openModal(`Edit ${escapeHTML(p.name)}'s record`, 'Update profile, CGPA, semester marks and attendance.', body, (formData) => {
      const oldName = p.name;
      const nextEmail = String(formData.get('email')).trim().toLowerCase();
      if (db.users.some(u => u.email.toLowerCase() === nextEmail && u.studentId !== id)) return toast('That email already belongs to another account.', 'error');
      p.name = String(formData.get('name')).trim(); p.email = nextEmail; p.phone = String(formData.get('phone')).trim(); p.course = String(formData.get('course')).trim(); p.department = String(formData.get('department')).trim(); p.currentYear = Number(formData.get('currentYear')); p.feeStatus = formData.get('feeStatus'); student.attendance = Number(formData.get('attendance') || 0);
      student.cgpaOverride = formData.get('cgpaOverride') === '' ? '' : Number(formData.get('cgpaOverride'));
      student.academics.class10.marks = formData.get('class10') === '' ? '' : Number(formData.get('class10'));
      student.academics.class10.percentage = student.academics.class10.marks === '' ? '' : Number((student.academics.class10.marks / Number(student.academics.class10.maxMarks || 100) * 100).toFixed(2));
      student.academics.class12.marks = formData.get('class12') === '' ? '' : Number(formData.get('class12'));
      student.academics.class12.percentage = student.academics.class12.marks === '' ? '' : Number((student.academics.class12.marks / Number(student.academics.class12.maxMarks || 100) * 100).toFixed(2));
      student.academics.semesters.forEach((sem, i) => {
        sem.sgpa = formData.get(`sgpa${i+1}`) === '' ? '' : Number(formData.get(`sgpa${i+1}`));
        sem.attendance = formData.get(`attendance${i+1}`) === '' ? '' : Number(formData.get(`attendance${i+1}`));
        sem.credits = formData.get(`credits${i+1}`) === '' ? '' : Number(formData.get(`credits${i+1}`));
        sem.backlogs = Number(formData.get(`backlogs${i+1}`) || 0);
      });
      const account = db.users.find(u => u.studentId === id); if (account) { account.name = p.name; account.email = p.email; }
      logAction('FACULTY RECORD EDITED', `Faculty updated ${oldName}'s profile, marks, CGPA and all semester SGPA/attendance records.`, id);
      if (saveDatabase()) { closeModal(); renderView(); toast('Student record updated and logged.'); }
    });
  }

  function viewStudent(id) {
    focusedStudentId = id;
    currentView = 'my-records';
    renderNav(); renderView();
  }

  function exportExcel() {
    if (!['admin','faculty'].includes(activeUser?.role)) return toast('Excel export is available to staff accounts only.', 'error');
    const students = db.students;
    const studentRows = students.map(s => ({
      'Student ID': s.id, 'Name': s.profile.name, 'Email': s.profile.email, 'Mobile': s.profile.phone, 'Roll No': s.profile.rollNo,
      'Course': s.profile.course, 'Department': s.profile.department, 'Year': s.profile.currentYear, 'Section': s.profile.section,
      'Class X Board': s.academics.class10.board, 'Class X Marks': s.academics.class10.marks, 'Class X %': s.academics.class10.percentage,
      'Class XII Board': s.academics.class12.board, 'Class XII Stream': s.academics.class12.stream, 'Class XII Marks': s.academics.class12.marks, 'Class XII %': s.academics.class12.percentage,
      'CGPA (calculated)': Number(cgpa(s) || 0), 'Attendance %': averageAttendance(s), 'Activities': s.activities.length, 'Fee Status': s.profile.feeStatus
    }));
    const academicRows = students.flatMap(s => s.academics.semesters.map(sem => ({ 'Student ID': s.id, 'Student Name': s.profile.name, 'Semester': sem.label, 'SGPA': sem.sgpa, 'Credits': sem.credits, 'Attendance %': sem.attendance, 'Backlogs': sem.backlogs })));
    const activityRows = [
      ...students.flatMap(s => s.activities.map(a => ({ 'Category':'Historical student activity', 'Student ID':s.id, 'Student Name':s.profile.name, 'Activity':a.title, 'Type':a.type, 'Date':a.date, 'Time':a.time || '', 'Venue':a.venue || '', 'Description':a.description, 'Marks':a.marks ?? '' }))),
      ...(db.events || []).flatMap(event => [
        { 'Category':'College activity', 'Student ID':'', 'Student Name':'All students', 'Activity':event.title, 'Type':event.type, 'Date':event.date, 'Time':event.time || '', 'Venue':event.venue || '', 'Description':event.description, 'Registration deadline':event.signupDeadline || event.date, 'Marks':event.marks ?? '' },
        ...(event.signups || []).map(signup => {
          const student = getStudent(signup.studentId);
          return { 'Category':'Activity registration', 'Student ID':signup.studentId, 'Student Name':student?.profile.name || 'Unknown student', 'Activity':event.title, 'Type':event.type, 'Date':event.date, 'Time':event.time || '', 'Venue':event.venue || '', 'Description':event.description, 'Registration deadline':event.signupDeadline || event.date, 'Signed up at':signup.signedUpAt || '', 'Marks':event.marks ?? '' };
        })
      ])
    ];
    const requestRows = db.requests.map(r => ({ 'Request ID':r.id, 'Student ID':r.studentId, 'Section':r.section, 'Field':r.field, 'Proposed Value':r.newValue, 'Reason':r.reason, 'Status':r.status, 'Submitted':r.createdAt, 'Reviewed By':r.reviewedBy || '', 'Reviewed At':r.reviewedAt || '', 'Evidence File':r.evidence?.name || '' }));
    const logRows = db.logs.map(l => ({ 'Timestamp':l.timestamp, 'Actor':l.actor, 'Role':l.role, 'Action':l.action, 'Student ID':l.studentId, 'Details':l.details }));
    if (window.XLSX?.utils) {
      const wb = XLSX.utils.book_new();
      const addSheet = (name, rows) => {
        const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Note: 'No records available yet.' }]);
        ws['!cols'] = Object.keys(rows[0] || {Note:''}).map(key => ({ wch: Math.min(30, Math.max(14, key.length + 2)) }));
        XLSX.utils.book_append_sheet(wb, ws, name);
      };
      addSheet('Students', studentRows); addSheet('Academics', academicRows); addSheet('Activities', activityRows); addSheet('Correction Requests', requestRows); addSheet('Audit Trail', logRows);
      const summary = [{ Metric:'Total students', Value:students.length },{ Metric:'Pending correction requests', Value:getPendingCount() },{ Metric:'Average attendance %', Value: students.length ? Math.round(students.reduce((sum,s)=>sum+averageAttendance(s),0)/students.length) : 0 },{ Metric:'Exported at', Value:new Date().toLocaleString('en-IN') }];
      addSheet('Summary', summary);
      XLSX.writeFile(wb, `Ace_Records_${localDateString()}.xlsx`);
      toast('Excel workbook downloaded with six worksheets.');
    } else {
      const csv = [Object.keys(studentRows[0] || {}).join(','), ...studentRows.map(row => Object.values(row).map(value => `"${String(value ?? '').replace(/"/g,'""')}"`).join(','))].join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'Ace_Records_Students.csv'; link.click(); URL.revokeObjectURL(url);
      toast('Excel library unavailable. Downloaded an Excel-compatible CSV instead.');
    }
  }

  function handleClicks(event) {
    const viewButton = event.target.closest('[data-view]');
    if (viewButton) { if (viewButton.dataset.view === 'approvals') correctionFilterStudentId = ''; switchView(viewButton.dataset.view); return; }
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    const { action, id } = actionButton.dataset;
    switch (action) {
      case 'export': exportExcel(); break;
      case 'new-correction': openCorrectionModal(); break;
      case 'signup-event': signUpForEvent(id, false); break;
      case 'cancel-signup': signUpForEvent(id, true); break;
      case 'close-modal': closeModal(); break;
      case 'approve-request': reviewRequest(id, true); break;
      case 'reject-request': reviewRequest(id, false); break;
      case 'add-student': openAddStudentModal(); break;
      case 'edit-student': openEditStudentModal(id); break;
      case 'delete-student': deleteStudent(id); break;
      case 'view-student': viewStudent(id); break;
      case 'view-corrections': correctionFilterStudentId = id; switchView('approvals'); break;
      case 'clear-correction-filter': correctionFilterStudentId = ''; switchView('approvals'); break;
      case 'add-faculty': openFacultyModal(); break;
      case 'edit-faculty': openFacultyModal(id); break;
      case 'delete-faculty': deleteFaculty(id); break;
      case 'add-event': openEventModal(); break;
      case 'edit-event': openEventModal(id); break;
      case 'delete-event': deleteEvent(id); break;
      default: break;
    }
  }

  function initialise() {
    db = loadDatabase();
    $('#loginForm').addEventListener('submit', event => { event.preventDefault(); login($('#loginEmail').value, $('#loginPassword').value); });
    $('#togglePassword').addEventListener('click', () => {
      const input = $('#loginPassword'); input.type = input.type === 'password' ? 'text' : 'password';
    });
    $('#logoutButton').addEventListener('click', logout);
    $('#exportButton').addEventListener('click', exportExcel);
    $('#sideNav').addEventListener('click', handleClicks);
    $('#viewRoot').addEventListener('click', handleClicks);
    $('#modalRoot').addEventListener('click', handleClicks);
    $('#viewRoot').addEventListener('input', event => {
      if (event.target.id === 'studentSearch' || event.target.id === 'departmentFilter') {
        const query = ($('#studentSearch')?.value || '').toLowerCase(); const department = $('#departmentFilter')?.value || '';
        $$('#studentsTable tbody tr').forEach(row => {
          const text = row.textContent.toLowerCase();
          row.hidden = !(text.includes(query) && (!department || row.children[3].textContent === department));
        });
      }
    });
    $('#homeBrand').addEventListener('click', event => { if (activeUser) { event.preventDefault(); switchView('dashboard'); } });
  }

  function startAceRecords() {
    try {
      initialise();
    } catch (error) {
      console.error('Ace Records startup failed:', error);
      const message = document.querySelector('#loginMessage');
      if (message) message.textContent = 'The workspace could not start correctly. Please refresh the page and try again.';
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAceRecords, { once: true });
  } else {
    startAceRecords();
  }
})();
