# Admin Module API Documentation

**Base URL:** `/api/v1/admin`  
**Authentication:** All endpoints require `SUPER_ADMIN` role and JWT token

## User Management Endpoints

### 1. Register User
**POST** `/admin/register`

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
  "statusCode": 201,
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
  },
  "message": "User registered successfully",
  "success": true
}
```

**Error Responses:**
- `400`: User already exists, invalid ward/zone, validation errors
- `403`: Insufficient permissions

### 2. Get All Users
**GET** `/admin/users`

**Response (200):**
```json
{
  "statusCode": 200,
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
  ],
  "message": "Users retrieved successfully",
  "success": true
}
```

### 3. Get User by ID
**GET** `/admin/users/:userId`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
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
  },
  "message": "User retrieved successfully",
  "success": true
}
```

**Error Responses:**
- `404`: User not found

### 4. Update User
**PUT** `/admin/users/:userId`

**Request Body:**
```json
{
  "fullName": "John Smith",
  "email": "johnsmith@vmc.gov.in",
  "phoneNumber": "9876543211",
  "role": "WARD_ENGINEER",
  "wardId": "ward-uuid",
  "zoneId": "zone-uuid",
  "department": "WATER_WORKS"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "fullName": "John Smith",
    "email": "johnsmith@vmc.gov.in",
    "phoneNumber": "9876543211",
    "role": "WARD_ENGINEER",
    "department": "WATER_WORKS",
    "wardId": "ward-uuid",
    "zoneId": "zone-uuid",
    "ward": {
      "wardNumber": 5,
      "name": "Raopura"
    },
    "zone": {
      "name": "East Zone"
    }
  },
  "message": "User updated successfully",
  "success": true
}
```

**Error Responses:**
- `400`: Validation errors, email/phone conflicts, role validation failures
- `403`: Cannot update Super Admin account
- `404`: User not found

### 5. Reassign User Work
**POST** `/admin/users/:userId/reassign`

**Request Body:**
```json
{
  "toUserId": "target-user-uuid"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Successfully reassigned 3 active issue(s) from John Doe to Jane Smith",
    "reassignedCount": 3,
    "fromUser": {
      "id": "source-uuid",
      "fullName": "John Doe",
      "role": "WARD_ENGINEER"
    },
    "toUser": {
      "id": "target-uuid",
      "fullName": "Jane Smith",
      "role": "WARD_ENGINEER"
    },
    "issues": [
      {
        "ticketNumber": "VMC-2024-000123",
        "status": "ASSIGNED",
        "priority": "HIGH"
      }
    ]
  },
  "message": "Work reassigned successfully",
  "success": true
}
```

**Error Responses:**
- `400`: No active issues, role mismatch, ward/zone incompatibility, inactive target user
- `404`: Source or target user not found

### 6. Deactivate User
**PATCH** `/admin/users/:userId/deactivate`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "fullName": "John Doe",
    "email": "john@vmc.gov.in",
    "role": "WARD_ENGINEER",
    "isActive": false
  },
  "message": "User deactivated successfully",
  "success": true
}
```

**Error Responses:**
- `400`: User already deactivated, has active issues
- `403`: Cannot deactivate Super Admin
- `404`: User not found

### 7. Reactivate User
**PATCH** `/admin/users/:userId/reactivate`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid-string",
    "fullName": "John Doe",
    "email": "john@vmc.gov.in",
    "role": "WARD_ENGINEER",
    "isActive": true
  },
  "message": "User reactivated successfully",
  "success": true
}
```

**Error Responses:**
- `400`: User already active
- `403`: Cannot reactivate Super Admin
- `404`: User not found

### 8. Get User Statistics
**GET** `/admin/users/:userId/statistics`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid-string",
      "fullName": "John Doe",
      "role": "WARD_ENGINEER",
      "isActive": true
    },
    "statistics": {
      "totalAssigned": 25,
      "activeIssues": 8,
      "resolvedIssues": 15,
      "avgResolutionDays": 3.5,
      "resolutionRate": 60
    }
  },
  "message": "User statistics retrieved successfully",
  "success": true
}
```

### 9. Filter Users
**GET** `/admin/users/filter/search?role=WARD_ENGINEER&wardId=uuid&isActive=true`

**Query Parameters:**
- `role` (optional): User role filter
- `wardId` (optional): Ward UUID filter
- `zoneId` (optional): Zone UUID filter
- `isActive` (optional): Active status filter (true/false)
- `department` (optional): Department filter

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "uuid-string",
      "fullName": "John Doe",
      "email": "john@vmc.gov.in",
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
      }
    }
  ],
  "message": "Filtered users retrieved successfully",
  "success": true
}
```

