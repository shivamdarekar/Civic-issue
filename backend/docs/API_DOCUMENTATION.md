# VMC Civic Issue Monitoring System - API Documentation

## 🚀 Base URL
```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## 📋 Table of Contents
1. [Authentication Module](#authentication-module)
2. [Admin Module](#admin-module)
3. [Geo Module](#geo-module)
4. [Issues Module](#issues-module)
5. [Users Module](#users-module)
6. [Sync Module](#sync-module)
7. [Common Response Format](#common-response-format)
8. [Error Handling](#error-handling)
9. [User Roles & Permissions](#user-roles--permissions)

---

## 🔐 Authentication Module

### 1. Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "superadmin@vmc.gov.in",
  "password": "SuperAdmin@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "fullName": "VMC Super Administrator",
      "email": "superadmin@vmc.gov.in",
      "role": "SUPER_ADMIN",
      "department": null,
      "wardId": null,
      "zoneId": null,
      "ward": null,
      "zone": null
    }
  }
}
```

### 2. Forgot Password
**POST** `/auth/forgot-password`

**Request Body:**
```json
{
  "email": "engineer@vmc.gov.in"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset instructions sent",
  "data": {
    "message": "If email exists, reset link has been sent"
  }
}
```

### 3. Reset Password
**POST** `/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecure@123"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful",
  "data": {
    "message": "Password reset successfully"
  }
}
```

### 4. Get Profile
**GET** `/auth/profile`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid-string",
    "fullName": "John Doe",
    "email": "john@vmc.gov.in",
    "role": "WARD_ENGINEER",
    "department": "ROAD",
    "wardId": "ward-uuid",
    "zoneId": "zone-uuid",
    "ward": {
      "wardNumber": 5,
      "name": "Raopura"
    },
    "zone": {
      "name": "East Zone"
    }
  }
}
```

### 5. Logout
**POST** `/auth/logout`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful",
  "data": null
}
```

---

## 👨‍💼 Admin Module
**Note:** All admin endpoints require `SUPER_ADMIN` role

### 1. Register User
**POST** `/admin/register`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@vmc.gov.in",
  "phoneNumber": "9876543210",
  "password": "TempPassword@123",
  "role": "WARD_ENGINEER",
  "department": "ROAD",
  "wardId": "ward-uuid",
  "zoneId": "zone-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "uuid-string",
    
    "fullName": "John Doe",
    "email": "john@vmc.gov.in",
    "phoneNumber": "9876543210",
    "role": "WARD_ENGINEER",
    "department": "ROAD",
    "wardId": "ward-uuid",
    "zoneId": "zone-uuid",
    "ward": {
      "wardNumber": 5,
      "name": "Raopura"
    },
    "zone": {
      "name": "East Zone"
    }
  }
}
```

### 2. Get All Users
**GET** `/admin/users`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid-string",
      "fullName": "John Doe",
      "email": "john@vmc.gov.in",
      "phoneNumber": "9876543210",
      "role": "WARD_ENGINEER",
      "department": "ROAD",
      "isActive": true,
      "wardId": "ward-uuid",
      "zoneId": "zone-uuid",
      "ward": {
        "wardNumber": 5,
        "name": "Raopura"
      },
      "zone": {
        "name": "East Zone"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 3. Get Zones and Wards
**GET** `/admin/zones-wards`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Zones and wards retrieved successfully",
  "data": [
    {
      "id": "zone-uuid",
      "name": "East Zone",
      "wards": [
        {
          "id": "ward-uuid",
          "wardNumber": 1,
          "name": "Nyay Mandir"
        },
        {
          "id": "ward-uuid-2",
          "wardNumber": 3,
          "name": "Waghodia"
        }
      ]
    }
  ]
}
```

### 4. Get Departments
**GET** `/admin/departments`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Departments retrieved successfully",
  "data": [
    { "value": "ROAD", "label": "Road Department" },
    { "value": "STORM_WATER_DRAINAGE", "label": "Storm Water Drainage" },
    { "value": "SEWAGE_DISPOSAL", "label": "Sewage Disposal" },
    { "value": "WATER_WORKS", "label": "Water Works" },
    { "value": "STREET_LIGHT", "label": "Street Light" },
    { "value": "BRIDGE_CELL", "label": "Bridge Cell" }
  ]
}
```

### 5. Dashboard Overview
**GET** `/admin/dashboard`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard overview retrieved",
  "data": {
    "totalIssues": 150,
    "open": 45,
    "inProgress": 30,
    "slaBreached": 12,
    "avgSlaTimeHours": 36.5,
    "resolutionRatePercent": 78.5
  }
}
```

