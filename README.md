# Ace Records — Student Record Management System

**Created by Ayush Agnihotri · 2026 · ITM University End-Semester Project**

Ace Records is a cheerful, responsive student record management demo built with HTML, CSS and JavaScript. It manages student profiles, Class X and XII records, eight undergraduate semesters, CGPA, semester-wise attendance, correction requests, evidence review, college events and audit logs.

## Current features

- Separate Student and Faculty login roles.
- One demo student account is preloaded; all additional student accounts are created by faculty.
- Faculty can create student accounts, set each student's password, and enter profile details, Class X/XII marks, CGPA, and SGPA, attendance, credits and backlogs for all eight semesters.
- Faculty can edit student academic records and semester details.
- Students can request record corrections and attach supporting documents; faculty must approve the evidence before the official record changes.
- Faculty can view corrections for a specific student or review the complete approval inbox.
- Faculty directory supports creating, editing and deleting faculty accounts. The currently signed-in account and the last remaining faculty account cannot be deleted.
- Faculty can create, edit and delete college activities/events with date, time, venue, description and optional marks/points. Students can view the published events.
- Audit trail logs logins, student creation, faculty account changes, college event changes, corrections and approvals.
- Excel export is restricted to faculty and creates worksheets for Students, Academics, Activities, Correction Requests, Audit Trail and Summary.
- College enquiry button appears on the login page only and opens a prewritten email to AgnihotriAyush77@gmail.com.
- Copyright footer links to Ayush Agnihotri's LinkedIn profile in a new tab.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| Student | `ayush@student.demo` | `student123` |
| Faculty | `faculty@ace.demo` | `manish@itmuni` |

The faculty account displays as **Manish Gupta**. Faculty login is typed manually; there is no faculty demo-fill button.

## Run the website

1. Download or clone the repository.
2. Open the project folder in VS Code.
3. Open `index.html` in a browser, or use Live Server.
4. Alternatively, run `python -m http.server 5500` in this folder and visit `http://localhost:5500`.

## Database and limitations

The site uses browser `localStorage` as an inbuilt demo database. Data stays in the same browser profile on the same device; it is not shared across browsers or computers. When an older Ace Records demo database is detected, the previously bundled sample students are removed, retaining the Ayush demo student and faculty-created accounts.

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
