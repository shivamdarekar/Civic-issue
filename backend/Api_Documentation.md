
# VMC Civic Issue Monitoring System — API Documentation

**Stack:** Node.js (Express) + TypeScript, Prisma ORM (PostgreSQL + PostGIS), Zod validation, JWT auth, RBAC

**API Style:** REST (JSON)

**Current API Base (mounted in app):**
- `/api/v1/auth`
- `/api/v1/issues`
- `/api/v1/admin` (exists in code; included where relevant)

> Note: The repository contains `geo`, `sync`, and `users` module folders, but their `*.routes.ts` / controller / service files are currently empty and **not mounted** in `src/app.ts`. This documentation is strictly derived from the runtime routes that exist today. Where a module is not implemented, this document states that explicitly and points to the actual implemented APIs.

---

## Table of Contents

- [Conventions](#conventions)
- [Health Endpoints](#health-endpoints)
- [Auth Module](#auth-module)
- [Issues Module](#issues-module)
- [Users Module](#users-module)
- [Geo Module](#geo-module)
- [Sync Module](#sync-module)
- [Authentication Flow](#authentication-flow)
- [Role Matrix](#role-matrix)
- [Error Handling Strategy](#error-handling-strategy)
- [API Response Standard](#api-response-standard)

---

## Conventions

### Content Types
- Request `Content-Type`: `application/json`
- Response `Content-Type`: `application/json`

### Authentication Transport
The backend supports **either**:
- **Authorization header:** `Authorization: Bearer <jwt>`
- **Cookie:** `token=<jwt>`

JWT is verified in `src/middlewares/auth.middleware.ts`.

Important implementation note:
- The code reads `req.cookies?.token`, which requires cookie parsing middleware (e.g., `cookie-parser`) to be installed and mounted. The current `src/app.ts` does **not** register a cookie parser. In practice, **Authorization header** is the reliable method unless cookie parsing is added.

### Roles (RBAC)
RBAC is enforced via `requireRole([...])` from `src/middlewares/rbac.middleware.ts`.

Defined roles (Prisma enum `UserRole`):
- `SUPER_ADMIN`
- `ZONE_OFFICER`
- `WARD_ENGINEER`
- `FIELD_WORKER`
- `CITIZEN`

### IDs
- All IDs (userId, issueId, zoneId, wardId, categoryId) are UUIDs.

### Validation
Zod validation is applied via `validateRequest(schema, source)`.

Sources:
- `body` validates `req.body`.
- `query` validates `req.query` (uses `Object.assign(req.query, validated)` and supports coercion via `z.coerce`).
- `params` validates `req.params`.
- `all` validates `{...params, ...query, ...body}` and (currently) assigns the validated object to `req.body`.

Validation failures throw `ApiError(400, "Validation failed", errors[])`.

### Standard Error Codes (API-wide)
Most endpoints can produce the following status codes:
- **400** Validation / workflow errors (Zod errors are normalized into `errors[]`)
- **401** Missing/invalid/expired JWT
- **403** RBAC denied
- **404** Resource not found
- **409** Conflict (e.g., unique constraint / state conflict)
- **500** Unexpected server errors

Implementation note:
- Some conflict-like conditions are currently returned as **400** (e.g., duplicate entry messages), because the error middleware maps Prisma `P2002` to 400.

---

## Health Endpoints

### Endpoint
- **Method:** GET
- **URL:** `/`
- **Description:** Basic service info and version.

### Authentication
- Public

### Response
- **HTTP 200**
```json
{
	"message": "VMC Civic Issue Monitoring API",
	"status": "running",
	"version": "1.0.0"
}
```

---

### Endpoint
- **Method:** GET
- **URL:** `/api/health`
- **Description:** Health check.

### Authentication
- Public

### Response
- **HTTP 200**
```json
{
	"status": "OK",
	"timestamp": "2026-01-19T10:20:30.000Z"
}
```

---

## Auth Module

### Base Route
`/api/v1/auth`

This module handles:
- Login and JWT issuance
- Password reset via OTP (email)
- Current-user profile
- Logout (client-side cookie clearing)

### Endpoint: Login
- **Method:** POST
- **URL:** `/api/v1/auth/login`
- **Description:** Authenticate a user with email/password and issue a JWT.

#### Authentication
- Public
- Response includes JWT in body and also sets an HTTP-only cookie `token`.

#### Authorization (RBAC)
- Public

#### Request
**Headers**
- `Content-Type: application/json`

**Body (Zod: `loginSchema`)**
- `email`: string, valid email, lowercased
- `password`: string, required (min length 1)

**Example**
```json
{
	"email": "engineer@vmc.gov.in",
	"password": "YourPassword123"
}
```

#### Response
- **HTTP 200**

**Success Response (ApiResponse format)**
```json
{
	"statusCode": 200,
	"data": {
		"token": "<jwt>",
		"user": {
			"id": "<uuid>",
			"fullName": "Ward Engineer",
			"email": "engineer@vmc.gov.in",
			"role": "WARD_ENGINEER",
			"wardId": "<uuid>",
			"zoneId": "<uuid>"
		}
	},
	"message": "Login successful",
	"success": true
}
```

**Field Notes**
- `data.token`: JWT signed with `JWT_SECRET` (default expiry hard-coded to 7d in `utils/tokens.ts`).
- `data.user.*`: sanitized profile used for authorization and UI.
- Cookie: `Set-Cookie: token=<jwt>; HttpOnly; SameSite=Strict; Secure=<prod>`

#### Error Responses
- **400 Validation Error** (Zod)
- **401 Unauthorized** (invalid credentials / deactivated / invalid token semantics are not expected here)
- **403 Forbidden** (not expected on this endpoint; included for client standardization)
- **404 Not Found** (not expected on this endpoint)
- **409 Conflict** (not expected on this endpoint)
- **500 Internal Server Error**

Example (401):
```json
{
	"success": false,
	"statusCode": 401,
	"message": "Invalid credentials",
	"errors": [],
	"timestamp": "2026-01-19T10:20:30.000Z",
	"path": "/api/v1/auth/login"
}
```

#### Business Logic Notes
- Prisma reads `User` by email and verifies `hashedPassword` using bcrypt.
- Writes an `AuditLog` entry with action `LOGIN`.
- Returns token + user via `generateTokenWithUser(userId)`.

#### Security Notes
- Avoids leaking details about account existence beyond credential failure.
- JWT contains `{ id, role }` claims.

---

### Endpoint: Forgot Password (Send OTP)
- **Method:** POST
- **URL:** `/api/v1/auth/forgot-password`
- **Description:** Initiates password reset by generating a 6-digit OTP and emailing it.

#### Authentication
- Public

#### Authorization (RBAC)
- Public

#### Request
**Body (Zod: `forgotPasswordSchema`)**
- `email`: string, valid email, lowercased

**Example**
```json
{
	"email": "engineer@vmc.gov.in"
}
```

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": {
		"message": "If email exists, OTP has been sent"
	},
	"message": "OTP sent successfully",
	"success": true
}
```

**Field Notes**
- If the email is not found, the response is intentionally identical (prevents account enumeration).
- In `development` only, the OTP may also be returned in `data.otp`.

#### Error Responses
- **400 Validation Error**
- **401 Unauthorized** (not expected)
- **403 Forbidden** (not expected)
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error** (only if critical email configuration fails in production)

#### Business Logic Notes
- Creates a `PasswordReset` record with:
	- `otp` (6 digits)
	- `expiresAt` (10 minutes)
	- `attempts` (0)
- Invalidates previous unused OTPs by marking them used.
- Adds an `AuditLog` entry `PASSWORD_RESET_OTP_REQUEST`.

#### Security Notes
- Does not reveal whether the email exists.
- OTP has expiry and attempt limit enforced later.

---

### Endpoint: Verify OTP
- **Method:** POST
- **URL:** `/api/v1/auth/verify-otp`
- **Description:** Verifies OTP validity before password reset.

#### Authentication
- Public

#### Authorization (RBAC)
- Public

#### Request
**Body (Zod: `verifyOtpSchema`)**
- `email`: string, valid email, lowercased
- `otp`: string, exactly 6 digits, numeric

**Example**
```json
{
	"email": "engineer@vmc.gov.in",
	"otp": "123456"
}
```

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": {
		"message": "OTP verified successfully",
		"verified": true
	},
	"message": "OTP verified successfully",
	"success": true
}
```

#### Error Responses
- **400 Validation Error** (including invalid/expired OTP, missing OTP, too many attempts)
- **401 Unauthorized** (not expected)
- **403 Forbidden** (not expected)
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

Example (too many attempts):
```json
{
	"success": false,
	"statusCode": 400,
	"message": "Too many failed attempts. Please request a new OTP",
	"errors": [],
	"timestamp": "2026-01-19T10:20:30.000Z",
	"path": "/api/v1/auth/verify-otp"
}
```

#### Business Logic Notes
- Finds most recent unused OTP with `expiresAt > now`.
- Enforces max 3 attempts (increments `attempts` on mismatch).
- Logs `PASSWORD_RESET_OTP_VERIFIED`.

---

### Endpoint: Reset Password
- **Method:** POST
- **URL:** `/api/v1/auth/reset-password`
- **Description:** Resets password using a valid OTP.

#### Authentication
- Public

#### Authorization (RBAC)
- Public

#### Request
**Body (Zod: `resetPasswordSchema`)**
- `email`: valid email, lowercased
- `otp`: string, exactly 6 digits
- `newPassword`: string
	- min length 8
	- must include uppercase, lowercase, and number

**Example**
```json
{
	"email": "engineer@vmc.gov.in",
	"otp": "123456",
	"newPassword": "NewPassword123"
}
```

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": {
		"message": "Password reset successfully"
	},
	"message": "Password reset successful",
	"success": true
}
```

#### Error Responses
- **400 Validation Error** (including invalid/expired OTP)
- **401 Unauthorized** (not expected)
- **403 Forbidden** (not expected)
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Transaction:
	- updates `User.hashedPassword`
	- marks `PasswordReset.isUsed=true`
- Logs `PASSWORD_RESET_COMPLETE`.

#### Security Notes
- OTP must match and be unexpired.

---

### Endpoint: Logout
- **Method:** POST
- **URL:** `/api/v1/auth/logout`
- **Description:** Logs the logout event and clears cookie.

#### Authentication
- JWT Required
- Accepts JWT via Authorization header or cookie.

#### Authorization (RBAC)
- Any authenticated role
- Reason: Logout is a self-service action.

#### Request
**Headers**
- `Authorization: Bearer <jwt>` (recommended)

**Body**
- None

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": null,
	"message": "Logout successful",
	"success": true
}
```

#### Error Responses
- **400 Validation Error** (not expected)
- **401 Unauthorized** (missing/invalid/expired token)
- **403 Forbidden** (not expected)
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Writes `AuditLog` action `LOGOUT`.
- Clears cookie `token` (client must also discard stored Authorization token if used).

---

### Endpoint: Get Profile
- **Method:** GET
- **URL:** `/api/v1/auth/profile`
- **Description:** Returns current authenticated user profile.

#### Authentication
- JWT Required

#### Authorization (RBAC)
- Any authenticated role
- Reason: profile is user’s own data.

#### Request
**Headers**
- `Authorization: Bearer <jwt>`

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": {
		"id": "<uuid>",
		"fullName": "Ward Engineer",
		"email": "engineer@vmc.gov.in",
		"phoneNumber": "+919999999999",
		"role": "WARD_ENGINEER",
		"department": "ROAD",
		"isActive": true,
		"wardId": "<uuid>",
		"zoneId": "<uuid>",
		"ward": {
			"id": "<uuid>",
			"wardNumber": 12,
			"name": "Fatehgunj",
			"zone": { "id": "<uuid>", "name": "North Zone", "code": "NORTH" }
		},
		"zone": { "id": "<uuid>", "name": "North Zone", "code": "NORTH" },
		"createdAt": "2026-01-01T00:00:00.000Z"
	},
	"message": "Profile retrieved successfully",
	"success": true
}
```

#### Error Responses
- **400 Validation Error** (not expected)
- **401 Unauthorized**
- **403 Forbidden** (not expected)
- **404 Not Found** (user not found/inactive)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Security Notes
- `verifyJWT` loads user from DB and blocks inactive users.

---

## Issues Module

### Base Route
`/api/v1/issues`

This module covers:
- Category lookup
- Issue creation (field worker)
- Listing and retrieval
- Workflow actions: after-media upload, status updates, reassignment, verification
- SLA tracking and ward geo-mapping (PostGIS)

### Authentication
All endpoints require JWT (`router.use(verifyJWT)` is applied at router level).

### Endpoint: Get Issue Categories
- **Method:** GET
- **URL:** `/api/v1/issues/categories`
- **Description:** Returns active issue categories, including `slaHours` and dynamic `formSchema`.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER` (needs categories to file issues)
- `WARD_ENGINEER` (needs category context for triage)
- `ZONE_OFFICER` (oversight)
- `SUPER_ADMIN` (system oversight)

#### Request
No params/body.

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": [
		{
			"id": "<uuid>",
			"name": "Pothole",
			"slug": "pothole",
			"description": "Road surface damage",
			"department": "ROAD",
			"slaHours": 48,
			"formSchema": { "fields": [] },
			"isActive": true
		}
	],
	"message": "Categories retrieved successfully",
	"success": true
}
```

**Field Notes**
- `slaHours`: used to compute issue SLA target on create.
- `formSchema`: dynamic JSON schema used by the client to render category-specific fields.

#### Error Responses
- **400 Validation Error** (not expected)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Prisma query: `issueCategory.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })`.

---

### Endpoint: Get Issue Stats
- **Method:** GET
- **URL:** `/api/v1/issues/stats`
- **Description:** Returns counts by status and SLA breach counts.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER`, `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`

Why allowed:
- Operational visibility for staff roles.

#### Request
**Query Params** (not Zod-validated in this endpoint)
- `wardId` (uuid, optional)
- `zoneId` (uuid, optional)
- `assigneeId` (uuid, optional)

**Example**
`/api/v1/issues/stats?wardId=<uuid>`

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": {
		"total": 120,
		"open": 25,
		"assigned": 40,
		"inProgress": 30,
		"resolved": 20,
		"verified": 5,
		"slaBreached": 7,
		"activeCount": 95,
		"completedCount": 25
	},
	"message": "Issue statistics retrieved successfully",
	"success": true
}
```

#### Error Responses
- **400 Validation Error** (query is not Zod-validated here; invalid UUIDs may still be processed as strings)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Uses `Issue.count` multiple times with `deletedAt: null` and optional filters.

---

### Endpoint: Create Issue
- **Method:** POST
- **URL:** `/api/v1/issues/`
- **Description:** Creates a new issue, generates a ticket number, maps it to a ward using PostGIS, assigns engineer if possible, and sets SLA target.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER`