### 6. Zones Overview
**GET** `/admin/zones`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Zones overview retrieved",
  "data": [
    {
      "zoneId": "zone-uuid",
      "name": "East Zone",
      "totalIssues": 45,
      "slaCompliance": 85,
      "zoneOfficer": "Officer Name"
    }
  ]
}
```

### 7. Zone Details
**GET** `/admin/zones/:zoneId`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Zone detail retrieved",
  "data": {
    "zoneName": "East Zone",
    "zoneOfficer": "Officer Name",
    "totalWards": 4,
    "totalIssues": 45,
    "slaCompliance": 85
  }
}
```

### 8. Zone Wards
**GET** `/admin/zones/:zoneId/wards`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Zone wards overview retrieved",
  "data": [
    {
      "wardId": "ward-uuid",
      "wardNumber": 1,
      "name": "Nyay Mandir",
      "open": 5,
      "inProgress": 3,
      "slaBreached": 1,
      "totalIssues": 12,
      "engineer": "John Doe"
    }
  ]
}
```

### 9. Ward Details
**GET** `/admin/wards/:wardId`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ward detail retrieved",
  "data": {
    "wardNumber": 1,
    "wardName": "Nyay Mandir",
    "zoneName": "East Zone",
    "engineers": [
      {
        "id": "engineer-uuid",
        "fullName": "John Doe",
        "email": "john@vmc.gov.in",
        "phoneNumber": "9876543210",
        "isActive": true,
        "department": "ROAD"
      }
    ],
    "totalEngineers": 1,
    "totalIssues": 12,
    "open": 5,
    "inProgress": 3,
    "assigned": 2,
    "resolved": 2,
    "verified": 0,
    "reopened": 0,
    "rejected": 0,
    "slaBreached": 1,
    "slaCompliance": 85,
    "priorities": {
      "critical": 1,
      "high": 3,
      "medium": 6,
      "low": 2
    },
    "avgOpenDays": 5.2,
    "oldestOpenDays": 12,
    "issues": [
      {
        "id": "issue-uuid",
        "status": "OPEN",
        "priority": "HIGH",
        "categoryName": "Pothole",
        "department": "ROAD",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "resolvedAt": null,
        "slaTargetAt": "2024-01-17T10:30:00.000Z",
        "priorityWeight": 3,
        "hasBeforeImage": true,
        "hasAfterImage": false
      }
    ]
  }
}
```

