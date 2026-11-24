# Ace Records — Student Record Management System

**Created by Ayush Agnihotri · 2026 · ITM University End-Semester Project**

Ace Records is a cheerful, responsive student record management demo built with HTML, CSS and JavaScript. It manages student profiles, Class X and XII records, eight undergraduate semesters, CGPA, semester-wise attendance, correction requests, evidence review, college events and audit logs.

## Current features

- Separate Student, Faculty and Admin login roles with role-based navigation.
- Twenty fictional student demo accounts are preloaded; additional student accounts are created by Admin; Faculty can view, edit and delete student records.
- Faculty can create student accounts, set each student's password, and enter profile details, Class X/XII marks, CGPA, and SGPA, attendance, credits and backlogs for all eight semesters.
- Faculty can edit student academic records and semester details.
- Students can request record corrections and attach supporting documents; faculty must approve the evidence before the official record changes.
- Faculty can view corrections for a specific student or review the complete approval inbox.
- Only Admin can create, edit and delete faculty accounts. Faculty can see only their own account details. The currently signed-in account and the last remaining faculty account cannot be deleted.
- Admin and Faculty can publish activities. Faculty can edit and delete activities they created; Admin can manage all activities. Students can sign up before the published registration deadline and view their own signed-up activities.
- Audit trail is Admin-only and logs logins, account changes, activity sign-ups, corrections and approvals. Students and Faculty do not see the audit trail.
- Excel export is restricted to faculty and creates worksheets for Students, Academics, Activities, Correction Requests, Audit Trail and Summary.
- College enquiry button appears on the login page only and opens a prewritten email to AgnihotriAyush77@gmail.com.
- Copyright footer links to Ayush Agnihotri's LinkedIn profile in a new tab.

## Demonstration account directory

All names, telephone numbers, login addresses and academic records in this directory are **fictional demonstration data**. The `@itmuni.in` addresses are used as login IDs in this application; they are not verified email inboxes.

### Shared demonstration password

All 24 built-in accounts (1 Admin, 3 Faculty and 20 Students) use the same demonstration password:

```text
ayush@2525
```

The same password is stored in the built-in seed data in `script.js` under `DEMO_PASSWORD`. The login role is detected automatically from the matching email and password.

### Admin account

| Account ID | Name | Login email | Demo phone | Password |
|---|---|---|---|---|
| ADM001 | Ace Records Administrator | admin@itmuni.in | 9000000200 | ayush@2525 |

### Faculty accounts

| Faculty ID | Name | Login email | Demo phone | Department | Course / programme | Password |
|---|---|---|---|---|---|---|
| FAC001 | Manish Gupta | manish.g@itmuni.in | 9000000201 | Computer Science & Intelligent Systems | B.Tech Computer Science & Engineering | ayush@2525 |
| FAC002 | Priya Sharma | priya.s@itmuni.in | 9000000202 | Business & Management | BBA / BBA (Honours / Research) | ayush@2525 |
| FAC003 | Rahul Mehta | rahul.m@itmuni.in | 9000000203 | Pharmacy | B.Pharm | ayush@2525 |

### Student accounts

