# Quick API Reference - Image Upload

## Environment Setup

```env
# Add to .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API Endpoints

### 1. Upload BEFORE Images
```http
POST /api/v1/issues/upload/before
Authorization: Bearer <token>
Content-Type: multipart/form-data

Field: images (max 5 files, 10MB each)
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "url": "https://res.cloudinary.com/.../civic-issues/before/xyz.jpg",
      "publicId": "civic-issues/before/xyz",
      "mimeType": "image/jpeg",
      "fileSize": 245678
    }
  ],
  "message": "1 image(s) uploaded successfully"
}
```

### 2. Upload AFTER Images
```http
POST /api/v1/issues/upload/after
Authorization: Bearer <token>
Content-Type: multipart/form-data

Field: images (max 5 files, 10MB each)
```

### 3. Create Issue with Images
```http
POST /api/v1/issues
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": "uuid",
  "latitude": 22.3072,
  "longitude": 73.1812,
  "address": "Fatehgunj Circle",
  "description": "Pothole",
  "media": [
    {
      "type": "BEFORE",
      "url": "https://res.cloudinary.com/.../before/xyz.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245678
    }
  ]
}
```

### 4. Add After Media to Issue
```http
POST /api/v1/issues/:issueId/after-media
Authorization: Bearer <token>
Content-Type: application/json

{
  "media": [
    {
      "url": "https://res.cloudinary.com/.../after/abc.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 189456
    }
  ],
  "markResolved": true
}
```

### 5. Delete Image
```http
DELETE /api/v1/issues/upload/delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "publicId": "civic-issues/before/xyz"
}
// OR
{
  "url": "https://res.cloudinary.com/.../before/xyz.jpg"
}
```

## JavaScript Examples

### Upload & Create Issue
```javascript
// 1. Upload images
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);

const uploadRes = await fetch('/api/v1/issues/upload/before', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data: images } = await uploadRes.json();

// 2. Create issue
const issueRes = await fetch('/api/v1/issues', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoryId: "...",
    latitude: 22.3072,
    longitude: 73.1812,
    description: "Pothole",
    media: images.map(img => ({
      type: "BEFORE",
      url: img.url,
      mimeType: img.mimeType,
      fileSize: img.fileSize
    }))
  })
});
```

### Resolve with After Images
```javascript
// 1. Upload after images
const formData = new FormData();
formData.append('images', resolvedImage);

const uploadRes = await fetch('/api/v1/issues/upload/after', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const { data: afterImages } = await uploadRes.json();

// 2. Add to issue
await fetch(`/api/v1/issues/${issueId}/after-media`, {
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

## cURL Examples

### Upload Image
```bash
curl -X POST http://localhost:4000/api/v1/issues/upload/before \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image.jpg"
```

### Create Issue
```bash
curl -X POST http://localhost:4000/api/v1/issues \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "uuid",
    "latitude": 22.3072,
    "longitude": 73.1812,
    "description": "Pothole",
    "media": [{
      "type": "BEFORE",
      "url": "https://res.cloudinary.com/.../before/xyz.jpg",
      "mimeType": "image/jpeg",
      "fileSize": 245678
    }]
  }'
```

### Delete Image
```bash
curl -X DELETE http://localhost:4000/api/v1/issues/upload/delete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"publicId": "civic-issues/before/xyz"}'
```

## File Limits

- **Max files per request**: 5
- **Max file size**: 10MB per file
- **Accepted formats**: jpg, jpeg, png, webp, gif
- **Auto transformations**: 1200x1200px max, quality optimized

## Error Codes

| Status | Error | Solution |
|--------|-------|----------|
| 400 | No files uploaded | Attach files to request |
| 400 | Maximum 5 images allowed | Upload max 5 at once |
| 400 | Only image files allowed | Upload valid image files |
| 400 | File too large | Reduce file size < 10MB |
| 401 | Unauthorized | Include valid JWT token |
| 403 | Forbidden | Check user role permissions |
| 500 | Cloudinary not configured | Add Cloudinary env variables |

## Testing Checklist

- [ ] Can upload single image
- [ ] Can upload multiple images (2-5)
- [ ] Gets error with >5 images
- [ ] Gets error with non-image file
- [ ] Gets error with >10MB file
- [ ] Can create issue with uploaded images
- [ ] Can add after-media to existing issue
- [ ] Can delete image by publicId
- [ ] Can delete image by URL
- [ ] Images appear in Cloudinary dashboard
- [ ] Correct folder structure (before/after)
- [ ] Transformations applied correctly
