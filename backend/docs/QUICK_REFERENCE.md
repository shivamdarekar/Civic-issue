# Quick Reference - Complete API Overview

## Base URLs
```
Auth:   /api/v1/auth/*
Admin:  /api/v1/admin/*
Issues: /api/v1/issues/*
Users:  /api/v1/users/*
```

## 🔐 Authentication (Public)
```
POST   /api/v1/auth/login               Login
POST   /api/v1/auth/forgot-password     Request OTP
POST   /api/v1/auth/verify-otp          Verify OTP
POST   /api/v1/auth/reset-password      Reset password
```

## 🔐 Authentication (Protected)
```
POST   /api/v1/auth/logout              Logout
GET    /api/v1/auth/profile             Get full profile
```

## 👤 User Module (All Protected)
```
GET    /api/v1/users/dashboard/field-worker      Field worker stats
GET    /api/v1/users/dashboard/ward-engineer     Ward engineer stats
GET    /api/v1/users/dashboard/assigned          Assigned issues

PATCH  /api/v1/users/profile                     Update name/phone
POST   /api/v1/users/change-password             Change password
GET    /api/v1/users/activity                    View activity log
```

## 🎫 Issues Module
```
GET    /api/v1/issues/categories         Issue categories
GET    /api/v1/issues/stats              Issue statistics
POST   /api/v1/issues                    Create issue
GET    /api/v1/issues                    List issues
GET    /api/v1/issues/:id                Get issue by ID

POST   /api/v1/issues/upload/before      Upload BEFORE images
POST   /api/v1/issues/upload/after       Upload AFTER images
DELETE /api/v1/issues/upload/delete      Delete image

POST   /api/v1/issues/:id/after-media    Add after-media
PATCH  /api/v1/issues/:id/status         Update status
POST   /api/v1/issues/:id/comments       Add comment
PATCH  /api/v1/issues/:id/reassign       Reassign issue
PATCH  /api/v1/issues/:id/verify         Verify resolution
```

## 👑 Admin Module (Super Admin Only)
```
POST   /api/v1/admin/register-user       Register new user
GET    /api/v1/admin/users               List users
GET    /api/v1/admin/users/:id           Get user by ID
PATCH  /api/v1/admin/users/:id           Update user
POST   /api/v1/admin/users/:id/reassign  Reassign user's work
PATCH  /api/v1/admin/users/:id/deactivate  Deactivate user
PATCH  /api/v1/admin/users/:id/reactivate  Reactivate user

GET    /api/v1/admin/dashboard           System dashboard
GET    /api/v1/admin/zones               List zones
GET    /api/v1/admin/zones/:id           Zone details
GET    /api/v1/admin/wards               List wards
GET    /api/v1/admin/wards/:id           Ward details
```

## 🔑 Common Headers
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

## 📊 Response Format
```json
{
  "statusCode": 200,
  "data": { },
  "message": "Success message",
  "success": true
}
```

## ⚠️ Error Format
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false
}
```

## 🎯 Role Permissions

### FIELD_WORKER
- ✅ Create issues
- ✅ Upload images
- ✅ View own dashboard
- ✅ Update own profile
- ✅ Change password

### WARD_ENGINEER
- ✅ All FIELD_WORKER permissions
- ✅ View ward dashboard
- ✅ Update issue status
- ✅ Reassign issues
- ✅ Add after-media

### ZONE_OFFICER
- ✅ All WARD_ENGINEER permissions
- ✅ Verify issue resolution
- ✅ Reject resolution
- ✅ Zone-wide statistics

### SUPER_ADMIN
- ✅ All permissions
- ✅ User management
- ✅ System dashboard
- ✅ Zone/Ward management

## 📁 File Upload Limits
```
Max File Size:  10MB per file
Max Files:      5 files per request
Allowed Types:  image/* (jpg, png, webp, gif)
Storage:        Cloudinary
```

## 🔒 Password Requirements
```
Min Length:     8 characters
Must Contain:   Uppercase, Lowercase, Number
Examples:       Password123, SecurePass1
```

## 📱 Phone Number Format
```
Valid:   9876543210
Valid:   +919876543210
Invalid: 1234567890 (doesn't start with 6-9)
Invalid: 98765 (too short)
```

## 🎯 Query Parameters

### Pagination
```
?page=1&pageSize=20       Default for lists
?limit=10                 Default for dashboards
```

### Filters
```
?status=OPEN
?priority=HIGH
?wardId=uuid
?zoneId=uuid
?department=ROAD
?q=search+term
```

## 🚀 Quick Test Commands

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'
```

### Get Profile
```bash
curl http://localhost:4000/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Create Issue
```bash
curl -X POST http://localhost:4000/api/v1/issues \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId":"uuid",
    "latitude":22.3072,
    "longitude":73.1812,
    "description":"Pothole on main road"
  }'
```

### Upload Image
```bash
curl -X POST http://localhost:4000/api/v1/issues/upload/before \
  -H "Authorization: Bearer <token>" \
  -F "images=@image1.jpg"
```

### Update Profile
```bash
curl -X PATCH http://localhost:4000/api/v1/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","phoneNumber":"9876543210"}'
```

## 📚 Documentation Files
```
/docs/IMAGE_UPLOAD_GUIDE.md       - Cloudinary integration
/docs/CLOUDINARY_SUMMARY.md       - Implementation details
/docs/USER_MODULE_GUIDE.md        - User module API
/docs/API_QUICK_REFERENCE.md      - API examples
/docs/CODE_REVIEW_SUMMARY.md      - Code review results
```

## 🎯 Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"

# App
PORT=4000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"
```

## ✅ Status Codes
```
200  OK                  - Success
201  Created             - Resource created
400  Bad Request         - Invalid input
401  Unauthorized        - Authentication failed
403  Forbidden           - Insufficient permissions
404  Not Found           - Resource not found
409  Conflict            - Duplicate entry
500  Server Error        - Server error
```

## 🔄 Issue Status Flow
```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → VERIFIED

Alternative paths:
- RESOLVED → REOPENED (if rejected)
- Any → REJECTED (admin action)
```

## 📊 Priority Levels
```
LOW       - Non-urgent issues
MEDIUM    - Normal priority (default)
HIGH      - Important issues
CRITICAL  - Emergency issues
```

## 🎯 Department Types
```
ROAD
STORM_WATER_DRAINAGE
SEWAGE_DISPOSAL
WATER_WORKS
STREET_LIGHT
BRIDGE_CELL
SOLID_WASTE_MANAGEMENT
HEALTH
TOWN_PLANNING
```

## 🔧 Development Commands
```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev

# Type checking
npm run typecheck

# Run tests
npm test
```

## 🐛 Debugging
```bash
# Check database connection
npx prisma db pull

# View database in browser
npx prisma studio

# Check logs
tail -f logs/error.log

# Test API endpoint
curl -v http://localhost:4000/api/health
```

---

**For detailed documentation, see `/docs/` folder**