Why allowed:
- Field workers are the operational reporters in this backend.

#### Request
**Headers**
- `Authorization: Bearer <jwt>`
- `Content-Type: application/json`

**Body (Zod: `createIssueSchema`)**
- `categoryId`: UUID
- `description`: string (trim, 1..5000), optional
- `priority`: `LOW | MEDIUM | HIGH | CRITICAL`, optional (defaulted server-side to `MEDIUM`)
- `metaData`: record<string, any>, optional
- `aiTags`: string[], each trimmed and non-empty, max 50, optional
- `latitude`: number [-90..90]
- `longitude`: number [-180..180]
- `address`: string max 500, optional
- `eloc`: string max 32, optional
- `media`: array (max 20), optional
	- `type`: `BEFORE | AFTER`
	- `url`: must be `http(s)://...`
	- `mimeType`: string max 100, optional
	- `fileSize`: positive int, optional

**Example**
```json
{
	"categoryId": "5f8d2c9f-9a23-4a1c-9c4e-1b7a5d9e3e91",
	"description": "Large pothole near the main junction.",
	"priority": "HIGH",
	"latitude": 22.3072,
	"longitude": 73.1812,
	"address": "Near Fatehgunj Circle, Vadodara",
	"media": [
		{
			"type": "BEFORE",
			"url": "https://cdn.example.com/issues/before-1.jpg",
			"mimeType": "image/jpeg",
			"fileSize": 245123
		}
	]
}
```

