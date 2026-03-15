# CiviSense — VMC Civic Issue Monitoring System

> A geo-fenced, offline-first digital platform that enables Vadodara Municipal Corporation (VMC) field staff to proactively report, track, and resolve civic issues with speed, accuracy, and full accountability.

---

## 📑 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Solution Overview](#-solution-overview)
3. [How It Works](#️-how-it-works)
4. [Key Features](#-key-features)
5. [Technology Stack](#️-technology-stack)
6. [Architecture Overview](#-architecture-overview)
7. [Database Schema](#-database-schema)
8. [API Reference](#-api-reference)
9. [User Roles & Workflows](#-user-roles--workflows)
10. [Offline-First & PWA](#-offline-first--pwa)
11. [AI-assisted Categorization](#-ai-assisted-categorization)
12. [Geo-Fencing & Location](#️-geo-fencing--location)
13. [Project Structure](#-project-structure)
14. [Local Setup Guide](#-local-setup-guide)
15. [Environment Variables](#-environment-variables)
16. [Docker Deployment](#-docker-deployment)

---

## 🎯 Problem Statement

Traditional civic issue reporting in Indian municipalities faces systemic challenges:

| Challenge | Impact |
|-----------|--------|
| Incorrect ward assignment due to manual location entry | Issues reach the wrong engineer, causing delays |
| Paper-based and phone-call reporting | No digital trail; easy to lose or ignore |
| No offline support for field staff | Reports are delayed or lost in low-connectivity areas |
| No photo evidence workflow | Disputes over whether work was actually done |
| Limited transparency | Public trust erodes when issues go unresolved silently |
| No SLA enforcement | No accountability mechanism for engineers |

These gaps result in slow response times, unresolved complaints, and reduced citizen trust in municipal governance.

---

## 💡 Solution Overview

**CiviSense** solves these challenges with a full-stack, mobile-first digital platform that:

- 📍 **Captures GPS coordinates automatically** — no manual pin-drop required
- 🗺️ **Geo-fences against ward boundaries** — ensures issues reach the right engineer instantly via PostGIS spatial queries
- 📶 **Works fully offline** — field workers can report issues without an internet connection; data syncs automatically when connectivity is restored
- 🤖 **Uses AI to suggest issue categories** — TensorFlow.js–based image analysis reduces mis-categorization
- 🔄 **Tracks the full issue lifecycle** — from OPEN through to VERIFIED, with SLA monitoring at every stage
- 📸 **Requires before/after photo evidence** — creates undeniable proof of resolution
- 👮 **Enforces role-based access** — each stakeholder sees only what they need to act on

---

## ⚙️ How It Works

### End-to-End Issue Flow

```
Field Worker          Backend                 Ward Engineer        Zone Officer
    │                    │                         │                   │
    │ 1. Open app        │                         │                   │
    │ 2. Capture GPS     │                         │                   │
    │ 3. Take photo  ────┼──► POST /issues         │                   │
    │                    │    • Upload to           │                   │
    │                    │      Cloudinary          │                   │
    │                    │    • PostGIS lookup  ────┼──► Auto-assign    │
    │                    │    • Set SLA deadline    │                   │
    │                    │    • Send email alert ───┼──► Notification   │
    │                    │                         │                   │
    │                    │                         │ 4. Review issue    │
    │                    │                         │ 5. Update status   │
    │                    │                         │ 6. Upload after    │
    │                    │                         │    photo ──────────┼──► RESOLVED
    │                    │                         │                   │
    │                    │                         │                   │ 7. Verify
    │                    │                         │                   │    resolution
    │                    │                         │                   │ 8. Close / Reopen
```

### Step-by-Step Breakdown

1. **Field Worker opens the CiviSense PWA** on their mobile device.
2. **Browser Geolocation API** captures the current GPS coordinates (latitude/longitude).
3. **Field worker selects a category** (e.g., Pothole, Drainage) and takes a before-photo. AI suggestions auto-populate the category field.
4. **POST /api/v1/issues** is called. The backend:
   - Validates input with Zod schema
   - Uploads the photo to **Cloudinary** and stores the URL
   - Runs a **PostGIS Point-in-Polygon query** against ward boundary polygons to identify the correct ward
   - Sets the **SLA target deadline** based on the category's SLA hours
   - Assigns the issue to the **ward engineer** for that ward's department
   - Creates an **IssueHistory** record and sends an **email notification** via Nodemailer
5. **Ward Engineer** logs in to their dashboard and sees the new issue in their queue.
6. **Ward Engineer** marks the issue IN_PROGRESS, does the work, and uploads an after-photo.
7. **Ward Engineer** marks the issue RESOLVED.
8. **Zone Officer** receives a notification, reviews the before/after photos, and either VERIFIES or REOPENs the issue.
9. All status changes are logged in **IssueHistory** with the actor's user ID and a timestamp, providing a full audit trail.

### Offline Flow

When the field worker has no internet:

1. Issue report is saved to **IndexedDB** (via Dexie.js) on the device.
2. A **Service Worker** registers a background sync task.
3. When connectivity is restored, the Service Worker automatically POSTs all pending issues to the backend.
4. The user sees a sync status indicator in the UI.

---

## 🚀 Key Features

### 📍 GPS-based Issue Reporting
- Automatic coordinate capture via the browser Geolocation API — no manual pin-dropping
- Coordinates are stored as `latitude` / `longitude` floats and used for spatial ward lookup
- Optional human-readable address field

### 🧠 AI-assisted Categorization
- **Frontend:** TensorFlow.js (`@tensorflow/tfjs` + `@tensorflow-models/mobilenet`) analyzes the uploaded photo
- **Backend:** Google Cloud Vision API (`@google-cloud/vision`) provides server-side image analysis
- Provides category suggestions (e.g., "pothole", "drainage") as AI tags stored in the `aiTags` field
- Acts as a decision-support layer — the field worker confirms or overrides the suggestion

### 🗺️ Automatic Ward Detection & Assignment
- Ward boundary polygons are stored as **PostGIS `geometry(Polygon, 4326)`** columns
- A Point-in-Polygon spatial query (`ST_Contains` / `ST_Within`) matches the GPS coordinates to the correct ward
- The ward's assigned engineer is automatically set as the issue assignee
- Auto-routing uses the issue category's `department` field for finer-grained assignment (e.g., ROAD, SEWAGE_DISPOSAL, WATER_WORKS)

### 🔐 Role-Based Access Control (RBAC)
- Four roles: `FIELD_WORKER`, `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`
- JWT-based authentication stored in HTTP-only cookies
- RBAC middleware (`requireRole`) enforces endpoint-level access restrictions
- Each role sees only its relevant dashboard and data scope

### 🔄 Issue Lifecycle with SLA Tracking

```
OPEN ──► ASSIGNED ──► IN_PROGRESS ──► RESOLVED ──► VERIFIED
                                           │
                                           └──► REOPENED ──► IN_PROGRESS ...
                                 REJECTED (at any stage by ZONE_OFFICER/ADMIN)
```

- **SLA target** is computed as `createdAt + category.slaHours`
- SLA breach indicators surface in the dashboard when a deadline is exceeded
- Timestamps are stored for every lifecycle transition: `assignedAt`, `resolvedAt`, `verifiedAt`, `closedAt`

### 📸 Before/After Photo Evidence
- Field workers upload **before** photos on issue creation
- Engineers upload **after** photos on resolution
- All images are stored on **Cloudinary** with `BEFORE` / `AFTER` media type tagging

### 🧭 One-Click Map Navigation
- Issue detail pages include a "Open in Map" button
- Deep-links to **Google Maps** or **MapMyIndia** with the issue coordinates pre-filled
- Engineers can start turn-by-turn navigation directly from the issue card

### 📱 Progressive Web App (PWA)
- Fully installable on Android/iOS home screens
- Works in standalone mode (no browser chrome)
- Caches app shell and critical assets via **Workbox** Service Workers
- Offline issue queue via **Dexie.js** (IndexedDB wrapper)
- Background sync when network connectivity is restored

### 💬 Comments & Audit Trail
- All users can post comments on issues
- Every status change, reassignment, and priority update is recorded in `IssueHistory`
- Full `AuditLog` table tracks logins, syncs, and sensitive admin actions with IP and user-agent

### 🏆 Gamification
- Field workers and engineers earn **points** for reporting and resolving issues
- Points, streaks, and SLA compliance scores are tracked in `UserGamification`
- **Badges** (e.g., "Monsoon Warrior") are awarded based on thresholds

### 🌐 Multi-Language Support
- Language selector component using `@iamtraction/google-translate`
- Designed for Gujarati and Hindi-speaking field staff

### ♿ Accessibility
- `AccessibilityPanel` component with text-to-speech via the Web Speech API
- `SpeakableText` UI component for screen-reader-friendly labels
- High-contrast and font-size options

### 🔒 Security
- **Rate limiting** (express-rate-limit): 1,000 req / 15 min per IP
- **bcryptjs** password hashing
- **OTP-based** password reset flow via email (6-digit, expiry-enforced, attempt-limited)
- **Zod** schema validation on all API inputs
- **Redis** session caching and token blacklisting (planned)
- CORS restricted to known frontend origin
- Non-root Docker user for production container hardening

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.x (App Router) | React framework, SSR/SSG, routing |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Type safety across the entire frontend |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **shadcn/ui + Radix UI** | latest | Accessible, unstyled component primitives |
| **Redux Toolkit** | 2.x | Global state management |
| **redux-persist** | 6.x | Persist Redux state across sessions |
| **react-hook-form + Zod** | 7.x / 4.x | Form management and validation |
| **Dexie.js** | 4.x | IndexedDB wrapper for offline storage |
| **@ducanh2912/next-pwa** | 10.x | PWA support (Service Worker + manifest) |
| **Workbox** | 7.x | Service Worker caching strategies |
| **TensorFlow.js** | 4.x | Client-side AI image analysis |
| **@teachablemachine/image** | 0.8.x | Custom teachable machine model integration |
| **Axios** | 1.x | HTTP client for API calls |
| **Sonner** | 2.x | Toast notification system |
| **Lucide React** | 0.5x | Icon library |
| **@iamtraction/google-translate** | 1.x | Multi-language translation support |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **Express.js** | 5.x | HTTP server framework |
| **TypeScript** | 5.x | Type-safe backend code |
| **Prisma ORM** | 7.x | Database schema, migrations, and queries |
| **PostgreSQL** | 14+ | Primary relational database |
| **PostGIS** | 3.x | Geospatial extension for ward boundary queries |
| **Redis** | 4.x | Session cache, token blacklist, rate-limit store |
| **Zod** | 4.x | Request schema validation |
| **jsonwebtoken** | 9.x | JWT authentication tokens |
| **bcryptjs** | 2.x | Password hashing |
| **Nodemailer** | 7.x | SMTP email delivery (OTP, notifications) |
| **Cloudinary SDK** | 2.x | Cloud image upload and transformation |
| **@google-cloud/vision** | 5.x | Server-side AI image analysis |
| **Multer** | 2.x | Multipart file upload handling |
| **express-rate-limit** | 7.x | API rate limiting |
| **morgan** | 1.x | HTTP request logging |
| **compression** | 1.x | Gzip/Brotli response compression |
| **cookie-parser** | 1.x | HTTP cookie parsing |

### Infrastructure & Services

| Service | Purpose |
|---------|---------|
| **Cloudinary** | Persistent image storage (before/after photos) |
| **Supabase / PostgreSQL + PostGIS** | Managed database with spatial extensions |
| **Redis** | Caching, session management, background jobs |
| **Google Cloud Vision** | Server-side image label and tag detection |
| **SMTP (Gmail/Outlook)** | Email delivery for OTPs and notifications |
| **Docker** | Containerised production deployment |
| **Google Maps / MapMyIndia** | In-app navigation deep-links |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js PWA)                   │
│                                                             │
│  ┌─────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐  │
│  │  Field  │  │    Ward      │  │   Zone   │  │ Admin  │  │
│  │ Worker  │  │  Engineer    │  │ Officer  │  │ Panel  │  │
│  └────┬────┘  └──────┬───────┘  └────┬─────┘  └───┬────┘  │
│       │               │               │             │       │
│  ┌────▼───────────────▼───────────────▼─────────────▼────┐ │
│  │            Redux Store + redux-persist                 │ │
│  └─────────────────────────┬──────────────────────────────┘ │
│                             │  Axios                        │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │  Service Worker (Workbox)  │  IndexedDB (Dexie.js)  │   │
│  │  • Cache-first assets      │  • Offline issue queue │   │
│  │  • Background sync         │  • Pending uploads     │   │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST
┌──────────────────────────────▼──────────────────────────────┐
│                     BACKEND (Express.js)                     │
│                                                             │
│  Rate Limiter → CORS → Auth Middleware → RBAC Middleware    │
│                                                             │
│  ┌───────────┐  ┌──────────┐  ┌────────┐  ┌───────────┐   │
│  │  /auth    │  │ /issues  │  │/users  │  │  /admin   │   │
│  └─────┬─────┘  └────┬─────┘  └───┬────┘  └─────┬─────┘   │
│        │              │             │              │         │
│  ┌─────▼──────────────▼─────────────▼──────────────▼─────┐ │
│  │                   Service Layer                        │ │
│  │  Auth Service │ Issue Service │ User Service │ Admin   │ │
│  └─────────────────────────┬──────────────────────────────┘ │
│                             │                               │
│  ┌──────────────────────────▼──────────────────────────┐   │
│  │                    Prisma ORM                        │   │
│  └──────────────────────────┬──────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│ PostgreSQL  │       │    Redis     │       │  Cloudinary   │
│  + PostGIS  │       │  (Cache /    │       │  (Images)     │
│             │       │   Sessions)  │       │               │
└─────────────┘       └──────────────┘       └───────────────┘
```

---

## 🗃 Database Schema

The Prisma schema defines the following key models:

### Core Models

| Model | Description |
|-------|-------------|
| `User` | All system users with role, ward/zone scope, and gamification link |
| `Session` | JWT token tracking with expiry |
| `PasswordReset` | OTP-based password reset with attempt limiting |
| `Zone` | Municipal zone (collection of wards) |
| `Ward` | Individual ward with PostGIS polygon boundary |
| `IssueCategory` | Issue type with SLA hours, department routing, and dynamic form schema |
| `Issue` | Core issue record with GPS, status, SLA, media, comments, and history |
| `IssueMedia` | Before/After photos linked to an issue |
| `Comment` | User comments on issues |
| `IssueHistory` | Immutable log of every status/assignment change |
| `AuditLog` | System-wide activity log (login, sync, export, etc.) |
| `UserGamification` | Points, streaks, resolved count per user |
| `Badge` / `BadgeAssignment` | Gamification badge catalogue and user assignments |
| `SystemConfig` | Key-value store for runtime configuration |

### Issue Status Lifecycle

```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED
                                    ↑
                               REOPENED ←──────┘
                  REJECTED (at any stage by ZONE_OFFICER or SUPER_ADMIN)
```

### Priority Levels

`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

### VMC Departments (for auto-routing)

`ROAD` | `STORM_WATER_DRAINAGE` | `SEWAGE_DISPOSAL` | `WATER_WORKS` | `STREET_LIGHT` | `BRIDGE_CELL` | `SOLID_WASTE_MANAGEMENT` | `HEALTH` | `TOWN_PLANNING` | `PARKS_GARDENS` | `ENCROACHMENT` | `FIRE` | `ELECTRICAL`

---

## 📡 API Reference

Base URL: `http://localhost:4000/api/v1`

All routes (except health check) require a valid `Authorization: Bearer <token>` header or an HTTP-only session cookie.

### Authentication — `/auth`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | All | Login with email + password |
| `POST` | `/auth/logout` | All | Invalidate session |
| `POST` | `/auth/forgot-password` | All | Send OTP to registered email |
| `POST` | `/auth/reset-password` | All | Reset password using OTP |
| `GET`  | `/auth/me` | All | Get current authenticated user |

### Issues — `/issues`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`  | `/issues/categories` | All | List issue categories |
| `GET`  | `/issues/stats` | All | Issue statistics (filterable by ward/zone) |
| `POST` | `/issues` | FIELD_WORKER | Create a new issue |
| `GET`  | `/issues` | All | List issues (role-scoped) |
| `GET`  | `/issues/:issueId` | All | Get issue details |
| `POST` | `/issues/:issueId/after-media` | FIELD_WORKER, WARD_ENGINEER | Upload after-resolution photo |
| `PATCH`| `/issues/:issueId/status` | WARD_ENGINEER, ZONE_OFFICER, SUPER_ADMIN | Update issue status |
| `POST` | `/issues/:issueId/comments` | All | Add a comment |
| `PATCH`| `/issues/:issueId/reassign` | WARD_ENGINEER, ZONE_OFFICER, SUPER_ADMIN | Reassign issue |
| `PATCH`| `/issues/:issueId/verify` | ZONE_OFFICER, SUPER_ADMIN | Verify or reject resolution |
| `PATCH`| `/issues/:issueId/reopen` | ZONE_OFFICER, SUPER_ADMIN | Reopen verified issue |
| `POST` | `/issues/upload/before` | All | Upload before-image to Cloudinary |
| `POST` | `/issues/upload/after` | FIELD_WORKER, WARD_ENGINEER | Upload after-image to Cloudinary |
| `DELETE`| `/issues/upload/delete` | All | Delete image from Cloudinary |
| `POST` | `/issues/analyze-image` | All | AI image analysis (Google Vision) |

### Users — `/users`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`  | `/users/profile` | All | Get own profile |
| `PATCH`| `/users/profile` | All | Update own profile |
| `PATCH`| `/users/change-password` | All | Change password |

### Admin — `/admin`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET`  | `/admin/users` | SUPER_ADMIN | List all users |
| `POST` | `/admin/users` | SUPER_ADMIN | Create a user |
| `PATCH`| `/admin/users/:userId` | SUPER_ADMIN | Update user details |
| `PATCH`| `/admin/users/:userId/deactivate` | SUPER_ADMIN | Deactivate a user |
| `GET`  | `/admin/zones` | SUPER_ADMIN, ZONE_OFFICER | List zones |
| `GET`  | `/admin/wards` | SUPER_ADMIN, ZONE_OFFICER | List wards |
| `GET`  | `/admin/stats` | SUPER_ADMIN | System-wide statistics |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Database + Redis health check with response times |

---

## 👥 User Roles & Workflows

### 🧹 Field Worker
**Scope:** Assigned to a specific ward

**Capabilities:**
- Report new civic issues with GPS location and before-photos
- View their own reported issues and history
- Work fully offline; reports sync automatically when online
- Upload after-photos when helping resolve an issue

**Dashboard Pages:** `/field-worker`, `/field-worker/my-issues`, `/field-worker/resolved-issues`, `/field-worker/activity`, `/field-worker/profile`

---

### 🛠️ Ward Engineer
**Scope:** Assigned to a single ward + department

**Capabilities:**
- View all issues assigned to their ward and department
- Update status (ASSIGNED → IN_PROGRESS → RESOLVED)
- Upload before/after photographic evidence
- Reassign issues to other engineers within the ward
- Post comments and update issue metadata

**Dashboard Pages:** `/ward-engineer`, `/ward-engineer/assigned-issues`, `/ward-engineer/activity`, `/ward-engineer/profile`

---

### 🧾 Zone Officer
**Scope:** Manages all wards within their zone

**Capabilities:**
- Monitor issue queues across all wards in the zone
- Verify resolved issues (RESOLVED → VERIFIED)
- Reopen issues that were inadequately resolved (VERIFIED → REOPENED)
- View per-ward SLA compliance metrics
- Reassign issues across wards

**Dashboard Pages:** `/zone-officer`, `/zone-officer/ward/[wardId]`, `/zone-officer/profile`

---

### ⚙️ Super Admin
**Scope:** Full system access

**Capabilities:**
- Full user management (create, edit, deactivate, assign roles)
- Manage zone and ward configurations
- Reassign issues during staff changes
- View system-wide analytics and audit logs
- Configure system settings

**Dashboard Pages:** `/admin`, `/admin/user-management`, `/admin/zones/[zoneId]`, `/admin/zones/[zoneId]/wards/[wardId]`

---

## 📱 Offline-First & PWA

CiviSense is architected as an **offline-first** Progressive Web App to handle real field conditions where mobile data is unreliable.

### How Offline Works

| Layer | Technology | Role |
|-------|-----------|------|
| **App Shell Caching** | Workbox (StaleWhileRevalidate) | Core UI assets cached on first load |
| **API Response Caching** | Workbox (NetworkFirst) | Recent issue lists cached for offline viewing |
| **Offline Issue Queue** | Dexie.js (IndexedDB) | New issues stored locally when offline |
| **Background Sync** | Service Worker Background Sync API | Auto-syncs queued issues when back online |
| **Sync Status UI** | `SyncInitializer` + `OfflineStatus` components | Shows sync state to user |

### Installation

The `PWAInstallPrompt` component detects the browser's `beforeinstallprompt` event and shows a native-style install banner, allowing users to add CiviSense to their home screen.

---

## 🤖 AI-assisted Categorization

CiviSense uses a two-layer AI approach for issue categorization:

### Client-Side (Frontend)
- **Library:** `@tensorflow/tfjs` + `@tensorflow-models/mobilenet` + `@teachablemachine/image`
- **Component:** `AIImageScanner` in `frontend/components/field-worker/`
- **Flow:** When a photo is selected, TensorFlow.js runs inference in the browser and returns category predictions
- **UX:** Top predictions appear as quick-select chips; field worker confirms or changes the suggestion
- **Advantage:** Works offline — no server round-trip required for AI suggestions

### Server-Side (Backend)
- **Library:** `@google-cloud/vision`
- **Service:** `backend/src/services/vision/vision.service.ts`
- **Endpoint:** `POST /api/v1/issues/analyze-image`
- **Output:** Label annotations stored as `aiTags` on the issue record
- **Use Case:** Higher-accuracy analysis for issue audit and reporting

---

## 🗺️ Geo-Fencing & Location

### Data Source
- Ward boundary polygons are stored as a GeoJSON file (`backend/data/ward-boundaries.geojson`)
- On database seed, polygons are imported as PostGIS `geometry(Polygon, 4326)` columns in the `wards` table
- A **GiST spatial index** on the `boundary` column ensures fast polygon lookup

### Point-in-Polygon Query
When an issue is created, the backend runs:

```sql
SELECT id, ward_number, name, zone_id
FROM wards
WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($longitude, $latitude), 4326))
LIMIT 1;
```

This returns the correct ward without any manual input from the field worker.

### Map Navigation
- The frontend constructs deep-link URLs using the issue's coordinates
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
- **MapMyIndia:** `https://maps.mapmyindia.com/{eloc}` (when eLoc is available)
- No paid map SDK is required — navigation is delegated to the user's preferred installed map app

---

## 📁 Project Structure

```
Civic-issue/
├── backend/
│   ├── data/
│   │   └── ward-boundaries.geojson        # VMC ward polygon data
│   ├── prisma/
│   │   ├── schema.prisma                  # Database schema & models
│   │   ├── seed.ts                        # Initial data seed (wards, categories, users)
│   │   └── seed2.ts                       # Additional seed data
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts                   # Environment config loader
│   │   ├── lib/
│   │   │   ├── prisma.ts                  # Prisma client singleton
│   │   │   ├── redis.ts                   # Redis client
│   │   │   └── cache.ts                   # Caching helpers
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts         # JWT verification
│   │   │   ├── rbac.middleware.ts         # Role-based access control
│   │   │   ├── validation.middleware.ts   # Zod schema validation
│   │   │   └── error.middleware.ts        # Global error handler
│   │   ├── modules/
│   │   │   ├── auth/                      # Login, logout, OTP reset
│   │   │   ├── issues/                    # CRUD, upload, AI, SLA
│   │   │   ├── users/                     # Profile, password change
│   │   │   └── admin/                     # User & ward management
│   │   ├── services/
│   │   │   ├── email/                     # Nodemailer + HTML templates
│   │   │   └── vision/                    # Google Cloud Vision
│   │   ├── utils/
│   │   │   ├── cloudinary.ts              # Cloudinary upload helpers
│   │   │   ├── multer.ts                  # Multipart upload config
│   │   │   ├── sla.ts                     # SLA deadline calculator
│   │   │   ├── tokens.ts                  # JWT sign/verify helpers
│   │   │   ├── apiError.ts                # Structured error class
│   │   │   ├── apiResponse.ts             # Structured response wrapper
│   │   │   └── asyncHandler.ts            # Express async error wrapper
│   │   ├── app.ts                         # Express app setup
│   │   └── index.ts                       # Server entry point
│   ├── .env.example                       # Backend environment template
│   ├── Dockerfile                         # Multi-stage production Docker image
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx             # Login page
│   │   │   └── forgot-password/page.tsx   # OTP password reset
│   │   ├── field-worker/                  # Field worker dashboard & pages
│   │   ├── ward-engineer/                 # Ward engineer dashboard & pages
│   │   ├── zone-officer/                  # Zone officer dashboard & pages
│   │   ├── admin/                         # Admin panel pages
│   │   ├── offline/page.tsx               # Offline fallback page
│   │   ├── layout.tsx                     # Root layout with providers
│   │   └── page.tsx                       # Landing page
│   ├── components/
│   │   ├── ui/                            # Reusable UI primitives (shadcn/ui)
│   │   ├── auth/                          # Header, Footer, OTP input
│   │   ├── field-worker/                  # Issue form, AI scanner, offline dialog
│   │   ├── ward/                          # Ward engineer components
│   │   ├── zone/                          # Zone officer components
│   │   ├── admin/                         # Admin user/issue management
│   │   ├── shared/                        # Activity log, stats, map button
│   │   ├── Home/                          # Landing page components
│   │   ├── AccessibilityPanel.tsx         # Text-to-speech & display settings
│   │   ├── LanguageSelector.tsx           # Multi-language switcher
│   │   ├── PWAInstallPrompt.tsx           # Install-to-home-screen banner
│   │   └── SyncInitializer.tsx            # Background sync manager
│   ├── hooks/                             # Custom React hooks
│   ├── redux/                             # Redux store, slices, selectors
│   ├── lib/                               # API client, IndexedDB helpers
│   ├── public/
│   │   ├── manifest.json                  # PWA manifest
│   │   └── workbox-*.js                   # Generated Service Worker assets
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚦 Local Setup Guide

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Use nvm for version management |
| PostgreSQL | 14+ | Must have PostGIS extension |
| Redis | 6+ | Optional for MVP; required for production |
| Git | any | |

### 1. Clone the Repository

```bash
git clone https://github.com/shivamdarekar/Civic-issue.git
cd Civic-issue
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL, JWT secret, Cloudinary keys, etc.

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed initial data (zones, wards, categories, demo users)
npx prisma db seed

# Start development server (auto-reloads on save)
npm run dev
```

The backend API is now running at `http://localhost:4000`.

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment (API base URL, etc.)
# Create a .env.local file:
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1" > .env.local

# Start development server
npm run dev
```

The frontend is now running at `http://localhost:3000`.

### 4. Enable PostGIS

If PostGIS is not already enabled in your database, run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
# ============= DATABASE =============
DATABASE_URL="postgresql://user:password@localhost:5432/civic_issues"
DIRECT_URL="postgresql://user:password@localhost:5432/civic_issues"

# ============= SERVER =============
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# ============= JWT =============
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# ============= EMAIL (SMTP) =============
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password        # Gmail App Password, not regular password
SMTP_FROM="VMC Civic Issues <noreply@vmc.gov.in>"

# ============= CLOUDINARY =============
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============= REDIS =============
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_USE_TLS=false

# ============= GOOGLE CLOUD VISION =============
GOOGLE_VISION_KEY_PATH=./google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 🐳 Docker Deployment

The backend includes a multi-stage `Dockerfile` that builds a lean production image with a non-root user.

```bash
# Build the image
docker build -t civicsense-backend ./backend

# Run the container
docker run -p 4000:5000 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  -e CLOUDINARY_CLOUD_NAME="..." \
  civicsense-backend
```

> **Note:** Redis, advanced AI pipelines, and production map SDK integrations (MapMyIndia Enterprise) are planned features beyond the current MVP release.
