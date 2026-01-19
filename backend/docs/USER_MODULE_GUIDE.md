# User Module - Complete Documentation

## Overview

The User Module provides self-service functionality for authenticated users including dashboards, profile management, and activity tracking. It follows the controller/service/routes pattern consistent with the project architecture.

## File Structure

```
backend/src/modules/users/
├── user.controller.ts    # Request handlers
├── user.service.ts       # Business logic & database operations
├── user.routes.ts        # Route definitions
└── user.schema.ts        # Validation schemas (Zod)
```

## Features

### ✅ Implemented
1. **Role-Specific Dashboards**
   - Field Worker Dashboard
   - Ward Engineer Dashboard
   - Assigned Issues Dashboard

2. **Profile Management**
   - Update own profile (name, phone)
   - Change password (with current password verification)
   - View activity log

3. **Statistics & Analytics**
   - Issue counts by status
   - Issue counts by priority
   - SLA tracking (Ward Engineers)
   - Average resolution time

### ⚠️ Not Implemented (Future Features)
- Notification preferences
- Email digest settings
- Profile picture upload
- Two-factor authentication

---

## API Endpoints

### Base URL
All endpoints are prefixed with: `/api/v1/users`

### Authentication
All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Dashboard Endpoints

### 1.1 Field Worker Dashboard

**Endpoint**: `GET /api/v1/users/dashboard/field-worker`

**Authorization**: FIELD_WORKER only

**Description**: Returns statistics and recent issues created by the field worker

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "totalIssuesCreated": 45,
    "issuesByStatus": {
      "OPEN": 5,
      "ASSIGNED": 10,
      "IN_PROGRESS": 15,
      "RESOLVED": 12,
      "VERIFIED": 3
    },
    "recentIssues": [
      {
        "id": "uuid",
        "ticketNumber": "VMC-2026-000123",
        "status": "ASSIGNED",
        "priority": "HIGH",
        "createdAt": "2026-01-15T10:30:00Z"
      }
    ]
  },
  "message": "Field worker dashboard retrieved"
}
```

**Query Parameters**:
- `limit` (optional): Number of recent issues to return (1-50, default: 10)

---

### 1.2 Ward Engineer Dashboard

**Endpoint**: `GET /api/v1/users/dashboard/ward-engineer`

**Authorization**: WARD_ENGINEER only

**Description**: Returns comprehensive ward statistics including SLA tracking and resolution metrics

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "wardId": "uuid",
    "department": "ROAD",
    "totalIssues": 150,
    "issuesByStatus": {
      "OPEN": 10,
      "ASSIGNED": 25,
      "IN_PROGRESS": 40,
      "RESOLVED": 60,
      "VERIFIED": 15
    },
    "issuesByPriority": {
      "LOW": 30,
      "MEDIUM": 70,
      "HIGH": 40,
      "CRITICAL": 10
    },
    "sla": {
      "withinSla": 120,
      "breachedSla": 8
    },
    "averageResolutionTimeHours": 36.5
  },
  "message": "Ward engineer dashboard retrieved"
}
```

**Requirements**:
- User must have `wardId` assigned
- User must have `department` assigned

**Query Parameters**:
- None

---

### 1.3 Assigned Issues Dashboard

**Endpoint**: `GET /api/v1/users/dashboard/assigned`

**Authorization**: FIELD_WORKER, WARD_ENGINEER

**Description**: Returns issues assigned to the current user

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "totalAssigned": 25,
    "issuesByStatus": {
      "ASSIGNED": 10,
      "IN_PROGRESS": 12,
      "RESOLVED": 3
    },
    "issuesByPriority": {
      "MEDIUM": 15,
      "HIGH": 8,
      "CRITICAL": 2
    },
    "assignedIssues": [
      {
        "id": "uuid",
        "ticketNumber": "VMC-2026-000145",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "createdAt": "2026-01-14T08:00:00Z"
      }
    ]
  },
  "message": "Assigned issues dashboard retrieved"
}
```

**Query Parameters**:
- `limit` (optional): Number of issues to return (1-50, default: 10)

---

## 2. Profile Management Endpoints

### 2.1 Update Own Profile

**Endpoint**: `PATCH /api/v1/users/profile`

**Authorization**: All authenticated users

**Description**: Update user's own name and/or phone number

**Request Body**:
```json
{
  "fullName": "John Doe Updated",
  "phoneNumber": "9876543210"
}
```

**Validation Rules**:
- `fullName` (optional): 2-100 characters
- `phoneNumber` (optional): Valid Indian phone number format
- At least one field must be provided
- Phone number must be unique

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "fullName": "John Doe Updated",
    "email": "john@example.com",
    "phoneNumber": "9876543210",
    "role": "FIELD_WORKER",
    "department": null,
    "updatedAt": "2026-01-17T12:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

**Errors**:
- `400`: At least one field required
- `409`: Phone number already in use

---

### 2.2 Change Password

**Endpoint**: `POST /api/v1/users/change-password`

**Authorization**: All authenticated users

**Description**: Change user's password (requires current password for verification)

**Request Body**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Validation Rules**:
- `currentPassword` (required): Must match current password
- `newPassword` (required): 
  - Min 8 characters
  - Must contain uppercase, lowercase, and number
  - Must be different from current password

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "message": "Password changed successfully"
  },
  "message": "Password changed successfully"
}
```

