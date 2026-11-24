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

## Account access

The login page uses one shared email-and-password form. The account role is identified automatically after successful sign-in. All built-in demonstration accounts share a demonstration password, supplied separately to the project presenter. Administrators provision credentials for any additional accounts; no quick-access credentials are displayed on the login page.

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
