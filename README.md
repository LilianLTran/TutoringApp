# 🎓 Tutoring Management System

A full-stack tutoring scheduling platform built with **Next.js (App Router)**, **Prisma**, **PostgreSQL**, and a centralized **email notification pipeline**.

This system supports students booking tutoring sessions, tutors managing availability, and managers overseeing the entire tutoring workflow — including dynamic email templates and automated notifications.

---

## ✨ Features

### 👨‍🎓 Student
- Submit tutoring requests
- View upcoming and past sessions
- Receive automated email confirmations and cancellations

### 🧑‍💼 Manager
- Manage tutors, instructors, courses, and sessions
- Edit email templates dynamically
- Ensure consistent communication workflows

### 👩‍🏫 Tutor
- Update session status (Completed, Cancelled, No-Show)
- Automatic email notifications on session changes



---

## 🏗 Architecture Overview

Designed with production-grade patterns:

- Role-based access control
- Atomic booking transactions
- Double-booking prevention
- Timezone-safe date handling
- Dynamic email template rendering
- Separation of business logic from UI

### Core Booking Logic

#### 🧮 Availability Resolution

Available slots are deterministically computed on the server
by combining recurring availability, applying exception
overrides, and subtracting already scheduled sessions.

#### 🔒 Double Booking Protection
Session booking is protected by a **partial unique index**:

```bash
CREATE UNIQUE INDEX "TutoringSession_unique_scheduled_slot"
ON "TutoringSession" ("tutorId", "date", "startMin")
WHERE "status" = 'SCHEDULED';
```
---

## 💻 Tech Stack

<table>
<tr>
  <td align="center" width="150"><strong>Layer</strong></td>
  <td align="center" width="200"><strong>Technology</strong></td>
  <td align="center"><strong>Purpose</strong></td>
</tr>

<tr>
  <td>🎨 Frontend</td>
  <td>
    Next.js (App Router)<br/>
    React<br/>
    TailwindCSS
  </td>
  <td>
    Server-rendered UI, component architecture, utility-first styling
  </td>
</tr>

<tr>
  <td>🧠 Backend</td>
  <td>
    Next.js Server Actions<br/>
    API Routes
  </td>
  <td>
    Secure server-side business logic and transactional operations
  </td>
</tr>

<tr>
  <td>🗄 Database</td>
  <td>
    PostgreSQL<br/>
    Prisma ORM
  </td>
  <td>
    Relational data modeling with type-safe database queries
  </td>
</tr>

<tr>
  <td>🔐 Authentication</td>
  <td>
    NextAuth.js
  </td>
  <td>
    Role-based access control (Student / Tutor / Manager)
  </td>
</tr>

<tr>
  <td>📅 Scheduling Engine</td>
  <td>
    Custom Slot Resolver<br/>
    Partial Unique Index
  </td>
  <td>
    Deterministic availability resolution and concurrency-safe booking
  </td>
</tr>

<tr>
  <td>📧 Email System</td>
  <td>
    Nodemailer (SMTP)<br/>
    DB-Driven Templates
  </td>
  <td>
    Dynamic templated notifications for booking and status updates
  </td>
</tr>

<tr>
  <td>🧰 Tooling</td>
  <td>
    TypeScript<br/>
    Prisma Migrate<br/>
    ESLint
  </td>
  <td>
    Strong typing, schema versioning, and code quality enforcement
  </td>
</tr>
</table>

---

## 📂 Project Structure
```
app/
  dashboard/
    manager/
    tutor/
    student/
  api/
lib/
  prisma/
  email/
  timeBlocks/
  bootstrap/
prisma/
  schema.prisma
```
---

## ⚙️ Local Development Setup

1️⃣ Clone Repository
```bash
git clone https://github.com/LilianLTran/TutoringApp.git
cd tutor-app
```

2️⃣ Install Dependencies
```bash
npm install
```
---

## 🔐 Environment Variables

Create a .env file in project root:

```bash
# *********************************************
# 🗄 DATABASE
#
# PostgreSQL connection string
# Format:
# postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"


# *********************************************
#
# 🔐 AUTHENTICATION PROVIDERS
# At least ONE provider must be configured.
# Leave unused providers blank.

# --- Google OAuth ---
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# --- Microsoft Azure AD (Entra ID) ---
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="GENERATE_A_SECURE_RANDOM_STRING"


# *********************************************
# 👨‍💼 ROLE CONFIGURATION
#
# Comma-separated list of manager emails.
# Users whose email matches will be assigned MANAGER role.
MANAGER_EMAILS="manager1@example.com,manager2@example.com"


# *********************************************
# 📧 EMAIL SERVICE (SMTP)
#
# Recommended: Use a production email provider such as:
# - SendGrid
# - Resend
# - Amazon SES
# - Mailgun

# Example configuration for SendGrid SMTP:
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="YOUR_SENDGRID_API_KEY"

# Sender address (must be verified with your email provider)
MAIL_FROM="no-reply@yourdomain.com"
```

Generate secret:
```bash
openssl rand -base64 32
```

---

## 🗄 Database Setup

Generate Prisma Client:
```bash
npx prisma generate
```

Run migrations:
```bash
npx prisma migrate dev
```

Seed required email templates:
```bash
npx prisma db seed
```
---

## ▶️ Run Development Server

```bash
npm run dev
```

Visit
```code
http://localhost:3000
```
---

## 📧 Email System

Email templates are stored in the database and editable via Manager UI.

Templates support dynamic variables:

```code
{{studentName}}
{{tutorName}}
{{courseName}}
{{date}}
{{time}}
{{location}}
{{reason}}
```

### Email flow:
1. Session created or updated
2.	Server Action triggers notification
3.	Template rendered with variables
4.	Sent via SMTP provider
5.	Fully async and non-blocking
---

## 🌐 Deployment

Recommended free hosting stack:
<table width="100%">
<tr>
  <td width="150"><strong>Component</strong></td>
  <td ><strong>Platform</strong></td>
</tr>

<tr>
  <td>💻 App</td>
  <td>Vercel</td>
</tr>

<tr>
  <td>✉️ Email</td>
  <td>
    SendGrid<br/>
    Gmail SMTP
  </td>
</tr>
</table>


### Production Checklist
-	Set NEXTAUTH_URL to production domain
-	Set NEXTAUTH_SECRET
-	Configure OAuth callback URLs
-	Add SMTP credentials in hosting dashboard
---

## 🚀 Future Improvements


- **Waitlist System**  
  Implement a priority-based waitlist to automatically assign
  newly available slots to pending students.

- **Advanced Booking Constraints**  
  Enforce booking rules such as:
  - Minimum 2-hour advance registration
  - Maximum one session per student per day

- **Analytics Dashboard**  
  Provide managers with insights into session volume,
  tutor utilization, and booking trends.

- **Timezone Standardization**  
  Introduce centralized timezone handling to support
  multi-region deployments and prevent offset inconsistencies.

- **Student Profile Autofill**  
  Automatically populate student name and ID
  from authenticated user records to reduce manual entry.

- **Session Filtering (Upcoming / Past)**
  Allow students, tutors, and managers to quickly filter
  sessions by upcoming vs past for easier navigation and review.

---

## 👤 Author

Developed by Lilian L. Tran

---

## 📌 Summary

This project demonstrates:
-	Production-style backend architecture
-	Deterministic availability modeling
-	Concurrency-safe booking design
-	Dynamic email templating
-	Clean role separation
-	Real-world scheduling constraints