### 10. Ward Issues
**GET** `/admin/wards/:wardId/issues?status=OPEN&priority=HIGH&categoryId=uuid`
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED, REOPENED, REJECTED
- `priority` (optional): LOW, MEDIUM, HIGH, CRITICAL
- `categoryId` (optional): UUID of issue category

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ward issues retrieved",
  "data": [
    {
      "id": "issue-uuid",
      "ticketNumber": "VMC-2024-000001",
      "status": "OPEN",
      "priority": "HIGH",
      "category": "Pothole",
      "department": "ROAD",
      "assignee": "John Doe",
      "slaBreached": false,
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🗺️ Geo Module

### 1. Find Ward by Location
**POST** `/geo/find-ward`

**Request Body:**
```json
{
  "latitude": 22.3072,
  "longitude": 73.1812
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ward found successfully",
  "data": {
    "wardId": "ward-uuid",
    "wardNumber": 6,
    "wardName": "Akota",
    "zoneName": "West Zone"
  }
}
```

**Response (404) - Outside VMC jurisdiction:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Location is outside VMC jurisdiction",
  "data": null
}
```

---

## 🎫 Issues Module

### 1. Create Issue
**POST** `/issues`
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**
```
latitude: 22.3072
longitude: 73.1812
categoryId: category-uuid
description: Large pothole blocking traffic
photo: [file upload]
```

**Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Issue created successfully",
  "data": {
    "id": "issue-uuid",
    "ticketNumber": "VMC-2024-000001",
    "status": "OPEN",
    "priority": "MEDIUM",
    "categoryId": "category-uuid",
    "description": "Large pothole blocking traffic",
    "latitude": 22.3072,
    "longitude": 73.1812,
    "wardId": "ward-uuid",
    "wardName": "Akota",
    "zoneName": "West Zone",
    "assigneeId": "engineer-uuid",
    "assigneeName": "John Doe",
    "department": "ROAD",
    "slaTargetAt": "2024-01-17T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Issue Categories
**GET** `/issues/categories`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "category-uuid",
      "name": "Pothole",
      "slug": "pothole",
      "description": "Road potholes and surface damage",
      "slaHours": 48,
      "iconUrl": "/icons/pothole.png",
      "department": "ROAD",
      "formSchema": {
        "fields": [
          {
            "name": "depth_cm",
            "type": "number",
            "label": "Depth (cm)",
            "required": true
          }
        ]
      }
    }
  ]
}
```

### 3. Get My Issues
**GET** `/issues/my-issues?status=OPEN&page=1&limit=10`
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Issues retrieved successfully",
  "data": {
    "issues": [
      {
        "id": "issue-uuid",
        "ticketNumber": "VMC-2024-000001",
        "status": "OPEN",
        "priority": "MEDIUM",
        "category": "Pothole",
        "description": "Large pothole blocking traffic",
        "wardName": "Akota",
        "assigneeName": "John Doe",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "slaTargetAt": "2024-01-17T10:30:00.000Z",
        "slaBreached": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 👥 Users Module

### 1. Get Users by Ward
**GET** `/users/ward/:wardId`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Ward users retrieved successfully",
  "data": [
    {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@vmc.gov.in",
      "role": "WARD_ENGINEER",
      "department": "ROAD",
      "isActive": true,
      "activeIssuesCount": 5
    }
  ]
}
```

---

## 🔄 Sync Module

### 1. Sync Data
**POST** `/sync`
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lastSyncAt": "2024-01-15T10:30:00.000Z",
  "deviceId": "device-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Sync completed successfully",
  "data": {
    "issues": [],
    "categories": [],
    "users": [],
    "lastSyncAt": "2024-01-15T11:30:00.000Z"
  }
}
```

---

## 📝 Common Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "statusCode": number,
  "message": string,
  "data": any | null,
  "errors": array | undefined
}
```

---

## ❌ Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Required"
    }
  ]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials",
  "data": null
}
```

### Authorization Errors (403)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Access denied. Insufficient permissions",
  "data": null
}
```

### Not Found Errors (404)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "data": null
}
```

### Server Errors (500)
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal server error",
  "data": null
}
```

---

## 👤 User Roles & Permissions

### Role Hierarchy
1. **SUPER_ADMIN** - Full system access
2. **ZONE_OFFICER** - Zone-level access
3. **WARD_ENGINEER** - Ward-level access
4. **FIELD_WORKER** - Limited field operations
5. **CITIZEN** - Issue reporting only

### Department Types
- `ROAD` - Road Department
- `STORM_WATER_DRAINAGE` - Storm Water Drainage
- `SEWAGE_DISPOSAL` - Sewage Disposal
- `WATER_WORKS` - Water Works
- `STREET_LIGHT` - Street Light
- `BRIDGE_CELL` - Bridge Cell

### Issue Status Flow
```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED
  ↓        ↓           ↓           ↓
REJECTED  REJECTED   REJECTED   REOPENED
```

### Priority Levels
- `CRITICAL` - Immediate attention required
- `HIGH` - High priority
- `MEDIUM` - Normal priority
- `LOW` - Low priority

---

## 🔧 Frontend Implementation Notes

### 1. Authentication
- Store JWT token in localStorage or secure cookie
- Include token in Authorization header: `Bearer <token>`
- Implement token refresh mechanism
- Handle 401 responses by redirecting to login

### 2. File Uploads
- Use FormData for multipart uploads
- Support image compression before upload
- Show upload progress
- Handle file size limits

### 3. Real-time Updates
- Implement WebSocket connection for real-time issue updates
- Use Server-Sent Events for notifications
- Implement offline-first approach with sync

### 4. Maps Integration
- Use Google Maps or Mapbox for location selection
- Implement reverse geocoding for addresses
- Show ward boundaries on map
- GPS location capture for mobile

### 5. Error Handling
- Implement global error handler
- Show user-friendly error messages
- Handle network failures gracefully
- Implement retry mechanisms

### 6. State Management
- Use Redux/Zustand for global state
- Cache API responses
- Implement optimistic updates
- Handle loading states

---

## 🚀 Getting Started

1. **Base URL**: `http://localhost:5000/api/v1`
2. **Authentication**: All protected routes require JWT token
3. **Content-Type**: `application/json` (except file uploads)
4. **CORS**: Enabled for frontend domains

### Test Credentials
```
Email: superadmin@vmc.gov.in
Password: SuperAdmin@123
```

---

## 📞 Support

For any questions or issues, contact the backend team or refer to the API source code in the repository.

**Happy Coding! 🎉**