#### Response
- **HTTP 201**
```json
{
	"statusCode": 201,
	"data": {
		"id": "<uuid>",
		"ticketNumber": "VMC-2026-000001",
		"status": "ASSIGNED",
		"priority": "HIGH",
		"slaTargetAt": "2026-01-21T10:20:30.000Z",
		"category": { "id": "<uuid>", "name": "Pothole", "slug": "pothole", "department": "ROAD", "slaHours": 48 },
		"ward": { "id": "<uuid>", "wardNumber": 12, "name": "Fatehgunj", "zone": { "id": "<uuid>", "name": "North Zone", "code": "NORTH" } },
		"reporter": { "id": "<uuid>", "fullName": "Reporter Name", "role": "FIELD_WORKER" },
		"assignee": { "id": "<uuid>", "fullName": "Engineer Name", "email": "engineer@vmc.gov.in", "role": "WARD_ENGINEER", "department": "ROAD" },
		"media": [
			{ "id": "<uuid>", "type": "BEFORE", "url": "https://cdn.example.com/issues/before-1.jpg", "mimeType": "image/jpeg", "fileSize": 245123, "createdAt": "2026-01-19T10:20:30.000Z" }
		]
	},
	"message": "Issue created successfully",
	"success": true
}
```

**Field Notes**
- `ticketNumber`: generated server-side and unique.
- `status`: `ASSIGNED` if auto-assignee found, else `OPEN`.
- `slaTargetAt`: computed from category SLA.
- `ward`: present only if coordinates fall within a ward polygon.