**Errors**:
- `400`: Validation errors (weak password, same as current)
- `401`: Current password incorrect
- `404`: User not found

**Security Notes**:
- Current password is verified before change
- Password is hashed using bcrypt
- Action is logged in audit log
- No email notification (can be added if needed)

---

### 2.3 Get Activity Log

**Endpoint**: `GET /api/v1/users/activity`

**Authorization**: All authenticated users

**Description**: View user's own activity/action history

**Response**:
```json
{
  "statusCode": 200,
  "data": {
    "userId": "uuid",
    "activities": [
      {
        "id": "uuid",
        "action": "PASSWORD_CHANGED",
        "resource": "User",
        "resourceId": "uuid",
        "metadata": {
          "changedAt": "2026-01-17T11:00:00Z"
        },
        "createdAt": "2026-01-17T11:00:00Z"
      },
      {
        "id": "uuid",
        "action": "PROFILE_UPDATE",
        "resource": "User",
        "resourceId": "uuid",
        "metadata": {
          "updatedFields": {
            "phoneNumber": "9876543210"
          }
        },
        "createdAt": "2026-01-16T15:30:00Z"
      },
      {
        "id": "uuid",
        "action": "STATUS_CHANGE",
        "resource": "Issue",
        "resourceId": "issue-uuid",
        "metadata": {
          "from": "ASSIGNED",
          "to": "IN_PROGRESS"
        },
        "createdAt": "2026-01-15T09:20:00Z"
      }
    ],
    "count": 3
  },
  "message": "Activity log retrieved successfully"
}
```

**Query Parameters**:
- `limit` (optional): Number of activities to return (1-100, default: 20)

**Activity Types Logged**:
- `PASSWORD_CHANGED` - User changed their password
- `PROFILE_UPDATE` - User updated their profile
- `CREATE` - User created an issue
- `STATUS_CHANGE` - User changed issue status
- `AFTER_MEDIA_UPLOAD` - User uploaded after-resolution media
- `COMMENT_ADDED` - User added a comment

---

## Usage Examples

### JavaScript/TypeScript

#### Update Profile
```javascript
const updateProfile = async (fullName, phoneNumber) => {
  const response = await fetch('/api/v1/users/profile', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fullName, phoneNumber })
  });

  const result = await response.json();
  if (result.statusCode === 200) {
    console.log('Profile updated:', result.data);
  }
};
```

#### Change Password
```javascript
const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch('/api/v1/users/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });

  const result = await response.json();
  if (result.statusCode === 200) {
    alert('Password changed successfully!');
  } else if (result.statusCode === 401) {
    alert('Current password is incorrect');
  }
};
```

#### Get Dashboard
```javascript
const getFieldWorkerDashboard = async () => {
  const response = await fetch('/api/v1/users/dashboard/field-worker?limit=10', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  return result.data;
};
```

### cURL Examples

#### Update Profile
```bash
curl -X PATCH http://localhost:4000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe Updated",
    "phoneNumber": "9876543210"
  }'
```

#### Change Password
```bash
curl -X POST http://localhost:4000/api/v1/users/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123"
  }'
```

#### Get Activity Log
```bash
curl -X GET "http://localhost:4000/api/v1/users/activity?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "success": false
}
```

### Common Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Invalid/expired token, wrong password |
| 403 | Forbidden | Insufficient permissions for role |
| 404 | Not Found | User or resource not found |
| 409 | Conflict | Phone number/email already exists |
| 500 | Server Error | Database error, unexpected issue |

---

## Data Models

### Dashboard Issue List Item
```typescript
{
  id: string;
  ticketNumber: string;
  status: IssueStatus;
  priority: Priority;
  createdAt: Date;
}
```

