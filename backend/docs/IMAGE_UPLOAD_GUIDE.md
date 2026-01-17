# Image Upload System - Civic Issue Monitoring

## Overview

The image upload system is fully integrated into the Issues module, following the project's controller/service architecture pattern. Images are stored on Cloudinary and metadata (URL, mimeType, fileSize) is saved in the PostgreSQL database.

## Architecture

### File Structure
```
backend/src/modules/issues/
├── issue.controller.ts      # Upload endpoints (uploadBeforeImages, uploadAfterImages, deleteImage)
├── issue.service.ts          # Business logic for issue creation with media
├── issue.upload.service.ts   # Image upload service (new)
├── issue.routes.ts           # Routes including upload endpoints
└── issue.schema.ts           # Validation schemas

backend/src/utils/
├── cloudinary.ts             # Cloudinary configuration and helpers
└── multer.ts                 # File upload middleware configuration
```

## Database Schema

The `IssueMedia` model stores image metadata:

```prisma
model IssueMedia {
  id        String    @id @default(uuid())
  issueId   String    # Foreign key to Issue
  issue     Issue     @relation(...)
  type      MediaType # Enum: BEFORE or AFTER
  url       String    # Cloudinary URL
  mimeType  String?   # e.g., "image/jpeg"
  fileSize  Int?      # In bytes
  createdAt DateTime  @default(now())
}
```

## Cloudinary Configuration

### Environment Variables

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Get credentials from: https://cloudinary.com/console

### Image Organization

Images are stored in folders:
- **BEFORE images**: `civic-issues/before/`
- **AFTER images**: `civic-issues/after/`

### Transformations Applied

