# 📧 Email Conditions Checklist

Use this to manually test every email trigger in the system.
Mark each as ✅ Working or ❌ Not Working after testing.

---

## 👨🎓 Student Emails

| # | Condition | How to Test | Status |
|---|-----------|-------------|--------|
| 1 | **Welcome Email** — Student registers a new account | Register a new account with any email (non-charusat) | ⬜ |
| 2 | **Login Alert** — Student logs in | Login with a student account (should get email every time) | ⬜ |
| 3 | **Event Registration Confirmed** — Student registers for an event as participant | Login as student → go to any approved event → click Register | ⬜ |
| 4 | **Coordinator Registration Approved** — Faculty/Coordinator approves student's coordinator role for an event | Student registers as coordinator for event → Faculty approves it from dashboard | ⬜ |
| 5 | **Coordinator Registration Rejected** — Faculty/Coordinator rejects student's coordinator role for an event | Student registers as coordinator for event → Faculty rejects it from dashboard | ⬜ |
| 6 | **Coordinator Role Request Approved** — Admin approves student's request to become Student Coordinator | Student applies for coordinator role → Admin approves from admin dashboard | ⬜ |
| 7 | **Coordinator Role Request Rejected** — Admin rejects student's request to become Student Coordinator | Student applies for coordinator role → Admin rejects from admin dashboard | ⬜ |

---

## 🧑🏫 Faculty Emails

| # | Condition | How to Test | Status |
|---|-----------|-------------|--------|
| 8 | **Event Submitted** — Faculty creates a new event | Login as faculty → Create Event → Submit | ⬜ |
| 9 | **Event Approved** — Admin approves faculty's event | Login as admin → go to pending events → Approve any event | ⬜ |
| 10 | **Event Rejected** — Admin rejects faculty's event | Login as admin → go to pending events → Reject any event with a reason | ⬜ |

---

## 👑 Admin Emails

| # | Condition | How to Test | Status |
|---|-----------|-------------|--------|
| 11 | **Login Alert** — Admin logs in | Login with admin account (should get email every time) | ⬜ |
| 12 | **New Event Pending** — Faculty submits a new event | Login as faculty → Create Event → Admin inbox should get notification | ⬜ |
| 13 | **New Coordinator Request** — Student requests coordinator role | Login as student → Apply for coordinator role → Admin inbox should get notification | ⬜ |

---

## 🧪 Test Accounts Needed

| Role | Email Format |
|------|-------------|
| Admin | manually set in DB |
| Faculty | `yourname@charusat.ac.in` |
| Student | any other email (e.g. Gmail) |

---

## ⚙️ Before Testing

- [ ] Server is running (`cd server && npm start`)
- [ ] `.env` has correct `EMAIL_USER=sgpproject264@gmail.com`
- [ ] `.env` has correct `EMAIL_PASS` (Gmail App Password)
- [ ] Check spam folder if email not received in inbox

---

## 📬 Email Sender
All emails are sent from: `sgpproject264@gmail.com`
