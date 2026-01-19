# Department Integration - Complete Guide

## 📋 Overview
This document describes the department structure for Vadodara Municipal Corporation (VMC) Civic Issue Monitoring System.

---

## 🏢 Complete Department List

### Core Infrastructure (6)
| Department | Code | Description | Common Issues |
|------------|------|-------------|---------------|
| Road Department | `ROAD` | Road maintenance, potholes | Potholes, road damage, cracks |
| Storm Water Drainage | `STORM_WATER_DRAINAGE` | Drainage systems | Blocked drains, waterlogging |
| Sewage Disposal | `SEWAGE_DISPOSAL` | Sewage management | Sewage overflow, blockages |
| Water Works | `WATER_WORKS` | Water supply | No water, low pressure, leakage |
| Street Light | `STREET_LIGHT` | Street lighting | Non-working lights, damaged poles |
| Bridge Cell | `BRIDGE_CELL` | Bridge maintenance | Bridge damage, structural issues |

### Sanitation & Environment (2)
| Department | Code | Description | Common Issues |
|------------|------|-------------|---------------|
| Solid Waste Management | `SOLID_WASTE_MANAGEMENT` | Garbage collection | Illegal dumping, missed collection |
| Parks & Gardens | `PARKS_GARDENS` | Parks, trees, greenery | Tree cutting, fallen trees, garden maintenance |

### Public Safety & Compliance (3)
| Department | Code | Description | Common Issues |
|------------|------|-------------|---------------|
| Health | `HEALTH` | Public health | Stray animals, health hazards |
| Encroachment | `ENCROACHMENT` | Unauthorized occupation | Illegal construction, footpath encroachment |
| Fire | `FIRE` | Fire safety | Fire hazards, safety violations |

### Planning & Utilities (2)
| Department | Code | Description | Common Issues |
|------------|------|-------------|---------------|
| Town Planning | `TOWN_PLANNING` | Urban planning | Planning violations, zoning issues |
| Electrical | `ELECTRICAL` | Electrical infrastructure | Electrical hazards, transformer issues |

**Total: 13 Departments**

---

## 🗂️ Issue Categories with Department Mapping

### Default Categories (Seed Data)
```typescript
[
  { name: 'Pothole', department: 'ROAD', slaHours: 48 },
  { name: 'Stray Cattle', department: 'HEALTH', slaHours: 24 },
  { name: 'Garbage Dump', department: 'SOLID_WASTE_MANAGEMENT', slaHours: 24 },
  { name: 'Street Light Not Working', department: 'STREET_LIGHT', slaHours: 12 },
  { name: 'Water Supply Issue', department: 'WATER_WORKS', slaHours: 24 },
  { name: 'Drainage Blockage', department: 'STORM_WATER_DRAINAGE', slaHours: 24 },
  { name: 'Sewage Issue', department: 'SEWAGE_DISPOSAL', slaHours: 12 },
  { name: 'Tree Cutting Required', department: 'PARKS_GARDENS', slaHours: 48 },
  { name: 'Illegal Encroachment', department: 'ENCROACHMENT', slaHours: 72 }
]
```

### Additional Categories (Admin Can Add)
- **BRIDGE_CELL**: Bridge damage, structural cracks
- **FIRE**: Fire hazards, unsafe structures
- **ELECTRICAL**: Electrical hazards, transformer issues
- **TOWN_PLANNING**: Unauthorized construction, zoning violations

---

## 🔄 Department Flow

```
Issue Created
    ↓
Category Selected → Department Auto-Assigned
    ↓
Ward Detected → Find Ward Engineer with Matching Department
    ↓
Auto-Assign to Engineer (if available)
    ↓
Engineer Processes Issue
```

---

## 👥 User Roles & Department Access

### Role-Department Matrix

| Role | Department Required? | Department Usage |
|------|---------------------|------------------|
| **SUPER_ADMIN** | ❌ No | Can see all departments |
| **ZONE_OFFICER** | ❌ No | Can see all departments in zone |
| **WARD_ENGINEER** | ✅ **YES** | Must have ONE department |
| **FIELD_WORKER** | ❌ No | No department restriction |
| **CITIZEN** | ❌ No | Not applicable |