| Student ID | Student name | Login email | Demo phone | Course / programme | Department | Year | Class X | Class XII | Completed semester SGPAs | Fee status (paid) |
|---|---|---|---|---|---|---:|---:|---:|---|---|
| STU1001 | Ayush Agnihotri | ayush.agnihotri@itmuni.in | 9000000101 | B.Tech Computer Science & Engineering | Computer Science | 2 | 72% | 68% | 6.4, 6.7, 7.0, 7.3 | Paid (₹1,25,000) |
| STU1002 | Mack Kushwah | mack@itmuni.in | 9000000102 | BBA / BBA (Honours / Research) | Business & Management | 1 | 79% | 77% | 6.9, 7.2 | Pending (₹0) |
| STU1003 | Neotri Sharma | neotri@itmuni.in | 9000000103 | BCA / BCA (Honours / Research) | Computer Applications | 3 | 86% | 86% | 7.4, 7.7, 8.0, 8.3, 8.6, 8.9 | Partly paid (₹48,000) |
| STU1004 | Mac Pushpa | mac@itmuni.in | 9000000104 | B.Com / B.Com (Honours / Research) | Commerce | 4 | 93% | 95% | 7.9, 8.2, 8.5, 8.8, 9.1, 9.4, 6.1, 6.4 | Scholarship (₹90,000) |
| STU1005 | Riya Sinha | riya.sinha@itmuni.in | 9000000105 | B.Sc Agriculture | Agriculture | 1 | 77% | 76% | 8.4, 8.7 | Paid (₹1,00,000) |
| STU1006 | Tejas Reddy | tejas.reddy@itmuni.in | 9000000106 | B.Tech Computer Science & Engineering (Artificial Intelligence & Machine Learning) | Computer Science & Intelligent Systems | 3 | 84% | 85% | 8.9, 9.2, 9.5, 6.2, 6.5, 6.8 | Partly paid (₹76,000) |
| STU1007 | Kavya Nair | kavya.nair@itmuni.in | 9000000107 | B.A. LL.B (Honours) | Law | 2 | 91% | 94% | 9.4, 6.1, 6.4, 6.7 | Pending (₹0) |
| STU1008 | Arjun Mehta | arjun.mehta@itmuni.in | 9000000108 | B.Pharm | Pharmacy | 2 | 75% | 75% | 6.3, 6.6, 6.9, 7.2 | Paid (₹1,18,000) |
| STU1009 | Sana Khan | sana.khan@itmuni.in | 9000000109 | B.Sc Nursing | Nursing Sciences | 4 | 82% | 84% | 6.8, 7.1, 7.4, 7.7, 8.0, 8.3, 8.6, 8.9 | Scholarship (₹85,000) |
| STU1010 | Devansh Rao | devansh.rao@itmuni.in | 9000000110 | MBA | Business & Management | 1 | 89% | 93% | 7.3, 7.6 | Paid (₹1,42,000) |
| STU1011 | Ishita Verma | ishita.verma@itmuni.in | 9000000111 | B.Tech Computer Science & Engineering (Data Science) | Computer Science & Intelligent Systems | 2 | 73% | 74% | 7.8, 8.1, 8.4, 8.7 | Pending (₹0) |
| STU1012 | Aditya Sen | aditya.sen@itmuni.in | 9000000112 | B.A. Journalism & Mass Communication | Journalism & Mass Communication | 1 | 80% | 83% | 8.3, 8.6 | Partly paid (₹52,000) |
| STU1013 | Meera Joshi | meera.joshi@itmuni.in | 9000000113 | B.Sc Biotechnology | Sciences | 3 | 87% | 92% | 8.8, 9.1, 9.4, 6.1, 6.4, 6.7 | Paid (₹1,12,000) |
| STU1014 | Kabir Khan | kabir.khan@itmuni.in | 9000000114 | B.Com Digital Sales & Marketing | Commerce | 2 | 94% | 73% | 9.3, 9.6, 6.3, 6.6 | Paid (₹95,000) |
| STU1015 | Ananya Patel | ananya.patel@itmuni.in | 9000000115 | B.Tech Mechanical Engineering | Mechanical Engineering | 4 | 78% | 82% | 6.2, 6.5, 6.8, 7.1, 7.4, 7.7, 8.0, 8.3 | Scholarship (₹88,000) |
| STU1016 | Vivaan Shah | vivaan.shah@itmuni.in | 9000000116 | MCA | Computer Applications | 1 | 85% | 91% | 6.7, 7.0 | Pending (₹0) |
| STU1017 | Pihu Mishra | pihu.mishra@itmuni.in | 9000000117 | B.Ed | Education | 2 | 92% | 72% | 7.2, 7.5, 7.8, 8.1 | Partly paid (₹61,000) |
| STU1018 | Rohan Bansal | rohan.bansal@itmuni.in | 9000000118 | B.Tech Electrical Engineering | Electrical Engineering | 3 | 76% | 81% | 7.7, 8.0, 8.3, 8.6, 8.9, 9.2 | Paid (₹1,20,000) |
| STU1019 | Tanvi Rao | tanvi.rao@itmuni.in | 9000000119 | BMLT (Medical Laboratory Technology) | Medical & Allied Healthcare | 1 | 83% | 90% | 8.2, 8.5 | Pending (₹0) |
| STU1020 | Aarav Malhotra | aarav.malhotra@itmuni.in | 9000000120 | B.Sc Forensic Science | Sciences | 2 | 90% | 71% | 8.7, 9.0, 9.3, 9.6 | Paid (₹1,35,000) |

All demonstration student accounts use password `ayush@2525`.

### What is stored in the website code

- `script.js` contains the complete seed roster: all 20 student identities, account IDs, passwords, phone numbers, programmes, departments, study years, sample school/board details, academic marks, semester results, attendance and fee statuses.
- `script.js` also contains the Admin and three Faculty seed accounts, including their IDs, login addresses, passwords, demo phone numbers, departments and programmes.
- `index.html` embeds the same application script for the GitHub Pages deployment. The embedded copy is kept in sync with `script.js`.
- On a browser's first visit, the seed data is copied into that browser's LocalStorage. On later visits, the migration refreshes the reserved demo records while retaining custom records created in that browser.

> **Public demo credential warning:** This GitHub repository and README are public. Anyone who can view this README can see the demonstration password and use the sample accounts. These accounts and records are for classroom demonstration only. Do not use this password or fictional demo setup for real university accounts.

## Run the website

1. Download or clone the repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use Live Server.
4. Alternatively, run `python -m http.server 5500` in this folder and visit `http://localhost:5500`.

## Database and limitations

The site uses browser `localStorage` as a built-in demo database. Data stays in the same browser profile on the same device; it is not shared across browsers or computers. When an older Ace Records demo database is detected, reserved sample student IDs STU1001–STU1020 and the three sample faculty accounts are refreshed with current demonstration details. Custom student and faculty accounts, events and correction requests are retained. The built-in Admin login is updated to admin@itmuni.in.

This is a front-end demonstration, not production authentication. Passwords and records are stored in LocalStorage and can be inspected or modified by the browser user. Do not use real personal data or confidential documents. A real college rollout needs a secure backend, database, server-side authentication, role-based access controls, protected document storage and backups.

## Project files

```text
Ace_Records/
├── index.html
├── style.css
├── script.js
├── Project_Data.xlsx
└── README.md
```

## Credits

© 2026 Ayush Agnihotri · [LinkedIn](https://www.linkedin.com/in/agnihotriayush77/)