#### Error Responses
- **400 Validation Error** (including invalid `categoryId` or invalid workflow)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** (not expected)
- **409 Conflict** (highly unlikely; ticket number generation is transactional)
- **500 Internal Server Error**

#### Business Logic Notes
- Ticket generation:
	- Uses `SystemConfig` key `ticket_counter_<year>` to store `{ last: number }` and generates `VMC-<year>-<6-digit>`.
- PostGIS ward mapping:
	- Raw SQL: `ST_Contains(wards.boundary, ST_SetSRID(ST_MakePoint(lon, lat), 4326))`.
	- If no ward polygon contains the point, `wardId` may be `null` and assignment may not happen.
- Auto-assignment:
	- Picks an active `WARD_ENGINEER` in the same ward (prefers matching department).
	- If assigned, sets status `ASSIGNED` and `assignedAt`.
- SLA target:
	- `slaTargetAt = createdAt + category.slaHours` (if set).
- Writes an `IssueHistory` entry with `changeType: "CREATE"`.
- Sends assignment email when an assignee is selected.

#### Security Notes
- RBAC ensures only field workers can create.
- Server derives `reporterId` from JWT (`req.user.id`) and ignores any client-provided reporter.

---

### Endpoint: List Issues
- **Method:** GET
- **URL:** `/api/v1/issues/`
- **Description:** Paginated issue listing with filters.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER`, `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`

Why allowed:
- Operational roles need to view worklists; admin roles need oversight.

#### Request
**Query Params (Zod: `listIssuesQuerySchema`)**
- `status`: `OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | VERIFIED | REOPENED | REJECTED` (optional)
- `priority`: `LOW | MEDIUM | HIGH | CRITICAL` (optional)
- `wardId`, `zoneId`, `categoryId`, `reporterId`, `assigneeId`: UUID (optional)
- `department`: `ROAD | STORM_WATER_DRAINAGE | SEWAGE_DISPOSAL | WATER_WORKS | STREET_LIGHT | BRIDGE_CELL` (optional)
- `q`: string max 100 (searches `ticketNumber` contains, case-insensitive)
- `page`: int >= 1 (coerced), default 1
- `pageSize`: int 1..100 (coerced), default 20

**Example**
`/api/v1/issues?status=OPEN&wardId=<uuid>&page=1&pageSize=20`

#### Response
- **HTTP 200**
```json
{
	"statusCode": 200,
	"data": {
		"items": [
			{
				"id": "<uuid>",
				"ticketNumber": "VMC-2026-000001",
				"status": "OPEN",
				"priority": "MEDIUM",
				"description": "...",
				"latitude": 22.3072,
				"longitude": 73.1812,
				"address": "...",
				"eloc": null,
				"slaTargetAt": "2026-01-21T10:20:30.000Z",
				"resolvedAt": null,
				"slaBreached": false,
				"createdAt": "2026-01-19T10:20:30.000Z",
				"updatedAt": "2026-01-19T11:00:00.000Z",
				"category": { "id": "<uuid>", "name": "Pothole", "slug": "pothole", "department": "ROAD" },
				"ward": { "id": "<uuid>", "wardNumber": 12, "name": "Fatehgunj", "zone": { "id": "<uuid>", "name": "North Zone", "code": "NORTH" } },
				"reporter": { "id": "<uuid>", "fullName": "Reporter Name", "role": "FIELD_WORKER" },
				"assignee": { "id": "<uuid>", "fullName": "Engineer", "email": "engineer@vmc.gov.in", "phoneNumber": "+919999999999", "role": "WARD_ENGINEER", "department": "ROAD" },
				"media": [ { "id": "<uuid>", "type": "BEFORE", "url": "https://...", "createdAt": "2026-01-19T10:20:30.000Z" } ]
			}
		],
		"page": 1,
		"pageSize": 20,
		"total": 120,
		"totalPages": 6
	},
	"message": "Issues retrieved successfully",
	"success": true
}
```

#### Error Responses
- **400 Validation Error** (query)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** (not expected)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Adds computed `slaBreached` per item: `slaTargetAt < now AND resolvedAt is null`.
- Soft-delete aware: only returns `deletedAt: null`.

---

### Endpoint: Get Issue by ID
- **Method:** GET
- **URL:** `/api/v1/issues/:issueId`
- **Description:** Retrieves a single issue with category, ward/zone, reporter, assignee, media, comments, and history.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER`, `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`

