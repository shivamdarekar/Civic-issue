# Admin User Management API Documentation

## 📋 Overview

Complete API documentation for Super Admin user management features including update, reassignment, deactivation, and reactivation of workers, engineers, and zone officers.

---

## 🔑 Base Configuration

**Base URL:** `http://localhost:5000/api/v1/admin`

**Authentication:** All endpoints require JWT Bearer token with `SUPER_ADMIN` role

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 👥 User Management Endpoints

### 1. **Get All Users**

**Endpoint:** `GET /users`  
**Access:** SUPER_ADMIN only

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "uuid",
      "fullName": "Amit Patel",
      "email": "amit.patel@vmc.gov.in",
      "phoneNumber": "9876543212",
      "role": "WARD_ENGINEER",
      "department": "ROAD",
      "isActive": true,
      "wardId": "ward-uuid",
      "zoneId": "zone-uuid",
      "ward": {
        "wardNumber": 1,
        "name": "Fatehgunj"
      },
      "zone": {
        "name": "North Zone"
      },
      "createdAt": "2026-01-10T10:00:00.000Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

---

### 2. **Get User By ID** (for editing form)

**Endpoint:** `GET /users/:userId`  
**Access:** SUPER_ADMIN only

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Amit Patel",
    "email": "amit.patel@vmc.gov.in",
    "phoneNumber": "9876543212",
    "role": "WARD_ENGINEER",
    "department": "ROAD",
    "isActive": true,
    "wardId": "ward-uuid",
    "zoneId": "zone-uuid",
    "ward": {
      "wardNumber": 1,
      "name": "Fatehgunj"
    },
    "zone": {
      "name": "North Zone"
    },
    "createdAt": "2026-01-10T10:00:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

**Frontend Usage:**
- Fetch this data when admin clicks "Edit" button
- Pre-fill all form fields with returned data
- Show current ward/zone information

---

### 3. **Update User Details** ⭐ NEW

**Endpoint:** `PUT /users/:userId`  
**Access:** SUPER_ADMIN only

**Request Body:**
```json
{
  "fullName": "Amit Kumar Patel",
  "email": "amit.kumar@vmc.gov.in",
  "phoneNumber": "9876543213",
  "role": "WARD_ENGINEER",
  "wardId": "new-ward-uuid",
  "zoneId": "new-zone-uuid",
  "department": "STORM_WATER_DRAINAGE"
}
```

**All fields are optional** - only send fields that need to be updated

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Amit Kumar Patel",
    "email": "amit.kumar@vmc.gov.in",
    "phoneNumber": "9876543213",
    "role": "WARD_ENGINEER",
    "department": "STORM_WATER_DRAINAGE",
    "wardId": "new-ward-uuid",
    "zoneId": "new-zone-uuid",
    "ward": {
      "wardNumber": 5,
      "name": "Manjalpur"
    },
    "zone": {
      "name": "South Zone"
    }
  },
  "message": "User updated successfully"
}
```

**Validation Rules:**
- **Full Name:** 2-100 characters
- **Email:** Valid email format
- **Phone:** Indian mobile format (10 digits starting with 6-9)
- **Ward Engineer:** Must have `wardId` and `department`
- **Field Worker:** Must have `wardId`
- **Zone Officer:** Must have `zoneId`
- Cannot update SUPER_ADMIN accounts

**Error Responses:**
```json
// 404 - User not found
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}

// 400 - Email/phone already exists
{
  "success": false,
  "statusCode": 400,
  "message": "Email or phone number already exists"
}

// 400 - Invalid ward/zone ID
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid ward ID"
}

