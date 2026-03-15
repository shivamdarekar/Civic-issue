# VMC CIVIC ISSUE MONITORING SYSTEM
## Minor Project Report

**Submitted in partial fulfilment of the requirements for the award of the degree of**
**Bachelor of Technology**

---

| | |
|---|---|
| **Project Title** | VMC Civic Issue Monitoring System (CiviSense) |
| **Submitted by** | Shivam Darekar |
| **Guide** | *[Faculty Name]* |
| **Department** | Computer Engineering |
| **Institution** | *[College Name]* |
| **Academic Year** | 2025–2026 |

---

## INDEX

| Chapter | Topic | Page No. |
|---------|-------|----------|
| **Chapter I** | **INTRODUCTION** | 1 |
| 1.1 | Overview | 1 |
| 1.2 | Problem Statement | 2 |
| 1.3 | Objective of Project | 3 |
| 1.4 | Applications or Scope | 4 |
| 1.5 | Organization of Report | 5 |
| **Chapter II** | **LITERATURE SURVEY** | 6 |
| **Chapter III** | **METHODOLOGY** | 9 |
| 3.1 | Background / Overview of Methodology | 9 |
| 3.2 | Platforms and Technologies Used | 10 |
| 3.3 | Proposed Methodology | 11 |
| 3.4 | Project Modules | 12 |
| 3.5 | Diagrams (ER, Use Case, DFD, etc.) | 13 |
| **Chapter IV** | **SYSTEM REQUIREMENTS** | 14 |
| 4.1 | Software Requirements | 14 |
| 4.2 | Hardware Requirements | 15 |
| **Chapter V** | **EXPECTED OUTCOMES (with GUI)** | 29 |
| **Chapter VI** | **CONCLUSION & FUTURE SCOPE** | 34 |
| 6.1 | Conclusion | 34 |
| 6.2 | Future Work | 35 |
| **Chapter VII** | **REFERENCES** | 36 |

---

# CHAPTER I — INTRODUCTION

## 1.1 Overview

The **VMC Civic Issue Monitoring System** (branded as **CiviSense**) is a geo-fenced, offline-first digital platform designed for the **Vadodara Municipal Corporation (VMC)** to proactively report, track, and resolve civic infrastructure issues with speed, accuracy, and accountability.

Urban local bodies across India face a persistent challenge: translating citizen complaints and field-staff observations into timely, traceable, and accountable action. Paper-based workflows, phone calls, and manual ledger systems lead to data loss, incorrect ward assignment, delayed resolution, and reduced public trust.

CiviSense addresses this challenge end-to-end by providing:

- A **Progressive Web App (PWA)** usable on any smartphone without installation friction
- **GPS-based automatic ward detection** using PostGIS geo-fencing, eliminating manual location selection errors
- **Offline-first architecture** allowing field workers to report issues even without an internet connection
- **Role-based dashboards** for field workers, ward engineers, zone officers, and the super admin
- **AI-assisted categorization** using TensorFlow.js (client-side) and Google Cloud Vision AI (server-side) to suggest issue categories from uploaded photos
- A complete **issue lifecycle** from submission to verification with SLA tracking and audit trail
- **Gamification** features to motivate timely issue resolution

The system is built as a full-stack, production-grade Minimum Viable Product (MVP) targeting real municipal workflows. The frontend is built with **Next.js 15 + React 19**, the backend with **Node.js + Express + Prisma ORM**, and the database with **PostgreSQL + PostGIS**.

---

## 1.2 Problem Statement

Traditional civic issue management in municipal corporations suffers from several critical limitations:

### 1.2.1 Identified Challenges

| # | Problem | Impact |
|---|---------|--------|
| 1 | **Incorrect ward assignment** due to manual location selection by field staff | Issues routed to wrong engineers, causing delays |
| 2 | **Paper-based & call-based reporting** with no digital trail | Data loss, no accountability, untraceable resolutions |
| 3 | **No offline support** for field workers in areas with poor connectivity | Reporting stops in remote or underground areas |
| 4 | **Limited transparency** — citizens cannot track issue status | Repeated complaints for the same issue, public distrust |
| 5 | **Slow SLA adherence** — no automated deadlines or breach alerts | Issues linger unresolved, especially during monsoon season |
| 6 | **Reactive-only model** — issues reported only after public complaint | Infrastructure degrades before action is taken |
| 7 | **No AI-assisted triage** — wrong category assignment leads to misrouting | Department mismatch causes resolution bottlenecks |

### 1.2.2 Root Cause Analysis

```
Manual reporting
      │
      ├─── Human error (wrong ward, wrong category)
      ├─── No offline support → Reporting gaps
      ├─── No SLA tracking → Missed deadlines
      └─── No audit trail → No accountability
```

These problems are especially acute during **monsoon season**, when roads, drainage systems, and stormwater channels need rapid response. A missed report or a wrong ward assignment can result in flooding, accidents, or disease outbreaks.

---

## 1.3 Objective of Project

The primary objectives of CiviSense are:

### Primary Objectives

1. **Digitize civic issue reporting** — Replace paper/call-based workflows with a mobile-friendly web app accessible to all field staff.

2. **Automate ward detection** — Use GPS coordinates and PostGIS spatial queries to automatically assign issues to the correct ward, eliminating human error.

3. **Enable offline-first field reporting** — Use IndexedDB (Dexie), Service Workers (Workbox), and background sync to ensure field workers can report issues anywhere, regardless of connectivity.

4. **Implement role-based governance** — Provide tailored dashboards and permissions for Field Workers, Ward Engineers, Zone Officers, and Super Admins.

5. **Track issue lifecycle with SLA** — Monitor every issue from `OPEN` to `VERIFIED` with automated SLA deadlines, breach detection, and timestamped audit trails.

6. **Integrate AI-assisted categorization** — Use TensorFlow.js on the client and Google Cloud Vision AI on the server to suggest issue categories from uploaded photos.

7. **Provide map-based navigation** — Enable engineers to navigate directly to issue locations via Google Maps, MapMyIndia, or OpenStreetMap.

### Secondary Objectives

8. **Gamification** — Motivate field workers and engineers with points, badges, streaks, and leaderboards.
9. **Secure authentication** — JWT-based auth with OTP password reset, rate limiting, and RBAC middleware.
10. **Containerized deployment** — Docker multi-stage build for easy production deployment.

---

## 1.4 Applications or Scope

### 1.4.1 Direct Applications

| Application | Description |
|-------------|-------------|
| **Municipal Corporations** | Any urban local body (ULB) in India can adopt the system for issue management |
| **Smart City Projects** | Integrates with Smart City Mission infrastructure |
| **Pradhan Mantri Awas Yojana** | Track construction and infrastructure defects in new housing projects |
| **Swachh Bharat Mission** | Report and resolve solid waste management and sanitation issues |
| **Road Maintenance** | Pothole, road damage, and bridge maintenance reporting |
| **Disaster Response** | Rapid issue reporting during floods, storms, or earthquakes |

### 1.4.2 Scope

**In Scope (Implemented):**
- Field issue reporting with GPS, photos, and offline support
- Automatic ward assignment via PostGIS geo-fencing
- Role-based dashboards (4 roles)
- Full issue lifecycle with SLA tracking
- AI-assisted category suggestion
- Map navigation integration
- Email notifications and OTP-based password reset
- Gamification (points, badges, streaks)
- Admin panel for user/zone/ward management