---

## 📊 Department Assignment Rules

### For Ward Engineers
```typescript
// MUST have department
{
  role: 'WARD_ENGINEER',
  department: 'ROAD',  // Required!
  wardId: 'uuid',      // Required!
  zoneId: 'uuid'       // Required!
}
```

### For Other Roles
```typescript
// Department must be null
{
  role: 'FIELD_WORKER',
  department: null,    // Must be null
  wardId: 'uuid',      // Optional
  zoneId: null         // Optional
}
```

---

## 🔧 Integration Points

### 1. Database Schema
**File:** `prisma/schema.prisma`
```prisma
enum Department {
  ROAD
  STORM_WATER_DRAINAGE
  SEWAGE_DISPOSAL
  WATER_WORKS
  STREET_LIGHT
  BRIDGE_CELL
  SOLID_WASTE_MANAGEMENT
  HEALTH
  TOWN_PLANNING
  PARKS_GARDENS
  ENCROACHMENT
  FIRE
  ELECTRICAL
}

model User {
  department Department? // Optional, required for WARD_ENGINEER
}

model IssueCategory {
  department Department? // Optional, for auto-routing
}
```

### 2. Zod Validation Schemas
**Files:** 
- `src/modules/admin/admin.schema.ts`
- `src/modules/issues/issue.schema.ts`

```typescript
const DepartmentEnum = z.enum([
  "ROAD", "STORM_WATER_DRAINAGE", "SEWAGE_DISPOSAL", 
  "WATER_WORKS", "STREET_LIGHT", "BRIDGE_CELL",
  "SOLID_WASTE_MANAGEMENT", "HEALTH", "TOWN_PLANNING",
  "PARKS_GARDENS", "ENCROACHMENT", "FIRE", "ELECTRICAL"
]);
```

### 3. TypeScript Types
**File:** `src/types/admin.types.ts`
```typescript
export type Department =
  | "ROAD"
  | "STORM_WATER_DRAINAGE"
  | "SEWAGE_DISPOSAL"
  | "WATER_WORKS"
  | "STREET_LIGHT"
  | "BRIDGE_CELL"
  | "SOLID_WASTE_MANAGEMENT"
  | "HEALTH"
  | "TOWN_PLANNING"
  | "PARKS_GARDENS"
  | "ENCROACHMENT"
  | "FIRE"
  | "ELECTRICAL";
```

### 4. Admin Service
**File:** `src/modules/admin/admin.service.ts`
```typescript
static async getDepartments() {
  return [
    { value: 'ROAD', label: 'Road Department' },
    { value: 'STORM_WATER_DRAINAGE', label: 'Storm Water Drainage' },
    // ... all 13 departments
  ];
}
```

### 5. Issue Assignment Logic
**File:** `src/modules/issues/issue.service.ts`
```typescript
// Auto-assign based on category department
const assigneeId = await pickAssigneeId({
  wardId,
  department: category.department ?? null,
});
```

---

## ✅ Validation Rules

### User Registration
```typescript
// Ward Engineer MUST have department
if (role === 'WARD_ENGINEER' && !department) {
  throw new ApiError(400, "Department is required for Ward Engineers");
}

// Other roles CANNOT have department
if (role !== 'WARD_ENGINEER' && department) {
  throw new ApiError(400, "Department can only be assigned to Ward Engineers");
}
```

### User Update
```typescript
// Cannot assign department to non-engineers
if (role && role !== 'WARD_ENGINEER' && department) {
  return false; // Validation fails
}

// Cannot remove department from engineer
if (role === 'WARD_ENGINEER' && department === null) {
  return false; // Validation fails
}
```

---

## 🎯 Filter & Query Support

### Issue Filtering by Department
```typescript
// GET /api/v1/issues?department=ROAD
const issues = await IssuesService.listIssues({
  department: 'ROAD'
});
```

### User Filtering by Department
```typescript
// GET /api/v1/admin/users?department=WATER_WORKS
const users = await AdminService.listUsers({
  department: 'WATER_WORKS'
});
```