### Issue Status Enum
```typescript
enum IssueStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  VERIFIED = "VERIFIED",
  REOPENED = "REOPENED",
  REJECTED = "REJECTED"
}
```

### Priority Enum
```typescript
enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}
```

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT
2. **Role-Based Access**: Dashboard endpoints restricted by role
3. **Self-Service Only**: Users can only modify their own profile
4. **Password Verification**: Current password required for change
5. **Audit Logging**: All actions logged for accountability
6. **Phone Uniqueness**: Prevents duplicate phone numbers
7. **Password Strength**: Enforced via validation

---

## Testing Checklist

- [ ] Field Worker can access field-worker dashboard
- [ ] Ward Engineer can access ward-engineer dashboard
- [ ] Both roles can access assigned dashboard
- [ ] User can update fullName only
- [ ] User can update phoneNumber only
- [ ] User can update both fields
- [ ] Cannot update with existing phone number
- [ ] Password change requires correct current password
- [ ] New password must meet strength requirements
- [ ] New password cannot be same as current
- [ ] Activity log shows user's actions
- [ ] Activity log pagination works
- [ ] All actions are logged in audit_logs

---

## Future Enhancements

### Notification Preferences (Planned)
```typescript
// Endpoint: PATCH /api/v1/users/preferences
{
  "emailNotifications": true,
  "smsNotifications": false,
  "notifyOnAssignment": true,
  "notifyOnStatusChange": true,
  "digestFrequency": "daily" // daily, weekly, never
}
```

### Profile Picture Upload (Planned)
```typescript
// Endpoint: POST /api/v1/users/profile-picture
// Similar to issue image upload
// Store in Cloudinary under civic-issues/profiles/
```

### Two-Factor Authentication (Planned)
```typescript
// Endpoints:
// POST /api/v1/users/2fa/enable
// POST /api/v1/users/2fa/verify
// POST /api/v1/users/2fa/disable
```

---

## Integration with Other Modules

### Auth Module
- Users get profile from `/api/v1/auth/profile` (includes all details)
- Users update profile via `/api/v1/users/profile` (limited fields)
- Password reset via OTP: `/api/v1/auth/forgot-password`
- Password change when logged in: `/api/v1/users/change-password`

### Admin Module
- Admins manage users via `/api/v1/admin/*`
- Admins can update any field including role, ward, zone
- Users can only update name and phone (self-service)

### Issues Module
- Dashboard shows issues created/assigned to user
- Activity log shows issue-related actions
- Statistics calculated from issues table

---

## Comparison: User Module vs Auth Module vs Admin Module

| Feature | User Module | Auth Module | Admin Module |
|---------|-------------|-------------|--------------|
| Update Profile | ✅ Name, Phone only | ❌ | ✅ All fields |
| Change Password | ✅ With verification | ❌ | ❌ |
| Reset Password | ❌ | ✅ Via OTP | ❌ |
| View Profile | ❌ | ✅ Full details | ✅ Any user |
| Dashboard | ✅ Personal stats | ❌ | ✅ System-wide |
| Activity Log | ✅ Own actions | ❌ | ✅ All users |
| Manage Users | ❌ | ❌ | ✅ Full CRUD |

---

## Architecture Notes

### Service Layer Pattern
```
Request → Route → Controller → Service → Database
```

- **Routes**: Define endpoints and middleware
- **Controller**: Handle request/response
- **Service**: Business logic and database operations
- **Types**: TypeScript interfaces in `types/user.types.ts`
- **Validation**: Zod schemas in `user.schema.ts`

### Separation of Concerns
- `UserDashboardService`: Read-only dashboard data
- Profile updates: Write operations with validation
- Auth operations: Handled by `AuthService`
- Admin operations: Handled by `AdminService`

This keeps each service focused and maintainable.

---

## Maintenance

### Common Tasks

**Add new dashboard metric:**
1. Update service method in `user.service.ts`
2. Update type in `types/user.types.ts`
3. Update documentation

**Add new profile field:**
1. Add to database schema if needed
2. Update validation in `user.schema.ts`
3. Update service in `user.service.ts`
4. Update type definitions

**Add new activity type:**
- Just log it using `prisma.auditLog.create()`
- It will automatically appear in activity log

---

## Support & Contact

For issues or questions about the User Module:
- Check error logs in `backend/logs/`
- Review audit logs in database
- Check authentication middleware
- Verify role assignments in database