#### Request
**URL Params (Zod: `issueIdParamsSchema`)**
- `issueId`: UUID

#### Response
- **HTTP 200**
- Returns the full Prisma include payload, including:
	- `category`
	- `ward.zone`
	- `media[]`
	- `comments[]` (with commenter `user`)
	- `history[]` (most recent first)

#### Error Responses
- **400 Validation Error**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** (issue missing or soft-deleted)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

---

### Endpoint: Upload After Media (and optionally mark Resolved)
- **Method:** POST
- **URL:** `/api/v1/issues/:issueId/after-media`
- **Description:** Uploads after-work evidence media; can also mark issue as `RESOLVED`.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER`
- `WARD_ENGINEER`

Why allowed:
- Field workers attach completion evidence; ward engineers may assist/override.

#### Request
**Params + Body (Zod: `addAfterMediaWithParamsSchema`, validated from `all`)**
- `issueId`: UUID
- `media`: array, min 1, max 10
	- `url`: http(s) URL
	- `mimeType`: optional
	- `fileSize`: optional positive int
- `markResolved`: boolean, default `true`

**Example**
```json
{
	"media": [
		{ "url": "https://cdn.example.com/issues/after-1.jpg", "mimeType": "image/jpeg", "fileSize": 333222 }
	],
	"markResolved": true
}
```

#### Response
- **HTTP 200**
- Returns updated issue payload including `media`.

#### Error Responses
- **400 Validation Error** (including invalid workflow)
- **401 Unauthorized**
- **403 Forbidden** (field worker not assigned; engineers can bypass)
- **404 Not Found**
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Adds `IssueMedia` records with type `AFTER`.
- If `markResolved=true`, sets `status=RESOLVED` and `resolvedAt=now`.
- Writes `IssueHistory` entries `AFTER_MEDIA_UPLOAD` and optional `STATUS_CHANGE`.

---

### Endpoint: Update Issue Status
- **Method:** PATCH
- **URL:** `/api/v1/issues/:issueId/status`
- **Description:** Moves an issue through the workflow with strict state transitions.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `WARD_ENGINEER`
- `ZONE_OFFICER`
- `SUPER_ADMIN`

Why allowed:
- Engineers manage execution; zone officer/admin oversee and can correct workflow.

#### Request
**Params + Body (Zod: `updateStatusWithParamsSchema`)**
- `issueId`: UUID
- `status`: enum `OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | VERIFIED | REOPENED | REJECTED`
- `comment`: string 1..1000 optional

**Example**
```json
{
	"status": "IN_PROGRESS",
	"comment": "Work started; team dispatched."
}
```

#### Response
- **HTTP 200**
- Returns updated issue (includes `category`, `ward.zone`, `assignee`).

#### Error Responses
- **400 Validation Error** (including invalid transition; message contains allowed next states)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Transition matrix:
	- `OPEN → ASSIGNED | REJECTED`
	- `ASSIGNED → IN_PROGRESS | OPEN`
	- `IN_PROGRESS → RESOLVED | ASSIGNED`
	- `REOPENED → ASSIGNED | IN_PROGRESS`
	- `REJECTED → OPEN`
	- `RESOLVED` is verified/reopened via `/verify`
- Creates `IssueHistory` with `changeType=STATUS_CHANGE`.
- If `comment` provided, creates a `Comment`.

---

### Endpoint: Add Comment
- **Method:** POST
- **URL:** `/api/v1/issues/:issueId/comments`
- **Description:** Adds a comment to an issue.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `FIELD_WORKER`, `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`

Why allowed:
- Cross-functional collaboration and audit trail.

#### Request
**Params + Body (Zod: `addCommentWithParamsSchema`)**
- `issueId`: UUID
- `comment`: string 1..1000

#### Response
- **HTTP 201**
- Returns created comment including `user` summary.

#### Error Responses
- **400 Validation Error**
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**
- **409 Conflict** (not expected)
- **500 Internal Server Error**

---

### Endpoint: Reassign Issue
- **Method:** PATCH
- **URL:** `/api/v1/issues/:issueId/reassign`
- **Description:** Reassigns issue to a different engineer/user.

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`