**Out of Scope (Future Work):**
- Native mobile apps (Android/iOS)
- Real-time push notifications (WebSockets)
- Citizen-facing public portal
- Payment gateway integration for fines
- Integration with national e-governance APIs

### 1.4.3 Geographic Scope

The current deployment is configured for **Vadodara, Gujarat, India** with:
- 4 zones: North, South, East, West
- 12 municipal wards with GeoJSON boundaries pre-loaded
- 13 departments (Road, Drainage, Water Works, etc.)

The architecture is fully replicable for any city by updating the GeoJSON ward boundaries.

---

## 1.5 Organization of Report

| Chapter | Description |
|---------|-------------|
| **Chapter I — Introduction** | Provides a project overview, problem statement, objectives, scope, and report structure |
| **Chapter II — Literature Survey** | Reviews existing civic management systems, PWA research, geo-fencing technologies, and AI categorization studies |
| **Chapter III — Methodology** | Describes the development methodology, technology stack, system architecture, project modules, and key design diagrams (ER, Use Case, DFD) |
| **Chapter IV — System Requirements** | Lists all software and hardware requirements for development and deployment |
| **Chapter V — Expected Outcomes** | Presents the user interface screens and expected system behavior for each role |
| **Chapter VI — Conclusion & Future Scope** | Summarizes achievements and outlines planned enhancements |
| **Chapter VII — References** | Lists all references, papers, and resources used |

---

# CHAPTER II — LITERATURE SURVEY

## 2.1 Existing Civic Issue Management Systems

### 2.1.1 Open311 Standard (USA)

Open311 is an open-data protocol for civic issue management, widely adopted in US cities (Chicago, New York, Boston). It provides a standardized REST API for submitting and querying service requests. CiviSense's issue category `formSchema` field is designed to be **Open311 compatible**, allowing future integration.

**Limitation:** Open311 lacks offline support and geospatial ward auto-assignment.

### 2.1.2 SeeClickFix

SeeClickFix (USA) allows citizens to report non-emergency civic issues via a mobile app. It includes photo upload and status tracking. However, it is a **citizen-facing tool** and does not support internal municipal workflows (field worker → ward engineer → zone officer).

### 2.1.3 FixMyStreet (UK)

FixMyStreet by MySociety is an open-source civic reporting platform used in the UK and several other countries. It supports map-based reporting and email notifications to councils.

**Limitation:** No role-based internal dashboard, no offline support, no SLA tracking.

### 2.1.4 IGRS / MyGov Portals (India)

Several state governments in India operate Integrated Grievance Redressal Systems (IGRS). These are web portals primarily for citizens but lack field-worker tools, geo-fencing, and offline capabilities.

---

## 2.2 Progressive Web Apps (PWA) Research

Progressive Web Apps bridge the gap between native apps and websites. Key studies show:

- **Google (2020)** — PWAs on Android have 36% higher conversion rates than native apps for first-time users due to no install friction.
- **Workbox (Google Chrome Team)** — Service Worker caching strategies (cache-first, network-first, stale-while-revalidate) enable reliable offline functionality.
- **IndexedDB (W3C Standard)** — Browser-native structured storage allows rich offline data persistence (CiviSense uses Dexie.js as an abstraction layer).

CiviSense uses the **@ducanh2912/next-pwa** library on top of Next.js to configure Workbox service workers with optimal caching strategies.

---

## 2.3 Geo-fencing & Spatial Databases

### 2.3.1 PostGIS

PostGIS is a spatial extension for PostgreSQL that adds support for geographic objects. The **Point-in-Polygon** query used in CiviSense:

```sql
SELECT w.id FROM wards w
WHERE w.boundary IS NOT NULL
  AND ST_Contains(
    w.boundary,
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  )
```

This approach eliminates manual ward selection entirely, reducing data entry errors to near-zero for geographic assignment.

### 2.3.2 GeoJSON

GeoJSON (RFC 7946) is the standard format for encoding geographic data structures. CiviSense pre-loads ward boundaries as a GeoJSON file (`ward-boundaries.geojson`) and seeds it into the PostGIS database.

---

## 2.4 AI-Assisted Image Categorization

### 2.4.1 TensorFlow.js

TensorFlow.js allows machine learning models to run directly in the browser using WebGL acceleration. CiviSense uses:
- **MobileNet** — A lightweight CNN pre-trained on ImageNet, used as a feature extractor
- **Teachable Machine** — Google's tool for training custom image classifiers without deep ML expertise

The client-side model suggests categories (pothole, drainage, garbage, etc.) from a captured photo before the issue is submitted.

### 2.4.2 Google Cloud Vision AI

For server-side validation and higher accuracy, CiviSense integrates the Google Cloud Vision API to analyze uploaded images and return labels, which are matched against predefined issue categories using keyword rules.

---

## 2.5 Comparison Table

| Feature | Open311 | FixMyStreet | SeeClickFix | **CiviSense (This Project)** |
|---------|---------|-------------|-------------|------------------------------|
| Offline Support | ✗ | ✗ | ✗ | ✅ (PWA + IndexedDB) |
| Auto Ward Detection | ✗ | ✗ | ✗ | ✅ (PostGIS) |
| Role-based Dashboards | ✗ | ✗ | Partial | ✅ (4 roles) |
| SLA Tracking | ✗ | ✗ | ✗ | ✅ |
| AI Categorization | ✗ | ✗ | ✗ | ✅ (TF.js + Vision AI) |
| Gamification | ✗ | ✗ | ✗ | ✅ |
| Open Source | ✅ | ✅ | ✗ | ✅ |
| Mobile PWA | ✗ | ✗ | Native App | ✅ |

---

# CHAPTER III — METHODOLOGY

## 3.1 Background / Overview of Methodology

CiviSense was developed using an **Agile Iterative Development** methodology with the following phases:

| Phase | Activity |
|-------|----------|
| **Phase 1 — Planning** | Requirement gathering, stakeholder analysis, technology selection |
| **Phase 2 — Design** | System architecture, database schema (18 models), API design, UI wireframes |
| **Phase 3 — Development** | Sprint-based feature development (backend → frontend → integration) |
| **Phase 4 — Testing** | Unit tests, API testing (Postman), offline simulation, spatial query validation |
| **Phase 5 — Deployment** | Dockerized multi-stage build, environment configuration |

### Development Approach

The project follows a **full-stack monorepo** structure:
- `backend/` — REST API (Node.js + Express + Prisma)
- `frontend/` — Next.js PWA (React + Redux)

The backend API was designed and documented first (contract-first approach), enabling parallel frontend development.

---

## 3.2 Platforms and Technologies Used