### Dashboard Queries
```typescript
// Ward Engineer Dashboard - filters by their department
const dashboard = await UserDashboardService.getWardEngineerDashboard({
  wardId: 'uuid',
  department: 'ROAD' // From user profile
});
```

---

## 🗄️ Database Migration

### After Schema Changes
```bash
# Generate migration
npx prisma migrate dev --name add_new_departments

# Apply migration
npx prisma migrate deploy

# Update seed data
npx prisma db seed
```

### Seeding Categories with Departments
```bash
# Run seed
npm run seed

# This will create:
# - 9 issue categories
# - Each mapped to appropriate department
# - Ready for auto-assignment
```

---

## 📝 Department Usage Examples

### 1. Creating Ward Engineer with Department
```javascript
POST /api/v1/admin/register
{
  "fullName": "Rajesh Kumar",
  "email": "rajesh@vmc.gov.in",
  "phoneNumber": "9876543210",
  "password": "Engineer@123",
  "role": "WARD_ENGINEER",
  "wardId": "ward-uuid",
  "zoneId": "zone-uuid",
  "department": "ROAD"  // ✅ Required
}
```

### 2. Creating Issue with Auto-Assignment
```javascript
POST /api/v1/issues
{
  "categoryId": "pothole-uuid",  // Category has department: "ROAD"
  "latitude": 22.3072,
  "longitude": 73.1812,
  "description": "Large pothole"
}

// Backend automatically:
// 1. Gets category department (ROAD)
// 2. Finds ward from coordinates
// 3. Searches for WARD_ENGINEER in that ward with ROAD department
// 4. Auto-assigns if found
```

### 3. Filtering Issues by Department
```javascript
GET /api/v1/issues?department=ROAD&status=OPEN

// Returns all open ROAD department issues
```

---

## 🚨 Common Errors & Solutions

### Error: "Department is required for Ward Engineers"
**Cause:** Creating WARD_ENGINEER without department
**Solution:** Always include department field
```javascript
{
  "role": "WARD_ENGINEER",
  "department": "ROAD" // ✅ Add this
}
```

### Error: "Department can only be assigned to Ward Engineers"
**Cause:** Assigning department to FIELD_WORKER or other role
**Solution:** Remove department field
```javascript
{
  "role": "FIELD_WORKER",
  // ❌ Don't include department
}
```

### Error: "Invalid department on user profile"
**Cause:** Database has department value not in enum
**Solution:** Update database or add to enum

---

## 📈 Department Statistics

### Available Analytics
- Issues by department
- SLA compliance by department  
- Average resolution time by department
- Engineer workload by department
- Department-wise trends

### Example Query
```sql
SELECT 
  ic.department,
  COUNT(i.id) as total_issues,
  AVG(EXTRACT(EPOCH FROM (i.resolved_at - i.created_at))/3600) as avg_hours
FROM issues i
JOIN issue_categories ic ON ic.id = i.category_id
WHERE i.resolved_at IS NOT NULL
GROUP BY ic.department;
```

---

## ✅ Verification Checklist

- [x] **Schema Updated** - All 13 departments in Prisma enum
- [x] **Seed Data Updated** - Categories have department assignments
- [x] **Validation Schemas Updated** - Zod schemas match enum
- [x] **TypeScript Types Updated** - Type definitions match
- [x] **Service Methods Updated** - getDepartments() returns all
- [x] **Assignment Logic Works** - Auto-routing by department
- [x] **API Endpoints Work** - Filter and query support
- [x] **User Registration Works** - Validation enforces rules
- [x] **Dashboard Queries Work** - Department-specific filtering

---

## 🎯 Best Practices

1. **Always validate department for Ward Engineers**
   - Frontend should enforce required field
   - Backend validates in schema and service

2. **Use department for smart assignment**
   - Categories should have department set
   - System auto-assigns to matching engineer

3. **Filter dashboards by department**
   - Ward engineers see only their department issues
   - Zone officers see all departments

4. **Maintain consistent labels**
   - Use AdminService.getDepartments() for dropdowns
   - Don't hardcode department lists

5. **Document custom categories**
   - When adding new categories, assign appropriate department
   - Update this document with common mappings

---

**Last Updated:** January 2026  
**Status:** ✅ Fully Integrated