Why allowed:
- Supervisory reassignment to balance load or correct routing.

#### Request
**Params + Body (Zod: `reassignIssueWithParamsSchema`)**
- `issueId`: UUID
- `assigneeId`: UUID
- `reason`: string 1..500 optional

#### Response
- **HTTP 200**
- Returns updated issue including new `assignee`.

#### Error Responses
- **400 Validation Error** (including assignee inactive or ward mismatch)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found** (issue/assignee)
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Updates `assigneeId`, sets `status=ASSIGNED`, updates `assignedAt`.
- Writes `IssueHistory` `changeType=ASSIGNMENT`.
- Sends assignment email to new assignee.

---

### Endpoint: Verify / Reject Resolution
- **Method:** PATCH
- **URL:** `/api/v1/issues/:issueId/verify`
- **Description:** Approves a resolved issue (`VERIFIED`) or rejects it (`REOPENED`).

#### Authentication
- JWT Required
- Provide token via `Authorization: Bearer <jwt>` (recommended) or cookie `token=<jwt>`.

#### Authorization (RBAC)
Allowed roles:
- `ZONE_OFFICER`, `SUPER_ADMIN`

Why allowed:
- Verification is a supervisory function.

#### Request
**Params + Body (Zod: `verifyResolutionWithParamsSchema`)**
- `issueId`: UUID
- `approved`: boolean
- `comment`: string 1..1000 optional

