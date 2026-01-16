# Testing Guide - VMC Civic Issue API

## Prerequisites
1. Database should be running (PostgreSQL)
2. Run migrations: `npx prisma migrate dev`
3. Run seed: `npm run prisma:seed`

## Super Admin Credentials
```
Email: superadmin@vmc.gov.in
Password: SuperAdmin@123
```

---

## Postman Testing Workflow

### 1. LOGIN (Super Admin)
```http
POST http://localhost:4000/api/v1/auth/login
Content-Type: application/json

{
  "email": "superadmin@vmc.gov.in",
  "password": "SuperAdmin@123"
}
```

**Expected Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "...",
      "fullName": "VMC Super Administrator",
      "email": "superadmin@vmc.gov.in",
      "role": "SUPER_ADMIN",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "success": true
}
```

**📌 COPY THE TOKEN** - You'll need it for subsequent requests!

---

### 2. REGISTER A ZONE OFFICER
```http
POST http://localhost:4000/api/v1/auth/register
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "fullName": "Rajesh Kumar",
  "email": "rajesh.kumar@vmc.gov.in",
  "phoneNumber": "+919876543211",
  "password": "Officer@123",
  "role": "ZONE_OFFICER",
  "zoneId": "GET_FROM_ZONES_ENDPOINT"
}
```

---

### 3. REGISTER A WARD ENGINEER
```http
POST http://localhost:4000/api/v1/auth/register
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "fullName": "Amit Patel",
  "email": "amit.patel@vmc.gov.in",
  "phoneNumber": "+919876543212",
  "password": "Engineer@123",
  "role": "WARD_ENGINEER",
  "wardId": "GET_FROM_WARDS_ENDPOINT",
  "zoneId": "GET_FROM_ZONES_ENDPOINT"
}
```

---

### 4. REGISTER A FIELD WORKER
```http
POST http://localhost:4000/api/v1/auth/register
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "fullName": "Suresh Yadav",
  "email": "suresh.yadav@vmc.gov.in",
  "phoneNumber": "+919876543213",
  "password": "Worker@123",
  "role": "FIELD_WORKER",
  "wardId": "GET_FROM_WARDS_ENDPOINT",
  "zoneId": "GET_FROM_ZONES_ENDPOINT"
}
```

---

### 5. GET ZONES AND WARDS (To get IDs)
```http
GET http://localhost:4000/api/v1/auth/zones-wards
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response will contain:**
```json
{
  "statusCode": 200,
  "data": {
    "zones": [
      {
        "id": "uuid-here",
        "name": "North Zone",
        "code": "NORTH",
        "wards": [
          {
            "id": "ward-uuid",
            "wardNumber": 1,
            "name": "Fatehgunj"
          },
          ...
        ]
      },
      ...
    ]
  }
}
```

---

### 6. GET ALL USERS
```http
GET http://localhost:4000/api/v1/auth/users
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Testing Notes

### ✅ Authorization Checks to Test

1. **Without Token**: Try accessing `/auth/register` without Bearer token
   - Should return 401 Unauthorized

2. **Non-Super Admin Token**: Try registering a user with a Field Worker token
   - Should return 403 Forbidden

3. **Invalid Role**: Try registering with role "INVALID_ROLE"
   - Should return validation error

4. **Duplicate Email**: Register same user twice
   - Should return 400 "User already exists"

5. **Invalid Ward/Zone ID**: Use non-existent UUID
   - Should return 400 "Invalid ward/zone ID"

---

## Database Seeded Data

### Zones (4)
- North Zone (NORTH)
- South Zone (SOUTH)
- East Zone (EAST)
- West Zone (WEST)

### Wards (19)
1. Fatehgunj (North)
2. Alkapuri (North)
3. Sayajigunj (North)
4. Raopura (North)
5. Mandvi (North)
6. Sama (South)
7. Gorwa (South)
8. Akota (South)
9. Karelibaug (South)
10. Vasna (South)
11. Manjalpur (East)
12. Tandalja (East)
13. Vadsar (East)
14. Waghodia (East)
15. Harni (West)
16. Productivity Road (West)
17. Subhanpura (West)
18. Makarpura (West)
19. Ajwa Road (West)

### Issue Categories (6)
- Pothole (48h SLA)
- Stray Cattle (24h SLA)
- Garbage Dump (24h SLA)
- Drainage/Sewage (12h SLA)
- Street Light (72h SLA)
- Road Damage (96h SLA)

---

## Commands to Run

```powershell
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed

# Start server
npm run dev
```

---

## Environment Variables (.env)
Make sure your `.env` file has:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/civic_db
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```
