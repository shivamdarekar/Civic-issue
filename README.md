# VMC Civic Issue Monitoring System

A geo-fenced, offline-first digital platform designed to help Vadodara Municipal Corporation (VMC) proactively report, track, and resolve civic issues with speed, accuracy, and accountability.

This system is built as a **scalable MVP** focusing on real municipal workflows, field constraints, and role-based governance.

---

## 🎯 Problem Statement

Traditional civic issue reporting faces several challenges:

- Incorrect ward assignment due to manual location selection  
- Delays caused by paperwork and call-based reporting  
- No support for offline reporting by field staff  
- Limited transparency and accountability in issue resolution  

These problems result in slow response times, unresolved complaints, and reduced public trust.

---

## 💡 Solution Overview

The VMC Civic Issue Monitoring System solves these challenges by using:

- GPS-based issue reporting  
- Geo-fencing with municipal ward boundaries  
- Offline-first Progressive Web App (PWA)  
- Automated issue assignment to the correct ward engineer  
- Clear issue lifecycle tracking and verification  

The platform enables **proactive identification of civic issues** during daily field surveys instead of relying only on citizen complaints.

---

## 🚀 Key Features

### 📍 Issue Reporting (Field Staff)
- Capture GPS location automatically
- Upload before/after photos
- Submit issues even without internet connectivity
- Background sync when network becomes available

### 🧠 AI-assisted Categorization (Prototype)
- TensorFlow.js–based image analysis
- Suggests likely issue category (e.g., pothole, drainage)
- Acts as a decision-support tool, not an auto-decision engine
- Easily extendable for production-scale AI models

### 🗺️ Auto Ward Detection & Assignment
- Uses PostGIS spatial queries (Point-in-Polygon)
- Maps GPS coordinates to the correct municipal ward
- Automatically assigns the issue to the responsible ward engineer

### 🔐 Role-based Access Control
- Field Worker
- Ward Engineer
- Zone Officer
- Super Admin

Each role sees only relevant data and actions.

### 🔄 Issue Lifecycle Tracking
- OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED
- SLA target calculation and breach indicators
- Full action history and audit trail

### 🧭 Map & Navigation (Frontend-only)
- Issue detail page shows:
  - Ward number
  - Latitude & longitude
- One-click “Open in Map” button
- Redirects to:
  - Google Maps
  - MapMyIndia (web/app)
- Engineers can directly start navigation to the issue location

### 📱 Offline-first PWA
- Installable on mobile devices
- IndexedDB for local storage
- Service Workers for caching and sync
- Designed for real field conditions with unstable networks

---

## 👥 User Roles & Use Cases

### 🧹 Field Worker
- Report issues during daily surveys
- Capture photos and location
- Work offline when required

### 🛠️ Ward Engineer
- View issues assigned to their ward
- Update progress and resolution
- Upload after-completion proof

### 🧾 Zone Officer
- Monitor multiple wards
- Verify resolved issues
- Ensure SLA compliance

### ⚙️ Super Admin
- Manage users and roles
- Update ward/zone assignments
- Reassign issues during staff changes
- View system-wide analytics

---

## 🛠️ Technology Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Progressive Web App (PWA)
- IndexedDB for offline storage
- TensorFlow.js (AI prototype)

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- PostGIS (for spatial queries)

### Services & Tools
- Cloudinary (image storage)
- OpenStreetMap / Google Maps (navigation)
- GitHub (version control)

> Note: Redis, advanced AI pipelines, and production map APIs are planned enhancements beyond the hackathon MVP.

---

## 🗺️ Location Handling Strategy

- GPS coordinates are captured on the frontend using browser APIs
- Backend uses PostGIS to detect the correct ward via geo-fencing
- Address resolution is optional and not mandatory for workflow
- Map navigation is handled entirely on the frontend using map links

This approach avoids dependency on paid or restricted map APIs and ensures reliability during hackathon and field usage.

---

## 📁 Project Structure

VMC-Civic-Issue-Monitoring/
├── backend/
│ ├── data/
│ │ └── ward-boundaries.geojson
│ ├── prisma/
│ │ ├── schema.prisma
│ │ └── seed.ts
│ └── src/
│ ├── middlewares/
│ ├── modules/
│ │ ├── auth/
│ │ ├── issues/
│ │ ├── users/
│ │ └── admin/
│ ├── services/
│ ├── utils/
│ ├── app.ts
│ └── index.ts
│
├── frontend/
│ ├── app/
│ │ ├── (auth)/
│ │ ├── field-worker/
│ │ ├── ward-engineer/
│ │ ├── zone-officer/
│ │ └── admin/
│ ├── components/
│ ├── hooks/
│ ├── redux/
│ ├── public/
│ └── lib/
│
└── README.md

---

## 🚦 Local Setup Guide

### Prerequisites
- Node.js 18+
- PostgreSQL with PostGIS enabled
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

🏁 Hackathon Note
This project is developed as a working MVP tailored for real municipal operations.
Some integrations (production AI models, paid map APIs, background job queues) are intentionally kept at prototype level and can be fully productionized with official data access and infrastructure support from VMC.

📄 License
MIT License

---

## ✅ Final Notes

- ✔ Hackathon-safe  
- ✔ Honest & technically sound  
- ✔ Matches your backend + frontend decisions  
- ✔ Easy for judges to understand  

If you want next:
- 🎤 **Judge Q&A answers**
- 🧠 **2-minute architecture explanation**
- 📊 **Final demo walkthrough script**

Just say the word 🚀