**Example**
```json
{
	"approved": true,
	"comment": "Verified on-site."
}
```

#### Response
- **HTTP 200**
- If approved: `status=VERIFIED` and `verifiedAt` is set.
- If rejected: `status=REOPENED` and `resolvedAt` is cleared.

#### Error Responses
- **400 Validation Error** (including only-resolved constraint)
- **401 Unauthorized**
- **403 Forbidden**
- **404 Not Found**
- **409 Conflict** (not expected)
- **500 Internal Server Error**

#### Business Logic Notes
- Writes `IssueHistory` `VERIFICATION` (approved) or `REJECTION` (rejected).
- Optional `comment` is added as a new `Comment`.

---

## Users Module

### Base Route
Expected: `/api/v1/users`

**Implementation status (current repository):**
- `src/modules/users/user.routes.ts` is empty and the module is not mounted in `src/app.ts`.
- User management currently exists under the **Admin Module** (`/api/v1/admin/users...`) and current-user profile exists under **Auth Module** (`/api/v1/auth/profile`).

If you want a dedicated users module, implement and mount it in `src/app.ts` and keep RBAC consistent with the Role Matrix below.

---

## Geo Module

### Base Route
Expected: `/api/v1/geo`

**Implementation status (current repository):**
- `src/modules/geo/geo.routes.ts` is empty and not mounted.