### 10. Get Departments
**GET** `/admin/departments`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    { "value": "ROAD", "label": "Road Department" },
    { "value": "STORM_WATER_DRAINAGE", "label": "Storm Water Drainage" },
    { "value": "SEWAGE_DISPOSAL", "label": "Sewage Disposal" },
    { "value": "WATER_WORKS", "label": "Water Works" },
    { "value": "STREET_LIGHT", "label": "Street Light" },
    { "value": "BRIDGE_CELL", "label": "Bridge Cell" },
    { "value": "SOLID_WASTE_MANAGEMENT", "label": "Solid Waste Management" },
    { "value": "HEALTH", "label": "Health Department" },
    { "value": "TOWN_PLANNING", "label": "Town Planning" },
    { "value": "PARKS_GARDENS", "label": "Parks & Gardens" },
    { "value": "ENCROACHMENT", "label": "Encroachment" },
    { "value": "FIRE", "label": "Fire Department" },
    { "value": "ELECTRICAL", "label": "Electrical Department" }
  ],
  "message": "Departments retrieved successfully",
  "success": true
}
```

## Dashboard Endpoints

### 11. Dashboard Overview
**GET** `/admin/dashboard`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "totalIssues": 150,
    "open": 45,
    "inProgress": 30,
    "slaBreached": 12,
    "avgSlaTimeHours": 36.5,
    "resolutionRatePercent": 78.5
  },
  "message": "Dashboard overview retrieved",
  "success": true
}
```

### 12. Zones Overview
**GET** `/admin/zones`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "zoneId": "zone-uuid",
      "name": "East Zone",
      "totalIssues": 45,
      "openIssues": 12,
      "slaCompliance": 85,
      "zoneOfficer": "Officer Name"
    },
    {
      "zoneId": "zone-uuid-2",
      "name": "West Zone",
      "totalIssues": 32,
      "openIssues": 8,
      "slaCompliance": 92,
      "zoneOfficer": "Another Officer"
    }
  ],
  "message": "Zones overview retrieved",
  "success": true
}
```

**Response Fields:**
- `totalIssues`: Total number of issues in the zone (all statuses)
- `openIssues`: Number of issues with status 'OPEN' in the zone
- `slaCompliance`: Percentage (0-100) of resolved issues that met SLA targets
- `zoneOfficer`: Name of assigned zone officer (null if none)

### 13. Zone Details
**GET** `/admin/zones/:zoneId`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "zoneName": "East Zone",
    "zoneOfficer": "Officer Name",
    "totalWards": 4,
    "totalIssues": 45,
    "slaCompliance": 85
  },
  "message": "Zone detail retrieved",
  "success": true
}
```

**Error Responses:**
- `404`: Zone not found

### 14. Zone Wards
**GET** `/admin/zones/:zoneId/wards`

**Response (200):**
```json
{
  "statusCode": 200,
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
  ],
  "message": "Zone wards overview retrieved",
  "success": true
}
```

### 15. Ward Details
**GET** `/admin/wards/:wardId`

**Response (200):**
```json
{
  "statusCode": 200,
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
  },
  "message": "Ward detail retrieved",
  "success": true
}
```

**Error Responses:**
- `404`: Ward not found

### 16. Ward Issues
**GET** `/admin/wards/:wardId/issues?status=OPEN&priority=HIGH&categoryId=uuid`

**Query Parameters:**
- `status` (optional): OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED, REOPENED, REJECTED
- `priority` (optional): LOW, MEDIUM, HIGH, CRITICAL
- `categoryId` (optional): UUID of issue category

**Response (200):**
```json
{
  "statusCode": 200,
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
  ],
  "message": "Ward issues retrieved",
  "success": true
}
```

## Common Error Responses

### Authentication Errors (401)
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "success": false
}
```

### Authorization Errors (403)
```json
{
  "statusCode": 403,
  "message": "Access denied. Insufficient permissions",
  "success": false
}
```

### Validation Errors (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "success": false,
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

### Server Errors (500)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "success": false
}
```

## Authentication
- All endpoints require JWT token in Authorization header: `Bearer <token>`
- Only users with `SUPER_ADMIN` role can access these endpoints
- Tokens expire after configured time period

## Rate Limiting
- API calls are rate limited per user
- Excessive requests will return 429 Too Many Requests

## Notes
- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all entity identifiers
- Soft deletes are used (deletedAt field)
- Audit logs are maintained for all admin actions