### 3.2.1 Frontend Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.x | Full-stack React framework (App Router) |
| **React** | 19.x | UI component library |
| **TypeScript** | 5.x | Type safety across all files |
| **Tailwind CSS** | 4.x | Utility-first CSS styling |
| **Redux Toolkit** | 2.x | Global state management |
| **Redux Persist** | 6.x | Persist auth state to localStorage |
| **Radix UI** | Latest | Accessible, headless component primitives |
| **Dexie** | 4.x | IndexedDB wrapper for offline storage |
| **@ducanh2912/next-pwa** | 10.x | Service Worker / PWA configuration |
| **Workbox** | 7.x | Service Worker caching strategies |
| **TensorFlow.js** | 4.x | Client-side image AI model |
| **Teachable Machine** | 0.8.x | Pre-trained image classification |
| **MobileNet** | 2.x | Lightweight CNN feature extractor |
| **Axios** | 1.x | HTTP client |
| **React Hook Form** | 7.x | Form state management & validation |
| **Zod** | 4.x | Schema-based form validation |
| **Sonner** | 2.x | Toast notifications |
| **Lucide React** | Latest | SVG icon library |

### 3.2.2 Backend Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | 5.x | HTTP web framework |
| **TypeScript** | 5.x | Type safety |
| **Prisma ORM** | 5.x | Database schema, migrations, query builder |
| **PostgreSQL** | 15.x | Primary relational database |
| **PostGIS** | 3.x | Spatial extension — geo-fencing queries |
| **Redis** | 7.x | Session/token caching, rate limit store |
| **bcryptjs** | 3.x | Password hashing (10 salt rounds) |
| **JWT (jsonwebtoken)** | 9.x | Token-based authentication |
| **Zod** | 3.x | Request body validation |
| **Nodemailer** | 6.x | Email service (OTP, notifications) |
| **Multer** | 1.x | Multipart file upload middleware |
| **Morgan** | 1.x | HTTP request logging |
| **Compression** | 1.x | Gzip response compression |

### 3.2.3 Cloud & External Services

| Service | Purpose |
|---------|---------|
| **Cloudinary** | Image storage, CDN, transformations (before/after photos) |
| **Google Cloud Vision AI** | Server-side image analysis, label detection |
| **Supabase** | Managed PostgreSQL (with PostGIS enabled) hosting |
| **Docker** | Multi-stage containerization for production deployment |
| **GitHub** | Version control, source code management |
| **Google Maps** | Navigation link provider (frontend only) |
| **MapMyIndia** | Alternative India-specific navigation |
| **OpenStreetMap** | Open-source map navigation |

---

## 3.3 Proposed Methodology

### 3.3.1 System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │           Next.js 15 PWA (App Router)                     │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │ Field Worker │  │Ward Engineer │  │  Zone Officer  │  │   │
│  │  │  Dashboard   │  │  Dashboard   │  │   Dashboard    │  │   │
│  │  └──────────────┘  └──────────────┘  └────────────────┘  │   │
│  │  ┌───────────────────┐  ┌──────────────────────────────┐  │   │
│  │  │  Redux + Persist  │  │  Dexie IndexedDB (Offline)   │  │   │
│  │  └───────────────────┘  └──────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │  Service Worker (Workbox) — Background Sync        │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │ HTTPS / REST API
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        API LAYER                                  │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │         Node.js + Express.js REST API (Port 4000)          │   │
│  │  ┌──────────────┐  ┌────────────┐  ┌──────────────────┐  │   │
│  │  │  Auth Module │  │Issue Module│  │   Admin Module   │  │   │
│  │  │ /api/v1/auth │  │/api/v1/iss.│  │  /api/v1/admin   │  │   │
│  │  └──────────────┘  └────────────┘  └──────────────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐  │   │
│  │  │ Users Module │  │  Middleware: JWT, RBAC, Zod,      │  │   │
│  │  │/api/v1/users │  │  Rate Limiter, Error Handler      │  │   │
│  │  └──────────────┘  └──────────────────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
┌──────────────┐    ┌──────────────┐    ┌─────────────────┐
│  PostgreSQL  │    │    Redis     │    │   Cloudinary    │
│  + PostGIS   │    │  (Sessions)  │    │ (Image Storage) │
│  (Supabase)  │    │              │    │                 │
└──────────────┘    └──────────────┘    └─────────────────┘
       │
       │ Google Cloud Vision AI
       │ (Image Label Detection)
       ▼
┌──────────────────┐
│  External APIs   │
│  Google Maps     │
│  MapMyIndia      │
│  SMTP/Email      │
└──────────────────┘
```

### 3.3.2 Issue Lifecycle State Machine

```
[OPEN]
   │
   │ Auto-assign to ward engineer (PostGIS)
   ▼
[ASSIGNED]
   │
   │ Engineer starts work
   ▼
[IN_PROGRESS]
   │
   ├─── Resolved by engineer ──────────────▶ [RESOLVED]
   │                                               │
   │                                      Zone Officer verifies
   │                                               │
   │                               ┌──────────────┴──────────────┐
   │                               ▼                             ▼
   │                          [VERIFIED]                   [REJECTED]
   │                               │                             │
   │                               ▼                             │
   │                           [CLOSED]            Reopen by Officer
   │                                                             │
   └──────────────────────── [REOPENED] ◄──────────────────────-┘
```

### 3.3.3 Offline Sync Flow

```
Field Worker Offline
       │
       ▼
Capture GPS + Photo
       │
       ▼
Store in Dexie IndexedDB
(syncStatus: 'pending')
       │
Network Restored?
       │
       ▼ YES
SyncService.syncPendingIssues()
       │
       ├── Mark 'syncing'
       ├── POST /api/v1/issues
       ├── Success: Mark 'synced', remove local
       └── Failure: Increment retryCount (max 3), mark 'failed'
```

---

## 3.4 Project Modules

The system is organized into four major backend modules and five frontend role-based dashboards:

### 3.4.1 Backend Modules

#### Module 1: Authentication (`/api/v1/auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/login` | POST | Email + password login, returns JWT |
| `/forgot-password` | POST | Generate & email 6-digit OTP |
| `/verify-otp` | POST | Validate OTP (3 attempts/5min limit) |
| `/reset-password` | POST | Set new password (bcryptjs hashed) |
| `/logout` | POST | Blacklist JWT token in Redis |
| `/profile` | GET | Current user profile (15min cache) |

**Security Features:**
- Rate limiting: 5 login attempts per 15 minutes
- OTP rate limiting: 3 requests per 5 minutes
- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens stored in httpOnly cookies

#### Module 2: Issues (`/api/v1/issues`)

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/` | POST | Field Worker | Create new issue (triggers geo-fencing) |
| `/` | GET | All | List issues with filters |
| `/:id` | GET | All | Issue detail |
| `/:id/status` | PATCH | Engineer/Officer | Update issue status |
| `/:id/after-media` | POST | Engineer | Upload resolution photos |
| `/:id/comments` | POST | All | Add comment |
| `/:id/reassign` | PATCH | Admin/Officer | Reassign to different engineer |
| `/:id/verify` | PATCH | Zone Officer | Verify or reject resolution |
| `/:id/reopen` | PATCH | Zone Officer | Reopen a closed issue |
| `/upload/before` | POST | Field Worker | Upload pre-repair photos to Cloudinary |
| `/analyze-image` | POST | Field Worker | AI image analysis (Vision AI) |
| `/stats` | GET | All | Statistics for dashboard |
| `/categories` | GET | All | Available issue categories with SLA |

**Key Feature — PostGIS Auto Ward Assignment:**
```sql
SELECT w.id, w.wardNumber, w.name, w.zoneId
FROM wards w
WHERE w.boundary IS NOT NULL
  AND ST_Contains(
    w.boundary,
    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
  )
LIMIT 1;
```