**Current Geo logic that DOES exist:**
- Ward mapping is performed internally during issue creation using PostGIS:
	- `ST_Contains(ward.boundary, ST_SetSRID(ST_MakePoint(lon, lat), 4326))`
- Ward boundaries are stored in DB column `wards.boundary` (Polygon SRID 4326).

---

## Sync Module

### Base Route
Expected: `/api/v1/sync`

**Implementation status (current repository):**
- `src/modules/sync/sync.routes.ts` is empty and not mounted.

**Data model support already present:**
- Issues include `version`, `deletedAt`, and `updatedAt` indexes suitable for offline sync.

---

## Authentication Flow

### Login
- Client calls `POST /api/v1/auth/login`.
- Server:
	- verifies credentials
	- returns `{ token, user }` in the response body
	- sets `token` cookie (HTTP-only)

### Token Usage (Cookie vs Header)
- Recommended for API clients: `Authorization: Bearer <token>`.
- Cookie mode requires cookie parsing middleware at runtime; otherwise `req.cookies` will be undefined.

### Refresh Flow
- A refresh-token mechanism is **not implemented** in the current backend.
- Token expiry is currently hard-coded to `7d` in `src/utils/tokens.ts`.

Recommended production approach:
- Use short-lived access tokens (e.g., 15m) + refresh tokens (rotating) stored in a `Session` table.

### Logout
- Client calls `POST /api/v1/auth/logout`.
- Server logs `LOGOUT` and clears the `token` cookie.
- Server does not currently revoke JWTs (stateless tokens remain valid until expiry).

---

## Role Matrix

This matrix reflects **actual mounted endpoints** plus implemented Admin endpoints.

| Role | Auth Module | Issues Module | Admin Module (implemented) | Notes |
|------|------------|--------------|----------------------------|------|
| SUPER_ADMIN | Login/OTP/Profile/Logout | Full access (all endpoints) | Full access (`/api/v1/admin/*`) | System oversight |
| ZONE_OFFICER | Login/OTP/Profile/Logout | Read + stats; can update status, reassign, verify | Not allowed | Zone-level supervisory approval |
| WARD_ENGINEER | Login/OTP/Profile/Logout | Read + stats; can upload after-media; update status; reassign | Not allowed | Ward execution + workflow mgmt |
| FIELD_WORKER | Login/OTP/Profile/Logout | Can create issues; read + stats; upload after-media (assignee enforced) | Not allowed | Field reporting + evidence |
| CITIZEN | Login/OTP/Profile/Logout (if accounts exist) | Not allowed by routes today | Not allowed | Citizen role exists in schema but not used in routes |

---

## Error Handling Strategy

Global error handling is provided by `src/middlewares/error.middleware.ts`:

- Converts common Prisma errors:
	- `P2002` → 400 Duplicate entry
	- `P2025` → 404 Record not found
- Converts JWT `JsonWebTokenError` → 401 Invalid token
- Validation errors:
	- Zod validation is caught in `validateRequest()` and re-thrown as `ApiError(400, "Validation failed", errors[])`.

### Standard Error Response
```json
{
	"success": false,
	"statusCode": 400,
	"message": "Validation failed",
	"errors": [
		{ "field": "email", "message": "Invalid email format" }
	],
	"timestamp": "2026-01-19T10:20:30.000Z",
	"path": "/api/v1/auth/login"
}
```

In `development`, the middleware may also include `stack` and `originalError`.

---

## API Response Standard

Successful endpoints return `new ApiResponse(statusCode, data, message)` from `src/utils/apiResponse.ts`:

```json
{
	"statusCode": 200,
	"data": { "any": "payload" },
	"message": "Success",
	"success": true
}
```

Notes:
- `success` is derived from `statusCode < 400`.
- Error responses do **not** use this class; they use the error middleware format.

