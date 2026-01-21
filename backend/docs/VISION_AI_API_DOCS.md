# Vision AI Image Analysis - API Documentation

## Overview
AI-powered image analysis endpoint that automatically detects civic issue categories and generates descriptions from uploaded images using Google Vision AI.

---

## API Endpoint

### Analyze Image with AI
**POST** `/api/v1/issues/analyze-image`

Analyzes an uploaded image to suggest issue category and description using Google Vision AI.

#### Authentication
- **Required**: JWT Bearer token
- **Roles**: `FIELD_WORKER`, `WARD_ENGINEER`, `ZONE_OFFICER`, `SUPER_ADMIN`

#### Request Body
```json
{
  "imageUrl": "string (required)"
}
```

**Parameters:**
- `imageUrl` (string, required): Valid Cloudinary URL of the uploaded image

#### Response

**Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "categoryName": "Garbage Management",
    "description": "Garbage dumping observed at the reported location.",
    "aiTags": ["garbage", "trash", "waste", "dump", "litter"],
    "confidence": 0.85,
    "detectedLabels": ["Waste", "Litter", "Garbage", "Plastic"]
  },
  "message": "Image analyzed successfully"
}
```

**Response Fields:**
- `categoryName`: Name of suggested category (null if no confident match)
- `description`: AI-generated description or fallback message
- `aiTags`: Array of detected tags (max 10)
- `confidence`: AI confidence score (0-1)
- `detectedLabels`: Raw Vision AI labels

**Error Responses:**
```json
// 400 Bad Request
{
  "success": false,
  "message": "Must be a valid URL",
  "statusCode": 400
}

// 401 Unauthorized
{
  "success": false,
  "message": "Access token is required",
  "statusCode": 401
}

// 403 Forbidden
{
  "success": false,
  "message": "Insufficient permissions",
  "statusCode": 403
}

// 500 Internal Server Error
{
  "success": false,
  "message": "Failed to analyze image with Vision AI",
  "statusCode": 500
}
```

---

## Complete Workflow

### Step 1: Upload Image
```http
POST /api/v1/issues/upload/before
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

files: [image files]
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg",
      "publicId": "civic-issues/before/abc123",
      "mimeType": "image/jpeg",
      "fileSize": 245760
    }
  ],
  "message": "1 image(s) uploaded successfully"
}
```

### Step 2: Analyze Image
```http
POST /api/v1/issues/analyze-image
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "imageUrl": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categoryName": "Garbage Management",
    "description": "Garbage dumping observed at the reported location.",
    "aiTags": ["garbage", "trash", "waste", "dump", "litter"],
    "confidence": 0.85,
    "detectedLabels": ["Waste", "Litter", "Garbage", "Plastic"]
  },
  "message": "Image analyzed successfully"
}
```

### Step 3: Create Issue (Pre-filled)
```http
POST /api/v1/issues
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "description": "Garbage dumping observed at the reported location.",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi"
  },
  "media": [
    {
      "type": "BEFORE",
      "url": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg",
      "publicId": "civic-issues/before/abc123",
      "mimeType": "image/jpeg",
      "fileSize": 245760
    }
  ]
}
```

---

## Example Usage

### cURL Example
```bash
# Step 1: Upload image
curl -X POST "http://localhost:4000/api/v1/issues/upload/before" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "files=@/path/to/image.jpg"

# Step 2: Analyze image
curl -X POST "http://localhost:4000/api/v1/issues/analyze-image" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "imageUrl": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg"
  }'

# Step 3: Create issue with AI suggestions
curl -X POST "http://localhost:4000/api/v1/issues" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "description": "Garbage dumping observed at the reported location.",
    "location": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Connaught Place, New Delhi"
    },
    "media": [...]
  }'
```

### JavaScript/Fetch Example
```javascript
// Step 1: Upload image
const formData = new FormData();
formData.append('files', imageFile);

const uploadResponse = await fetch('/api/v1/issues/upload/before', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const uploadData = await uploadResponse.json();
const imageUrl = uploadData.data[0].url;

// Step 2: Analyze image
const analyzeResponse = await fetch('/api/v1/issues/analyze-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ imageUrl })
});

const analysis = await analyzeResponse.json();

// Step 3: Create issue with AI suggestions (frontend matches categoryName to get ID)
const createResponse = await fetch('/api/v1/issues', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    categoryId: getCategoryIdByName(analysis.data.categoryName), // Frontend function to match name to ID
    description: analysis.data.description,
    location: userLocation,
    media: uploadData.data
  })
});
```

---

## Supported Categories

The AI can detect and suggest the following civic issue categories:

| Category | Keywords | Priority |
|----------|----------|----------|
| **Sewage** | sewage, sewerage, manhole, septic, sewer pipe | 1 (Highest) |
| **Water Supply** | water supply, tap, pipeline, water pipe, water tank, bore well | 2 |
| **Drainage** | storm drain, waterlogging, flood, drainage block | 3 |
| **Garbage** | garbage, trash, waste, dump, litter, refuse, rubbish | 4 |
| **Pothole** | pothole, road damage, asphalt, crack, pavement, road surface | 4 |
| **Stray Cattle** | cow, buffalo, cattle, bull, ox | 4 |
| **Street Light** | street light, lamp, lighting, light pole, illumination | 4 |
| **Tree Cutting** | tree, branch, fallen tree, vegetation, plant | 4 |
| **Encroachment** | construction, building, structure, encroachment, illegal | 4 |

---

## AI Confidence Thresholds

- **Minimum Vision Confidence**: 0.6 (60%)
- **Minimum Keyword Matches**: 1
- **Weak Evidence Threshold**: 0.6 (60%)

If confidence is below threshold, the API returns `categoryId: null` for manual selection.

---

## Rate Limiting & Caching

- **Caching**: Results cached for 5 minutes per image URL
- **Rate Limiting**: Recommended to implement per-user limits
- **Cost Optimization**: Hybrid approach (imageUri → buffer fallback) minimizes latency

---

## Error Handling

The API gracefully handles failures:
- **Vision AI unavailable**: Returns fallback response with `categoryId: null`
- **Invalid image URL**: Returns 400 Bad Request
- **Network issues**: Automatic retry with buffer download
- **Authentication errors**: Standard JWT error responses

All errors maintain the workflow - users can always proceed with manual category selection.