// 403 - Cannot update Super Admin
{
  "success": false,
  "statusCode": 403,
  "message": "Cannot update Super Admin account"
}
```

---

### 4. **Get Filtered Users** (Dropdown Helper) ⭐ NEW

**Endpoint:** `GET /users/filter/search`  
**Access:** SUPER_ADMIN only

**Query Parameters:**
```
?role=WARD_ENGINEER
?wardId=uuid
?zoneId=uuid
?isActive=true
?department=ROAD
```

**Example Request:**
```http
GET /admin/users/filter/search?role=WARD_ENGINEER&wardId=abc-123&isActive=true
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "user-uuid",
      "fullName": "Amit Patel",
      "email": "amit.patel@vmc.gov.in",
      "role": "WARD_ENGINEER",
      "department": "ROAD",
      "isActive": true,
      "wardId": "ward-uuid",
      "zoneId": "zone-uuid",
      "ward": {
        "wardNumber": 1,
        "name": "Fatehgunj"
      },
      "zone": {
        "name": "North Zone"
      }
    }
  ],
  "message": "Filtered users retrieved successfully"
}
```

**Frontend Usage - Reassignment Dropdown:**
```javascript
// When reassigning work, get users with same role and ward
const getReassignmentCandidates = async (currentUserId, currentRole, currentWardId) => {
  const response = await fetch(
    `/api/v1/admin/users/filter/search?role=${currentRole}&wardId=${currentWardId}&isActive=true`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const data = await response.json();
  // Filter out current user
  return data.data.filter(user => user.id !== currentUserId);
};
```

---

### 5. **Reassign User's Work** ⭐ NEW

**Endpoint:** `POST /users/:userId/reassign`  
**Access:** SUPER_ADMIN only

**Request Body:**
```json
{
  "toUserId": "target-user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Successfully reassigned 12 active issue(s) from Amit Patel to Rajesh Kumar",
    "reassignedCount": 12,
    "fromUser": {
      "id": "from-user-uuid",
      "fullName": "Amit Patel",
      "role": "WARD_ENGINEER"
    },
    "toUser": {
      "id": "to-user-uuid",
      "fullName": "Rajesh Kumar",
      "role": "WARD_ENGINEER"
    },
    "issues": [
      {
        "ticketNumber": "VMC-2026-000045",
        "status": "IN_PROGRESS",
        "priority": "HIGH"
      },
      {
        "ticketNumber": "VMC-2026-000046",
        "status": "ASSIGNED",
        "priority": "MEDIUM"
      }
    ]
  },
  "message": "Work reassigned successfully"
}
```

**Business Logic:**
- ✅ Only reassigns **ASSIGNED** and **IN_PROGRESS** issues
- ✅ Both users must have the **same role**
- ✅ Both users must be in the **same ward** (for Ward Engineer/Field Worker)
- ✅ Both users must be in the **same zone** (for Zone Officer)
- ✅ Creates **audit log** for transparency
- ✅ Creates **issue history** entries for each reassigned issue
- ✅ Target user must be **active**

**Error Responses:**
```json
// 404 - User not found
{
  "success": false,
  "statusCode": 404,
  "message": "Source user not found"
}

// 400 - No active issues
{
  "success": false,
  "statusCode": 400,
  "message": "No active issues to reassign"
}

// 400 - Different roles
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot reassign work between different roles (WARD_ENGINEER → ZONE_OFFICER)"
}

// 400 - Different wards
{
  "success": false,
  "statusCode": 400,
  "message": "Both users must be assigned to the same ward"
}

// 400 - Target user inactive
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot reassign to inactive user"
}
```

**Frontend Flow:**
```javascript
// 1. Show confirmation dialog
const handleReassign = async (fromUserId) => {
  // 2. Get list of eligible users (same role, ward, active)
  const candidates = await getReassignmentCandidates(fromUserId);
  
  // 3. Show dropdown to select target user
  const toUserId = await showReassignmentDialog(candidates);
  
  // 4. Call reassignment API
  const response = await fetch(`/api/v1/admin/users/${fromUserId}/reassign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ toUserId })
  });
  
  // 5. Show success message with issue count
  const data = await response.json();
  alert(`${data.data.reassignedCount} issues reassigned successfully`);
};
```

---

### 6. **Get User Statistics** ⭐ NEW

**Endpoint:** `GET /users/:userId/statistics`  
**Access:** SUPER_ADMIN only

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "user": {
      "id": "user-uuid",
      "fullName": "Amit Patel",
      "role": "WARD_ENGINEER",
      "isActive": true
    },
    "statistics": {
      "totalAssigned": 45,
      "activeIssues": 12,
      "resolvedIssues": 30,
      "avgResolutionDays": 3.5,
      "resolutionRate": 67
    }
  },
  "message": "User statistics retrieved successfully"
}
```

**Field Descriptions:**
- `totalAssigned`: Total issues ever assigned to this user
- `activeIssues`: Currently ASSIGNED or IN_PROGRESS issues
- `resolvedIssues`: Issues with status RESOLVED or VERIFIED
- `avgResolutionDays`: Average days from assignment to resolution
- `resolutionRate`: Percentage (0-100) of resolved vs total assigned

**Frontend Usage:**
- Display in user profile page
- Show before deactivation to assess workload
- Use to decide if reassignment is needed

---

### 7. **Deactivate User**

**Endpoint:** `PATCH /users/:userId/deactivate`  
**Access:** SUPER_ADMIN only

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Amit Patel",
    "email": "amit.patel@vmc.gov.in",
    "role": "WARD_ENGINEER",
    "isActive": false
  },
  "message": "User deactivated successfully"
}
```

