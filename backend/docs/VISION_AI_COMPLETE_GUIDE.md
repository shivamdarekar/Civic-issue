# Google Vision AI Integration - Complete Implementation Guide

## Overview
Add AI-powered image analysis to suggest issue category + description after image upload.

## Step 1: Install Dependencies
```bash
cd backend
npm install @google-cloud/vision axios
```

## Step 2: Environment
Add to `.env` (see also [backend/.env.example](backend/.env.example)):
```env
GOOGLE_VISION_KEY_PATH=./google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

Add to `backend/.gitignore`:
```
google-vision-key.json
```

## Step 3: Create Vision Service
Create: `backend/src/services/vision/visionAI.service.ts` (see implementation below).

## Step 4: Add IssuesService method
Add `IssuesService.analyzeImageWithAI(imageUrl)` in [`IssuesService`](backend/src/modules/issues/issue.service.ts).

## Step 5: Add validation schema
Add `analyzeImageSchema` in [`createIssueSchema`](backend/src/modules/issues/issue.schema.ts) file.

## Step 6: Add endpoint
Add controller method in `backend/src/modules/issues/issue.controller.ts` and route in `backend/src/modules/issues/issue.routes.ts`:
- `POST /api/v1/issues/analyze-image`
- Auth: same role set as uploads (use [`requireRole`](backend/src/middlewares/rbac.middleware.ts))

## Step 7: Test
```bash
curl -X POST http://localhost:4000/api/v1/issues/analyze-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"imageUrl":"https://res.cloudinary.com/.../civic-issues/before/xxx.jpg"}'
```

---

## Backend Implementation (copy/paste)

### 1) Vision service

```typescript
// File: backend/src/services/vision/visionAI.service.ts
// (Note: Your existing vision.service.ts is already correct)
```

### 2) Add prisma import to IssueUploadService

```typescript
// File: backend/src/modules/issues/issue.upload.service.ts
// Add this import at the top:
import { prisma } from "../../lib/prisma";
```

### 3) Controller and schema are already correct

✅ `issue.controller.ts` - already imports `analyzeImageSchema`  
✅ `issue.schema.ts` - already exports `analyzeImageSchema`  
✅ `issue.routes.ts` - already configured correctly

---

## Integration Flow

1. **Upload image**: `POST /api/v1/issues/upload/before` → returns `{ url, publicId, mimeType, fileSize }`
2. **Analyze image**: `POST /api/v1/issues/analyze-image` → returns `{ categoryId, description, aiTags, confidence }`
3. **Create issue**: `POST /api/v1/issues` with `media: [{ type: "BEFORE", url, ... }]`

This matches your existing JSON create schema and media persistence in IssuesService.createIssue.