#### Module 3: Users (`/api/v1/users`)

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/dashboard/field-worker` | GET | Field Worker | Personal stats, recent submissions |
| `/dashboard/ward-engineer` | GET | Ward Engineer | Assigned issues, SLA compliance |
| `/profile` | PATCH | All | Update profile info |
| `/change-password` | POST | All | Authenticated password change |
| `/activity` | GET | All | User activity log |
| `/assigned-issues` | GET | Ward Engineer | Paginated list of assigned issues |

#### Module 4: Admin (`/api/v1/admin`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Register new user (any role) |
| `/users` | GET | List all users with role/ward filters |
| `/users/:id` | GET/PUT | User detail & update |
| `/users/:id/reassign` | POST | Bulk reassign issues to another engineer |
| `/users/:id/deactivate` | PATCH | Deactivate user account |
| `/dashboard` | GET | System-wide analytics |
| `/zones` | GET | All zones with ward counts |
| `/zones/:id/wards` | GET | Wards in a zone |
| `/wards/:id` | GET | Ward details + assigned engineers |

### 3.4.2 Frontend Modules

| Module | Route | Role | Description |
|--------|-------|------|-------------|
| Authentication | `/login`, `/forgot-password` | All | Login, OTP-based password reset |
| Field Worker Dashboard | `/field-worker/*` | Field Worker | Issue creation, my issues, activity |
| Ward Engineer Dashboard | `/ward-engineer/*` | Ward Engineer | Assigned issues, resolution upload |
| Zone Officer Dashboard | `/zone-officer/*` | Zone Officer | Multi-ward monitoring, verification |
| Admin Panel | `/admin/*` | Super Admin | User management, zone/ward config |
| Offline Fallback | `/offline` | All | Graceful offline UX |

---

## 3.5 Diagrams

### 3.5.1 Entity-Relationship (ER) Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ER DIAGRAM                                  │
│                   VMC Civic Issue System                            │
└─────────────────────────────────────────────────────────────────────┘

  ┌─────────┐         ┌─────────┐
  │  ZONE   │ 1     N │  WARD   │
  │─────────│─────────│─────────│
  │ id (PK) │         │ id (PK) │
  │ name    │         │ wardNum │
  │ code    │         │ name    │
  └─────────┘         │ boundary│ (geometry/PostGIS)
        │             │ zoneId  │ (FK → Zone)
        │             └─────────┘
        │                  │ 1
        │                  │ N
        │             ┌────────────────────────────────────────────┐
        │             │                  USER                      │
        │             │────────────────────────────────────────────│
        │             │ id (PK)          | email                   │
        │             │ fullName         | phoneNumber             │
        │             │ hashedPassword   | role (enum)             │
        │             │ isActive         | department (enum)       │
        │             │ wardId (FK→Ward) | zoneId (FK→Zone)        │
        │             └────────────────────────────────────────────┘
        │                  │              │
        │           reports│         assigned│
        │               N  │            N  │
        │             ┌────────────────────────────────────────────┐
        │             │                 ISSUE                      │
        │             │────────────────────────────────────────────│
        │             │ id (PK)          | ticketNumber (UNIQUE)   │
        │             │ status (enum)    | priority (enum)         │
        │             │ description      | address                 │
        │             │ latitude         | longitude               │
        │             │ eloc             | aiTags[]                │
        │             │ metaData (JSON)  | slaTargetAt             │
        │             │ assignedAt       | resolvedAt              │
        │             │ verifiedAt       | closedAt                │
        │             │ wardId (FK)      | categoryId (FK)         │
        │             │ reporterId (FK)  | assigneeId (FK)         │
        │             │ version          | deletedAt               │
        │             └────────────────────────────────────────────┘
        │                  │ 1
        │       ┌──────────┼──────────┬──────────┬──────────┐
        │       │N         │N         │N         │N         │N
        │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │ │  ISSUE   │ │ COMMENT  │ │  ISSUE   │ │ISSUE_CATEGORY│
        │ │  MEDIA   │ │──────────│ │ HISTORY  │ │──────────────│
        │ │──────────│ │ id (PK)  │ │──────────│ │ id (PK)      │
        │ │ id (PK)  │ │ issueId  │ │ id (PK)  │ │ name         │
        │ │ issueId  │ │ userId   │ │ issueId  │ │ slug         │
        │ │ type     │ │ text     │ │ changedBy│ │ slaHours     │
        │ │ url      │ │createdAt │ │changeType│ │ department   │
        │ │ mimeType │ └──────────┘ │ oldValue │ │ formSchema   │
        │ │ fileSize │             │ newValue  │ │ isActive     │
        │ └──────────┘             └──────────┘ └──────────────┘

        ┌──────────────────────────────────────────┐
        │           GAMIFICATION CLUSTER           │
        ├──────────────────────────────────────────┤
        │  USER_GAMIFICATION                       │
        │  userId (PK, FK→User)                    │
        │  points | issuesReported | issuesResolved│
        │  slaCompliance | currentStreak           │
        │  longestStreak | lastActiveAt            │
        └──────────────┬───────────────────────────┘
                       │ N:M
               ┌───────┴────────┐
               │ BADGE_ASSIGNMENT│
               │───────────────-│
               │ userId (FK)    │
               │ badgeId (FK)   │
               │ awardedAt      │
               └───────┬────────┘
                       │
               ┌───────┴────────┐
               │     BADGE      │
               │────────────────│
               │ id (PK)        │
               │ name, slug     │
               │ description    │
               │ threshold      │
               │ badgeType      │
               └────────────────┘

        ┌──────────────────────────────────────────┐
        │              AUDIT CLUSTER               │
        ├──────────────────────────────────────────┤
        │  AUDIT_LOG                               │
        │  id | userId (FK) | action | resource    │
        │  resourceId | ipAddress | userAgent      │
        │  metadata | createdAt                    │
        ├──────────────────────────────────────────┤
        │  PASSWORD_RESET                          │
        │  id | userId (FK) | otp | expiresAt      │
        │  isUsed | attempts | createdAt           │
        ├──────────────────────────────────────────┤
        │  SESSION                                 │
        │  id | userId | token | expiresAt         │
        └──────────────────────────────────────────┘
```

### 3.5.2 Use Case Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USE CASE DIAGRAM                                 │
│                   VMC Civic Issue System                            │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────┐          ┌────────────────────────────────────────────┐
  │          │          │              SYSTEM BOUNDARY               │
  │  FIELD   │──────────┤► UC1: Login / Logout                      │
  │  WORKER  │          │► UC2: Report Civic Issue (GPS + Photo)     │
  │          │──────────┤► UC3: Work Offline (IndexedDB Sync)       │
  └──────────┘          │► UC4: View My Submitted Issues             │
                        │► UC5: View Activity Log                    │
                        └────────────────────────────────────────────┘

  ┌──────────┐          ┌────────────────────────────────────────────┐
  │   WARD   │          │► UC1: Login / Logout                      │
  │ENGINEER  │──────────┤► UC6: View Assigned Issues                 │
  │          │──────────┤► UC7: Update Issue Status (In-Progress)   │
  │          │──────────┤► UC8: Upload After-Repair Photos          │
  │          │──────────┤► UC9: Mark Issue as Resolved              │
  │          │──────────┤► UC10: Add Comments                       │
  └──────────┘          │► UC11: Navigate to Issue Location (Maps)  │
                        └────────────────────────────────────────────┘

  ┌──────────┐          ┌────────────────────────────────────────────┐
  │  ZONE    │          │► UC1: Login / Logout                      │
  │ OFFICER  │──────────┤► UC12: Monitor All Wards in Zone          │
  │          │──────────┤► UC13: Verify Resolved Issues             │
  │          │──────────┤► UC14: Reject Resolution (Reopen Issue)   │
  │          │──────────┤► UC15: Reassign Issue to Another Engineer │
  └──────────┘          │► UC16: View SLA Compliance Reports        │
                        └────────────────────────────────────────────┘

  ┌──────────┐          ┌────────────────────────────────────────────┐
  │  SUPER   │          │► UC1: Login / Logout                      │
  │  ADMIN   │──────────┤► UC17: Register New Users (All Roles)     │
  │          │──────────┤► UC18: Activate / Deactivate Users        │
  │          │──────────┤► UC19: Bulk Reassign Issues               │
  │          │──────────┤► UC20: View System Analytics Dashboard    │
  │          │──────────┤► UC21: Manage Zones & Wards               │
  └──────────┘          │► UC22: View Audit Logs                    │
                        └────────────────────────────────────────────┘

  ┌──────────┐          ┌────────────────────────────────────────────┐
  │  SYSTEM  │          │► UC23: Auto Ward Detection (PostGIS)      │
  │  (Auto)  │──────────┤► UC24: Send Email Notifications           │
  │          │          │► UC25: Calculate SLA Deadlines            │
  │          │          │► UC26: AI Image Category Suggestion       │
  └──────────┘          │► UC27: Background Sync (Service Worker)   │
                        └────────────────────────────────────────────┘
```

### 3.5.3 Data Flow Diagram (DFD) — Level 0 (Context Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                  DFD LEVEL 0 — CONTEXT DIAGRAM                     │
└─────────────────────────────────────────────────────────────────────┘

  ┌────────────┐    Issue Report / Photos        ┌────────────────────┐
  │            │ ─────────────────────────────►  │                    │
  │Field Worker│                                 │                    │
  │            │ ◄─────────────────────────────  │                    │
  └────────────┘  Ticket ID / Status Updates     │                    │
                                                 │  VMC CIVIC ISSUE   │
  ┌────────────┐   View/Update Issues            │     MONITORING     │
  │   Ward     │ ─────────────────────────────►  │      SYSTEM        │
  │  Engineer  │                                 │                    │
  │            │ ◄─────────────────────────────  │                    │
  └────────────┘  Assigned Issues / Alerts       │                    │
                                                 │                    │
  ┌────────────┐   Monitor / Verify              │                    │
  │    Zone    │ ─────────────────────────────►  │                    │
  │  Officer   │ ◄─────────────────────────────  │                    │
  └────────────┘    Reports / SLA Metrics        │                    │
                                                 │                    │
  ┌────────────┐   System Config / Management    │                    │
  │   Super    │ ─────────────────────────────►  │                    │
  │   Admin    │ ◄─────────────────────────────  │                    │
  └────────────┘   Analytics / Audit Logs        └────────────────────┘
                                                         │
                          ┌──────────────────────────────┤
                          │                              │
                          ▼                              ▼
                 ┌──────────────────┐         ┌──────────────────┐
                 │   PostgreSQL +   │         │   Cloudinary /   │
                 │    PostGIS DB    │         │  Google Vision   │
                 └──────────────────┘         └──────────────────┘
```

### 3.5.4 Data Flow Diagram (DFD) — Level 1

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DFD LEVEL 1                                    │
└─────────────────────────────────────────────────────────────────────┘

Field Worker ──── GPS + Photo + Details ─────►  ┌──────────────────┐
                                                 │  1.0             │
                                                 │  Issue           │
                                                 │  Submission      │
                                                 │  Module          │
                                                 └──────┬───────────┘
                                                        │
                    ┌───────────────────────────────────┤
                    │                                   │
                    ▼                                   ▼
           ┌──────────────────┐             ┌──────────────────────┐
           │  2.0             │             │  3.0                 │
           │  Geo-fencing     │             │  Image Upload        │
           │  (PostGIS)       │             │  & AI Analysis       │
           │  Ward Detection  │             │  (Cloudinary +       │
           └──────┬───────────┘             │  Google Vision AI)   │
                  │                         └──────────┬───────────┘
                  │ Ward ID                            │ Category Suggestion
                  ▼                                    │
           ┌──────────────────┐                        │
           │  4.0             │◄───────────────────────┘
           │  Issue Creation  │
           │  & Assignment    │
           │  (SLA Calc)      │
           └──────┬───────────┘
                  │
         ┌────────┼────────┐
         │        │        │
         ▼        ▼        ▼
  ┌──────────┐ ┌──────┐ ┌──────────────┐
  │ Issues   │ │Email │ │ Issue History │
  │  (DB)    │ │ Notif│ │    (DB)      │
  └──────────┘ └──────┘ └──────────────┘
         │
         ▼
  ┌──────────────────┐
  │  5.0             │
  │  Status Update   │◄─── Ward Engineer (Status Change / After Photo)
  │  & Resolution    │
  └──────┬───────────┘
         │
         ▼
  ┌──────────────────┐
  │  6.0             │
  │  Verification    │◄─── Zone Officer (Verify / Reject / Reopen)
  │  & Closure       │
  └──────────────────┘
```

### 3.5.5 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                              │
└─────────────────────────────────────────────────────────────────────┘

  User                  Frontend              Backend              Redis/DB
   │                       │                     │                    │
   │──── Email + Pass ─────►│                     │                    │
   │                       │──── POST /login ────►│                    │
   │                       │                     │─── Find User (DB) ─►│
   │                       │                     │◄── User Record ─────│
   │                       │                     │─── bcrypt.compare ──│
   │                       │                     │─── Generate JWT ─   │
   │                       │                     │─── Store Session ──►│
   │                       │◄─── JWT Token ───────│                    │
   │◄── Set httpOnly Cookie─│                     │                    │
   │                       │                     │                    │
   │                       │                     │                    │
   │──── Access Resource ──►│                     │                    │
   │                       │──── API + Cookie ───►│                    │
   │                       │                     │─── Verify JWT ──   │
   │                       │                     │─── Check Blacklist ►│
   │                       │                     │─── RBAC Check ──   │
   │                       │◄─── Response ────────│                    │
   │◄── Data ──────────────-│                     │                    │
```

---

# CHAPTER IV — SYSTEM REQUIREMENTS

## 4.1 Software Requirements

### 4.1.1 Development Environment

| Software | Version | Purpose |
|---------|---------|---------|
| **Node.js** | 20.x LTS | JavaScript runtime (backend + frontend tooling) |
| **npm** | 10.x | Package manager |
| **Git** | 2.x+ | Version control |
| **PostgreSQL** | 15.x | Primary database |
| **PostGIS** | 3.x | Spatial extension for PostgreSQL |
| **Redis** | 7.x | In-memory cache and session store |
| **Docker** | 24.x+ | Containerization (optional for local dev) |
| **Docker Compose** | 2.x | Multi-container orchestration |
| **VS Code** | Latest | Code editor (recommended) |

### 4.1.2 Backend Software Requirements

| Package | Version | Role |
|---------|---------|------|
| express | 5.x | HTTP web framework |
| typescript | 5.x | Type checking + compilation |
| @prisma/client | 5.x | Database ORM client |
| prisma | 5.x | Database schema + migrations CLI |
| jsonwebtoken | 9.x | JWT token sign/verify |
| bcryptjs | 3.x | Password hashing |
| zod | 3.x | Request schema validation |
| nodemailer | 6.x | Email delivery (OTP, notifications) |
| multer | 1.x | File upload middleware |
| cloudinary | 2.x | Cloud image storage |
| @google-cloud/vision | 4.x | Vision AI image analysis |
| ioredis | 5.x | Redis client |
| express-rate-limit | 7.x | API rate limiting |
| morgan | 1.x | HTTP request logging |
| compression | 1.x | Gzip response compression |
| cors | 2.x | Cross-origin resource sharing |
| cookie-parser | 1.x | Cookie parsing middleware |
| dotenv | 16.x | Environment variable loading |
| tsx | 4.x | TypeScript execution for dev |

### 4.1.3 Frontend Software Requirements

| Package | Version | Role |
|---------|---------|------|
| next | 15.x | Full-stack React framework |
| react | 19.x | UI rendering |
| typescript | 5.x | Type safety |
| tailwindcss | 4.x | CSS styling |
| @reduxjs/toolkit | 2.x | State management |
| redux-persist | 6.x | State persistence to localStorage |
| dexie | 4.x | IndexedDB abstraction (offline) |
| @ducanh2912/next-pwa | 10.x | PWA / Service Worker |
| workbox-window | 7.x | Service Worker utilities |
| @tensorflow/tfjs | 4.x | ML in browser |
| @teachablemachine/image | 0.8.x | Image classifier |
| axios | 1.x | HTTP client |
| react-hook-form | 7.x | Form management |
| zod | 4.x | Frontend validation |
| sonner | 2.x | Toast notifications |
| @radix-ui/* | Latest | UI component primitives |
| lucide-react | Latest | Icon library |

### 4.1.4 Operating System Requirements

| Component | Supported OS |
|-----------|-------------|
| Development workstation | Windows 10/11, macOS 12+, Ubuntu 20.04+ |
| Backend server | Linux (Ubuntu 20.04/22.04 recommended) |
| Docker container | Any OS with Docker Engine 24+ |
| End-user device | Any modern smartphone/tablet with a browser (Chrome 90+, Firefox 90+, Safari 14+) |

### 4.1.5 Browser Requirements (Client)

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Google Chrome | 90+ | Full PWA support (recommended) |
| Mozilla Firefox | 90+ | PWA supported |
| Safari | 14+ | iOS PWA support |
| Edge | 90+ | Full support |
| Samsung Internet | 13+ | Good PWA support on Android |

### 4.1.6 Environment Configuration

#### Backend `.env` Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) | `postgresql://user:pass@host:5432/db` |
| `DIRECT_URL` | PostgreSQL direct connection (migrations) | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment (`development`/`production`) | `production` |
| `PORT` | HTTP server port | `4000` |
| `FRONTEND_URL` | Allowed CORS origin | `https://yourapp.com` |
| `JWT_SECRET` | Secret for signing JWT tokens (min 10 chars) | `super-secret-key` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `SMTP_HOST` | Email SMTP host | `smtp.gmail.com` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Sender email address | `noreply@vmc.gov.in` |
| `SMTP_PASS` | SMTP app password | `app-specific-password` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret` |
| `GOOGLE_VISION_KEY_PATH` | Path to Google Vision service account JSON | `./google-vision-key.json` |
| `GOOGLE_CLOUD_PROJECT_ID` | Google Cloud Project ID | `my-project-id` |

---

## 4.2 Hardware Requirements

### 4.2.1 Development Workstation (Minimum)

| Component | Minimum Specification |
|-----------|----------------------|
| **Processor** | Intel Core i5 (8th gen) / AMD Ryzen 5 or equivalent |
| **RAM** | 8 GB DDR4 |
| **Storage** | 20 GB free SSD space (for Node modules, Docker images, DB) |
| **Network** | Stable broadband internet (for npm installs, Cloudinary, Google APIs) |
| **Display** | 1366×768 or higher |
| **OS** | Windows 10/11, macOS 12+, Ubuntu 20.04+ |

### 4.2.2 Development Workstation (Recommended)

| Component | Recommended Specification |
|-----------|--------------------------|
| **Processor** | Intel Core i7/i9 (10th gen+) / AMD Ryzen 7/9 |
| **RAM** | 16 GB DDR4 |
| **Storage** | 50 GB SSD |
| **GPU** | Any (for TensorFlow.js WebGL acceleration during testing) |
| **Network** | Broadband 50+ Mbps |

### 4.2.3 Backend Server (Production Deployment)

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 vCPU | 4 vCPU |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **OS** | Ubuntu 20.04 LTS | Ubuntu 22.04 LTS |
| **Network** | 100 Mbps | 1 Gbps |
| **PostgreSQL** | Hosted (Supabase Free) | Supabase Pro / AWS RDS |
| **Redis** | Hosted (Upstash Free) | Upstash Pro / AWS ElastiCache |
| **Docker** | Docker Engine 24+ | Docker Engine 24+ |

### 4.2.4 Client Device (Field Worker / End User)

| Component | Minimum Specification |
|-----------|----------------------|
| **Device** | Smartphone (Android 8+) or tablet |
| **RAM** | 2 GB |
| **Storage** | 500 MB free (for PWA cache + IndexedDB) |
| **Browser** | Chrome 90+ (Android) / Safari 14+ (iOS) |
| **GPS** | Built-in GPS or network-based location |
| **Camera** | 5 MP or higher for issue photo capture |
| **Network** | Can operate offline; needs 2G+ for sync |

### 4.2.5 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────┘

  Client Devices (Smartphones / Tablets)
        │ HTTPS
        ▼
  ┌─────────────────┐         ┌─────────────────┐
  │  CDN / Vercel   │         │  Docker Host    │
  │  (Frontend PWA) │         │  (Backend API)  │
  │  Next.js Build  │         │  Node.js 20     │
  │  Static Assets  │         │  Port 4000      │
  └─────────────────┘         └────────┬────────┘
                                       │
                   ┌───────────────────┼───────────────────┐
                   ▼                   ▼                   ▼
         ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
         │   Supabase   │   │    Redis     │   │  Cloudinary  │
         │  PostgreSQL  │   │  (Upstash)   │   │    (CDN)     │
         │  + PostGIS   │   │  Sessions    │   │   Images     │
         └──────────────┘   └──────────────┘   └──────────────┘
```

---

# CHAPTER V — EXPECTED OUTCOMES (with GUI)

## 5.1 Login Page

The login page presents a clean, responsive form with the VMC logo, email/password fields, and a "Forgot Password?" link. Upon successful authentication, the system redirects to the role-appropriate dashboard.

**Expected Behavior:**
- Email and password validation before submission
- Rate limiting: locked after 5 failed attempts in 15 minutes
- JWT token stored in httpOnly cookie upon success
- Redirect to `/field-worker/`, `/ward-engineer/`, `/zone-officer/`, or `/admin/` based on role

**GUI Description:**

```
┌────────────────────────────────────────┐
│           VMC CiviSense                │
│        [VMC Logo / Icon]               │
│                                        │
│  Email                                 │
│  ┌──────────────────────────────────┐  │
│  │ user@vmc.gov.in                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Password                              │
│  ┌──────────────────────────────────┐  │
│  │ ••••••••                         │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [Forgot Password?]                    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │            LOGIN                 │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 5.2 Field Worker — Issue Reporting Screen

The primary screen for field workers. It presents a form to capture issue details, GPS location (auto-fetched), category selection, AI photo analysis, and priority.

**Expected Behavior:**
- GPS coordinates automatically populated from browser Geolocation API
- Photo upload triggers optional AI category suggestion (TensorFlow.js + Google Vision)
- If offline: data stored in IndexedDB; sync icon shows pending count
- Upon submission: unique ticket number generated (e.g., `VMC-2026-000001`)
- Ward automatically detected from GPS coordinates via PostGIS

**GUI Description:**

```
┌────────────────────────────────────────┐
│  ← Report New Issue         [⚡ Offline]│
│────────────────────────────────────────│
│  📷 Upload Photo                       │
│  ┌──────────────────────────────────┐  │
│  │  [+ Add Photo]  [Camera Icon]   │  │
│  └──────────────────────────────────┘  │
│  🤖 AI Suggestion: "Pothole" (87%)     │
│                                        │
│  Category*                             │
│  ┌──────────────────────────────────┐  │
│  │ ▼ Road / Pothole                 │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Description                           │
│  ┌──────────────────────────────────┐  │
│  │ Large pothole near main junction │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Priority                              │
│  ○ LOW  ● MEDIUM  ○ HIGH  ○ CRITICAL  │
│                                        │
│  📍 Location (Auto-detected)           │
│  Lat: 22.3072  Lng: 73.1812            │
│  Ward: Ward 7 — Fatehgunj              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │         SUBMIT ISSUE             │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 5.3 Field Worker — My Issues Dashboard

Shows all issues submitted by the logged-in field worker, filterable by status and date.

**GUI Description:**

```
┌────────────────────────────────────────┐
│  My Issues             [+ New Issue]   │
│────────────────────────────────────────│
│  Filter: [All ▼]   Sort: [Newest ▼]   │
│────────────────────────────────────────│
│  ┌──────────────────────────────────┐  │
│  │ VMC-2026-000042                  │  │
│  │ 🔴 HIGH • Road / Pothole         │  │
│  │ Ward 7 • Fatehgunj               │  │
│  │ Status: IN_PROGRESS              │  │
│  │ Submitted: 14 Mar 2026           │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ VMC-2026-000039                  │  │
│  │ 🟡 MEDIUM • Street Light         │  │
│  │ Ward 4 • Sayajigunj              │  │
│  │ Status: ✅ VERIFIED              │  │
│  │ Submitted: 12 Mar 2026           │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 5.4 Ward Engineer — Assigned Issues Dashboard

Shows all issues assigned to the engineer's ward, with quick-action buttons.

**GUI Description:**

```
┌────────────────────────────────────────┐
│  Assigned Issues          Ward 7       │
│────────────────────────────────────────│
│  📊 Stats                              │
│  Open: 12  In-Progress: 5  Resolved: 8 │
│  SLA Compliance: 91%                   │
│────────────────────────────────────────│
│  ⚠️  SLA Breach Risk (2 issues)       │
│  ┌──────────────────────────────────┐  │
│  │ VMC-2026-000042 • 🔴 HIGH        │  │
│  │ Road Pothole — Fatehgunj         │  │
│  │ SLA: 6 hrs remaining             │  │
│  │ [Start Work] [Navigate 🗺️]      │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ VMC-2026-000040 • 🟡 MEDIUM      │  │
│  │ Drainage Block — Alkapuri        │  │
│  │ SLA: 2 hrs remaining             │  │
│  │ [Start Work] [Navigate 🗺️]      │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 5.5 Ward Engineer — Issue Resolution Screen

When an issue is resolved, the engineer uploads after-repair photos and marks it as resolved.

**GUI Description:**

```
┌────────────────────────────────────────┐
│  ← Issue VMC-2026-000042               │
│────────────────────────────────────────│
│  Road Pothole  •  🔴 HIGH              │
│  Ward 7 — Fatehgunj                    │
│  SLA: 14 Mar 2026, 18:00              │
│────────────────────────────────────────│
│  BEFORE Photo                          │
│  [📷 Photo Thumbnail]                  │
│                                        │
│  Upload After-Repair Photo *           │
│  ┌──────────────────────────────────┐  │
│  │  [+ Upload After Photo]          │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Comment (optional)                    │
│  ┌──────────────────────────────────┐  │
│  │ Pothole filled with fresh asphalt│  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │       MARK AS RESOLVED           │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 5.6 Zone Officer — Multi-Ward Monitoring Dashboard

Provides a bird's-eye view of all wards in the zone.

**GUI Description:**

```
┌────────────────────────────────────────┐
│  Zone Dashboard       North Zone       │
│────────────────────────────────────────│
│  📊 Zone Summary                       │
│  Total Issues: 87  Resolved: 54        │
│  SLA Compliance: 88%   Breached: 6     │
│────────────────────────────────────────│
│  Ward Performance                      │
│  ┌──────────────────────────────────┐  │
│  │ Ward 7 — Fatehgunj               │  │
│  │ Open: 12  Resolved: 18           │  │
│  │ Compliance: 92% ████████░░       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Ward 4 — Sayajigunj              │  │
│  │ Open: 8   Resolved: 21           │  │
│  │ Compliance: 87% ███████░░░       │  │
│  └──────────────────────────────────┘  │
│────────────────────────────────────────│
│  Pending Verifications (5)             │
│  [VMC-000039] [VMC-000035] ...         │
└────────────────────────────────────────┘
```

---

## 5.7 Admin Panel — User Management

Allows the super admin to register, activate, deactivate, and reassign users.

**GUI Description:**

```
┌────────────────────────────────────────┐
│  User Management        [+ Add User]   │
│────────────────────────────────────────│
│  Search: [____________]  Role: [All ▼] │
│────────────────────────────────────────│
│  Name          │ Role     │ Status     │
│────────────────│──────────│────────────│
│ Ramesh Patel   │ Eng.(W7) │ ✅ Active  │
│ Priya Sharma   │ Officer  │ ✅ Active  │
│ Ankit Desai    │ Field W. │ ⛔ Inactive│
│────────────────────────────────────────│
│  [View] [Edit] [Deactivate/Activate]   │
└────────────────────────────────────────┘
```

---

## 5.8 Expected System Performance Outcomes

| Metric | Expected Value |
|--------|---------------|
| **API Response Time (p95)** | < 300ms |
| **Issue submission (online)** | < 2 seconds |
| **Offline queue sync time** | < 5 seconds per issue on 3G |
| **PostGIS ward detection** | < 50ms |
| **Cloudinary upload time** | < 3 seconds for 2MB image |
| **PWA install prompt** | First visit after 30 seconds |
| **AI category suggestion** | < 1 second (TensorFlow.js) |
| **System uptime target** | 99.5% |
| **Concurrent users (MVP)** | Up to 500 |

---

# CHAPTER VI — CONCLUSION & FUTURE SCOPE

## 6.1 Conclusion

The **VMC Civic Issue Monitoring System (CiviSense)** successfully demonstrates that a modern, full-stack web application can solve real civic infrastructure management challenges using accessible, open-source technologies.

### Key Achievements

| Achievement | Technology Used |
|-------------|----------------|
| **Offline-first field reporting** | PWA, Dexie IndexedDB, Workbox Service Worker |
| **Automatic ward detection** (zero manual input) | PostGIS Point-in-Polygon geo-fencing |
| **Role-based governance** (4 user roles) | JWT + RBAC middleware |
| **Full issue lifecycle with SLA tracking** | Prisma ORM, PostgreSQL |
| **AI-assisted categorization** | TensorFlow.js, Google Cloud Vision AI |
| **Secure authentication with OTP** | bcryptjs, Nodemailer, Redis rate limiting |
| **Cloud image storage with CDN** | Cloudinary |
| **Gamification for motivation** | Points, badges, streaks system |
| **Containerized deployment** | Docker multi-stage build |
| **Production-grade security** | Rate limiting, Zod validation, CORS, audit logs |

### Summary

The project demonstrates how traditional government systems can be digitized with a focus on:
- **Real field constraints** (offline-first, low-bandwidth optimization)
- **Automation** (auto ward assignment, AI categorization, SLA calculation)
- **Accountability** (full audit trail, issue history, gamification)
- **Scalability** (Docker, Prisma migrations, Redis caching, spatial indexing)

The system is immediately deployable for any municipality with PostgreSQL+PostGIS support by simply updating the GeoJSON ward boundary data. All 18 database models, 4 role dashboards, and complete API have been implemented as a working MVP.

---

## 6.2 Future Work

The following enhancements are planned for future development:

### 6.2.1 Short-term Enhancements (0–6 Months)

| Enhancement | Description |
|-------------|-------------|
| **Real-time notifications** | WebSocket or Server-Sent Events for live status updates |
| **Push notifications** | Web Push API for background alerts to field workers |
| **Citizen portal** | Public-facing issue tracking dashboard (view-only) |
| **Advanced analytics** | Charts for issue trends, ward performance, SLA analysis |
| **Bulk issue import** | CSV/Excel import for legacy data migration |
| **Multi-language support** | Full Gujarati/Hindi localization using i18n framework |

### 6.2.2 Medium-term Enhancements (6–18 Months)

| Enhancement | Description |
|-------------|-------------|
| **Native mobile apps** | React Native apps for Android/iOS with better camera access |
| **Real-time map view** | Live map showing all open issues in the city |
| **Predictive maintenance** | ML model predicting areas prone to recurring issues |
| **Citizen complaint portal** | Allow citizens to report and track issues independently |
| **SMS notifications** | Twilio integration for non-smartphone users |
| **IGRS integration** | Connect to state-level integrated grievance redressal system |
| **OCR for manual forms** | Digitize existing paper forms using Google Vision OCR |

### 6.2.3 Long-term Vision (18+ Months)

| Enhancement | Description |
|-------------|-------------|
| **IoT sensor integration** | Automated issue detection from smart city sensors |
| **Drone survey integration** | Aerial imagery for large-scale infrastructure assessment |
| **National Smart City API** | Integration with Smart City Mission data platform |
| **AI auto-resolution scoring** | ML model predicting resolution time and bottlenecks |
| **Blockchain audit trail** | Immutable record of issue history on a public ledger |

---

# CHAPTER VII — REFERENCES

1. **Open311 Specification** — GeoReport v2. *Open311.org*. Retrieved from https://open311.org/learn/

2. **PostGIS Documentation** — *PostGIS 3.x Reference Manual*. Refractions Research Inc. Retrieved from https://postgis.net/docs/

3. **Prisma ORM Documentation** — *Prisma Docs*. Prisma Data Inc. Retrieved from https://www.prisma.io/docs/

4. **Next.js Documentation** — *Next.js 15 App Router*. Vercel Inc. Retrieved from https://nextjs.org/docs

5. **TensorFlow.js Guide** — *Machine Learning in the Browser*. Google. Retrieved from https://www.tensorflow.org/js

6. **Google Cloud Vision API** — *Vision AI Documentation*. Google Cloud. Retrieved from https://cloud.google.com/vision/docs

7. **Workbox Documentation** — *Progressive Web App Caching Strategies*. Google Chrome Team. Retrieved from https://developer.chrome.com/docs/workbox

8. **Dexie.js Documentation** — *A Minimalistic Wrapper for IndexedDB*. Retrieved from https://dexie.org/

9. **Redis Documentation** — *Redis 7.x Command Reference*. Redis Ltd. Retrieved from https://redis.io/docs

10. **JWT Standard** — Jones, M., Bradley, J., Sakimura, N. (2015). *JSON Web Token (JWT)*. IETF RFC 7519.

11. **W3C Geolocation API** — *Geolocation API Specification*. W3C. Retrieved from https://www.w3.org/TR/geolocation/

12. **GeoJSON Specification** — Butler, H., et al. (2016). *The GeoJSON Format*. IETF RFC 7946.

13. **Cloudinary Documentation** — *Media Management Platform*. Cloudinary Ltd. Retrieved from https://cloudinary.com/documentation

14. **bcrypt Algorithm** — Provos, N., & Mazières, D. (1999). *A Future-Adaptable Password Scheme*. USENIX Annual Technical Conference.

15. **Docker Documentation** — *Containerization Best Practices*. Docker Inc. Retrieved from https://docs.docker.com/

16. **Smart Cities Mission, India** — Ministry of Housing and Urban Affairs. (2015). *Smart Cities Mission Guidelines*. Government of India.

17. **FixMyStreet** — MySociety. *Open Source Civic Reporting Platform*. Retrieved from https://fixmystreet.com/

18. **SeeClickFix** — *Civic Engagement Platform*. Retrieved from https://seeclickfix.com/

19. **Redux Toolkit Documentation** — *RTK Official Docs*. Retrieved from https://redux-toolkit.js.org/

20. **Zod Schema Validation** — *Zod TypeScript-first Schema Validation*. Retrieved from https://zod.dev/

---

*End of Report*

---

**Declaration**

I hereby declare that this minor project report titled **"VMC Civic Issue Monitoring System (CiviSense)"** is submitted as partial fulfilment of the requirements for the degree of Bachelor of Technology. This work is original and has not been submitted elsewhere for any other degree or diploma.

| | |
|---|---|
| **Student Name:** | Shivam Darekar |
| **Signature:** | _________________ |
| **Date:** | March 2026 |

---

**Certificate**

This is to certify that the minor project titled **"VMC Civic Issue Monitoring System (CiviSense)"** has been completed satisfactorily by **Shivam Darekar** in partial fulfilment of the requirements for the award of the degree of Bachelor of Technology.

| | |
|---|---|
| **Guide:** | *[Faculty Name]* |
| **Signature:** | _________________ |
| **Date:** | March 2026 |
| **Head of Department:** | *[HOD Name]* |
| **Institution:** | *[College Name]* |