**Important Rules:**
- ✅ Cannot deactivate if user has **active issues** (ASSIGNED or IN_PROGRESS)
- ✅ Must reassign all active issues first
- ✅ Cannot deactivate SUPER_ADMIN accounts
- ✅ **Does NOT delete** - soft deactivation (isActive = false)
- ✅ Preserves all historical data (issues resolved, comments, etc.)

**Error Response:**
```json
// 400 - User has active issues
{
  "success": false,
  "statusCode": 400,
  "message": "Cannot deactivate user with 12 active issue(s). Please reassign them first."
}
```

**Frontend Flow - Deactivation Process:**
```javascript
const handleDeactivate = async (userId) => {
  // 1. Get user statistics to check active issues
  const stats = await fetch(`/api/v1/admin/users/${userId}/statistics`);
  const { activeIssues } = stats.data.statistics;
  
  // 2. If has active issues, show reassignment first
  if (activeIssues > 0) {
    const confirmed = confirm(
      `This user has ${activeIssues} active issues. 
       You must reassign them before deactivation. Proceed?`
    );
    if (confirmed) {
      // Navigate to reassignment page
      navigateToReassignment(userId);
    }
    return;
  }
  
  // 3. Confirm deactivation
  const confirmed = confirm('Are you sure you want to deactivate this user?');
  if (!confirmed) return;
  
  // 4. Deactivate user
  await fetch(`/api/v1/admin/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  alert('User deactivated successfully');
};
```

---

### 8. **Reactivate User** ⭐ NEW

**Endpoint:** `PATCH /users/:userId/reactivate`  
**Access:** SUPER_ADMIN only

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "user-uuid",
    "fullName": "Amit Patel",
    "email": "amit.patel@vmc.gov.in",
    "role": "WARD_ENGINEER",
    "isActive": true
  },
  "message": "User reactivated successfully"
}
```

**Use Cases:**
- Employee returns from leave
- Temporary deactivation was mistake
- Rehiring previous employee

**Error Responses:**
```json
// 400 - Already active
{
  "success": false,
  "statusCode": 400,
  "message": "User is already active"
}

// 404 - User not found
{
  "success": false,
  "statusCode": 404,
  "message": "User not found"
}
```

---

## 🎯 Complete Frontend Workflow Examples

### **Scenario 1: Update Ward Engineer Details**

```javascript
// User Flow:
// 1. Super admin views list of ward engineers
// 2. Clicks "Edit" button on Amit Patel's profile
// 3. Update form opens with pre-filled data

const handleEdit = async (userId) => {
  // Fetch current user data
  const response = await fetch(`/api/v1/admin/users/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await response.json();
  
  // Pre-fill form
  setFormData({
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    role: data.role,
    wardId: data.wardId,
    zoneId: data.zoneId,
    department: data.department
  });
  
  // Show form modal
  openEditModal();
};