All uploaded images automatically get:
- Max dimensions: 1200x1200px (maintains aspect ratio)
- Quality: auto:good (optimized compression)
- Format: auto (best format for user's browser)

## API Endpoints

### 1. Upload BEFORE Images (Issue Creation)

**Endpoint**: `POST /api/v1/issues/upload/before`

**Authorization**: Field Worker, Ward Engineer, Zone Officer, Super Admin

**Request**:
```http
POST /api/v1/issues/upload/before
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: [file1.jpg, file2.jpg] (max 5 files, 10MB each)
```

**Response**:
```json
{
  "statusCode": 200,
  "data": [
    {
      "url": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg",
      "publicId": "civic-issues/before/abc123",
      "mimeType": "image/jpeg",
      "fileSize": 245678
    }
  ],
  "message": "2 image(s) uploaded successfully"
}
```

### 2. Upload AFTER Images (Resolution)

**Endpoint**: `POST /api/v1/issues/upload/after`

**Authorization**: Field Worker, Ward Engineer

**Request**:
```http
POST /api/v1/issues/upload/after
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: [resolved1.jpg, resolved2.jpg] (max 5 files, 10MB each)
```

**Response**: Same structure as BEFORE upload

### 3. Delete Image

**Endpoint**: `DELETE /api/v1/issues/upload/delete`

**Authorization**: Field Worker, Ward Engineer, Zone Officer, Super Admin

**Request**:
```json
{
  "publicId": "civic-issues/before/abc123"
}
// OR
{
  "url": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg"
}
```

**Response**:
```json
{
  "statusCode": 200,
  "data": { "deleted": true },
  "message": "Image deleted successfully"
}
```

## Complete Workflow

### Field Worker Creates Issue with Images

```javascript
// Step 1: Upload images first
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const uploadResponse = await fetch('/api/v1/issues/upload/before', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data: uploadedImages } = await uploadResponse.json();
// uploadedImages = [{ url, publicId, mimeType, fileSize }, ...]

// Step 2: Create issue with uploaded image URLs
const issueResponse = await fetch('/api/v1/issues', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoryId: "uuid-of-category",
    latitude: 22.3072,
    longitude: 73.1812,
    address: "Fatehgunj Circle",
    description: "Large pothole causing traffic issues",
    media: uploadedImages.map(img => ({
      type: "BEFORE",
      url: img.url,
      mimeType: img.mimeType,
      fileSize: img.fileSize
    }))
  })
});
```

### Engineer Resolves Issue with After Images

```javascript
// Step 1: Upload after images
const formData = new FormData();
formData.append('images', resolvedImage1);
formData.append('images', resolvedImage2);

const uploadResponse = await fetch('/api/v1/issues/upload/after', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data: afterImages } = await uploadResponse.json();

// Step 2: Add after-media to issue and mark resolved
const resolveResponse = await fetch(`/api/v1/issues/${issueId}/after-media`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    media: afterImages.map(img => ({
      url: img.url,
      mimeType: img.mimeType,
      fileSize: img.fileSize
    })),
    markResolved: true
  })
});
```

## Error Handling

### Common Errors

1. **Cloudinary Not Configured**
   - Status: 500
   - Message: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
   - Solution: Add Cloudinary credentials to `.env`

2. **No Files Uploaded**
   - Status: 400
   - Message: "No files uploaded"
   - Solution: Ensure files are attached to request

3. **File Size Exceeded**
   - Status: 400
   - Message: "File too large"
   - Solution: Reduce file size below 10MB per file

4. **Too Many Files**
   - Status: 400
   - Message: "Maximum 5 images allowed"
   - Solution: Upload max 5 images at once

5. **Invalid File Type**
   - Status: 400
   - Message: "Only image files are allowed"
   - Solution: Upload only image files (jpg, jpeg, png, webp)

## Testing

### Manual Testing with cURL

**Upload BEFORE images:**
```bash
curl -X POST http://localhost:4000/api/v1/issues/upload/before \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

**Delete image:**
```bash
curl -X DELETE http://localhost:4000/api/v1/issues/upload/delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"publicId": "civic-issues/before/abc123"}'
```

## Code Organization

### Why Upload Logic is in Issues Module?

1. **Cohesion**: Image uploads are exclusively for issues, not a generic feature
2. **Consistency**: Follows project pattern (controller → service → database)
3. **Maintainability**: All issue-related logic in one module
4. **Service Layer**: `IssueUploadService` handles Cloudinary operations
5. **Business Logic**: `IssuesService` handles database and workflow

### Benefits of This Architecture

✅ Single Responsibility: Each service has one purpose  
✅ Testability: Services can be unit tested independently  
✅ Reusability: Upload service can be imported elsewhere if needed  
✅ Error Handling: Centralized in services, not routes  
✅ Type Safety: Full TypeScript support throughout  

## Maintenance

### Cleanup Old Images

If an issue is deleted, you should also clean up its images:

```typescript
// In issue.service.ts when deleting issue
import { IssueUploadService } from './issue.upload.service';

// Get media URLs
const media = await prisma.issueMedia.findMany({
  where: { issueId },
  select: { url: true }
});

// Delete from Cloudinary
await IssueUploadService.deleteMultipleImages(
  media.map(m => m.url)
);

// Delete issue (cascade deletes media records)
await prisma.issue.delete({ where: { id: issueId } });
```

### Monitor Storage Usage

Check Cloudinary dashboard for:
- Storage limits
- Bandwidth usage
- Transformation credits

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT
2. **Role-Based Access**: Different roles have different permissions
3. **File Type Validation**: Only images allowed (multer filter)
4. **File Size Limits**: 10MB per file, max 5 files
5. **Public IDs**: Extracted securely from URLs
6. **Environment Variables**: Credentials never exposed in code

## Performance Optimization

1. **Memory Storage**: Files held in memory (not disk) for faster uploads
2. **Parallel Uploads**: Multiple files uploaded concurrently
3. **Transformations**: Applied server-side by Cloudinary
4. **CDN Delivery**: Cloudinary serves via global CDN
5. **Auto Format**: Best format chosen automatically

## Future Enhancements

- [ ] Image compression before upload (client-side)
- [ ] Progress tracking for large uploads
- [ ] Thumbnail generation
- [ ] Geolocation tagging (EXIF data)
- [ ] Duplicate image detection
- [ ] Batch deletion via admin panel