const handleUpdate = async (userId, updates) => {
  const response = await fetch(`/api/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  if (response.ok) {
    alert('User updated successfully');
    refreshUserList();
  }
};
```

---

### **Scenario 2: Ward Engineer Leaves Job - Reassignment**

```javascript
// User Flow:
// 1. Ward Engineer "Amit Patel" resigns
// 2. Super admin goes to his profile
// 3. Sees he has 12 active issues
// 4. Clicks "Reassign Work" button
// 5. Selects target engineer from dropdown (same ward only)
// 6. Confirms reassignment
// 7. Deactivates user after reassignment

const handleEmployeeExit = async (userId, userDetails) => {
  // Step 1: Check statistics
  const statsResponse = await fetch(`/api/v1/admin/users/${userId}/statistics`);
  const stats = await statsResponse.json();
  
  if (stats.data.statistics.activeIssues === 0) {
    // No active issues - can deactivate directly
    await deactivateUser(userId);
    return;
  }
  
  // Step 2: Get reassignment candidates (same role + ward)
  const candidatesResponse = await fetch(
    `/api/v1/admin/users/filter/search?role=${userDetails.role}&wardId=${userDetails.wardId}&isActive=true`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const candidates = await candidatesResponse.json();
  
  // Filter out current user
  const eligibleUsers = candidates.data.filter(u => u.id !== userId);
  
  if (eligibleUsers.length === 0) {
    alert('No eligible users found for reassignment. Please assign another engineer to this ward first.');
    return;
  }
  
  // Step 3: Show reassignment dialog
  const toUserId = await showReassignmentDialog(eligibleUsers);
  
  if (!toUserId) return; // User cancelled
  
  // Step 4: Reassign work
  const reassignResponse = await fetch(`/api/v1/admin/users/${userId}/reassign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ toUserId })
  });
  
  const reassignData = await reassignResponse.json();
  
  if (reassignResponse.ok) {
    alert(`${reassignData.data.reassignedCount} issues reassigned successfully`);
    
    // Step 5: Now deactivate the user
    await deactivateUser(userId);
  }
};

const deactivateUser = async (userId) => {
  const confirmed = confirm('Deactivate this user?');
  if (!confirmed) return;
  
  const response = await fetch(`/api/v1/admin/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.ok) {
    alert('User deactivated successfully');
    navigateToUserList();
  }
};
```

---

### **Scenario 3: Zone Officer Transfer to Different Zone**

```javascript
const handleZoneTransfer = async (userId, newZoneId) => {
  // Step 1: Get current zone officer details
  const userResponse = await fetch(`/api/v1/admin/users/${userId}`);
  const user = await userResponse.json();
  
  // Step 2: Check if officer has active issues
  const statsResponse = await fetch(`/api/v1/admin/users/${userId}/statistics`);
  const stats = await statsResponse.json();
  
  if (stats.data.statistics.activeIssues > 0) {
    const proceed = confirm(
      `This officer has ${stats.data.statistics.activeIssues} active issues.
       These will need to be reassigned. Continue?`
    );
    if (!proceed) return;
    
    // Get zone officers in current zone for reassignment
    const candidates = await fetch(
      `/api/v1/admin/users/filter/search?role=ZONE_OFFICER&zoneId=${user.data.zoneId}&isActive=true`
    );
    const eligibleOfficers = candidates.data.filter(u => u.id !== userId);
    
    if (eligibleOfficers.length === 0) {
      alert('No other zone officers in current zone. Please assign one first.');
      return;
    }
    
    // Reassign work
    const toUserId = await showReassignmentDialog(eligibleOfficers);
    await fetch(`/api/v1/admin/users/${userId}/reassign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ toUserId })
    });
  }
  
  // Step 3: Update zone assignment
  const updateResponse = await fetch(`/api/v1/admin/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      zoneId: newZoneId
    })
  });
  
  if (updateResponse.ok) {
    alert('Zone officer transferred successfully');
  }
};
```

---

## 📊 Data Preservation Strategy

### **What Happens to Historical Data?**

When you **deactivate** or **reassign** a user:

✅ **PRESERVED DATA:**
- All issues **resolved** by this user remain in database
- All **comments** made by this user
- All **audit logs** showing who did what
- All **issue history** entries
- **Gamification** points and badges earned
- **User profile** data (just marked inactive)

✅ **DASHBOARD VISIBILITY:**
- In admin dashboard, you can still see "Resolved by: Amit Patel"
- Historical reports show correct resolver names
- Performance metrics are preserved

✅ **REASSIGNMENT TRACKING:**
- Audit log records who reassigned work to whom
- Issue history shows "Reassigned from A to B"
- Frontend can show: "Originally assigned to: Amit Patel, Currently with: Rajesh Kumar"

---

## 🔄 Best Practices for Frontend

### **1. Always Check Active Issues Before Deactivation**
```javascript
const canDeactivate = async (userId) => {
  const stats = await getUserStatistics(userId);
  return stats.data.statistics.activeIssues === 0;
};
```

### **2. Show Reassignment Flow in Modal**
```javascript
// Multi-step wizard:
// Step 1: Show active issues count
// Step 2: Select target user (filtered by role/ward)
// Step 3: Confirm reassignment
// Step 4: Automatic deactivation after success
```

### **3. Filter Candidates Properly**
```javascript
// For Ward Engineer reassignment
const candidates = `/api/v1/admin/users/filter/search?role=WARD_ENGINEER&wardId=${currentWardId}&isActive=true`;

// For Zone Officer reassignment
const candidates = `/api/v1/admin/users/filter/search?role=ZONE_OFFICER&zoneId=${currentZoneId}&isActive=true`;
```

### **4. Show User Statistics in Profile**
```javascript
// Display:
// - Total issues assigned: 45
// - Active issues: 12
// - Resolved issues: 30
// - Resolution rate: 67%
// - Avg resolution time: 3.5 days

// If activeIssues > 0, show warning:
// "⚠️ Cannot deactivate - has 12 active issues. Reassign first."
```

---

## 🎨 UI/UX Recommendations

### **User Profile Page:**
```
┌─────────────────────────────────────────┐
│ Amit Patel                   [Edit]     │
│ Ward Engineer - Road Dept               │
│ Ward 1 - Fatehgunj | North Zone        │
│ ✅ Active                               │
├─────────────────────────────────────────┤
│ Statistics:                             │
│ • Total Assigned: 45 issues             │
│ • Active: 12 issues                     │
│ • Resolved: 30 issues (67% rate)        │
│ • Avg Resolution: 3.5 days              │
├─────────────────────────────────────────┤
│ [Reassign Work]  [Deactivate]          │
└─────────────────────────────────────────┘
```

### **Reassignment Modal:**
```
┌─────────────────────────────────────────┐
│ Reassign Work from Amit Patel           │
├─────────────────────────────────────────┤
│ Active Issues: 12                       │
│                                         │
│ Reassign to:                            │
│ [ Rajesh Kumar ▼ ]                     │
│   - Ward 1 - Fatehgunj                 │
│   - Road Department                     │
│   - Currently handling: 8 issues       │
│                                         │
│ Issues to reassign:                     │
│ • VMC-2026-000045 (HIGH)               │
│ • VMC-2026-000046 (MEDIUM)             │
│ • ... and 10 more                       │
│                                         │
│ [Cancel]           [Confirm Reassign]   │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Guide

### **Test Case 1: Update User Email**
```bash
PUT /api/v1/admin/users/{userId}
{
  "email": "new.email@vmc.gov.in"
}

Expected: 200 OK
```

### **Test Case 2: Transfer Ward Engineer to Different Ward**
```bash
PUT /api/v1/admin/users/{userId}
{
  "wardId": "new-ward-uuid"
}

Expected: 200 OK with updated ward info
```

### **Test Case 3: Reassign Work**
```bash
POST /api/v1/admin/users/{fromUserId}/reassign
{
  "toUserId": "target-user-uuid"
}

Expected: 200 OK with issue count
```

### **Test Case 4: Cannot Deactivate with Active Issues**
```bash
PATCH /api/v1/admin/users/{userId}/deactivate

Expected: 400 Bad Request
{
  "message": "Cannot deactivate user with 12 active issue(s)..."
}
```

### **Test Case 5: Filter Users by Ward**
```bash
GET /api/v1/admin/users/filter/search?wardId={uuid}&isActive=true

Expected: 200 OK with filtered user list
```

---

## 📝 Summary

This API provides a **complete solution** for managing user lifecycle:

✅ **Update** - Change any user details (name, email, ward, zone, department)  
✅ **Reassign** - Transfer active work when employee leaves or transfers  
✅ **Deactivate** - Soft delete without losing historical data  
✅ **Reactivate** - Bring back users if needed  
✅ **Statistics** - Track performance and workload  
✅ **Filter** - Find eligible users for reassignment  

**Key Principle:** Never delete user data permanently. Always preserve work history for dashboard reports and accountability.
