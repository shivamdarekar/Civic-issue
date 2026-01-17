# Issue Creation Workflow - With Google Vision API Integration

## 📱 Complete Frontend Flow

### Current Implementation (Vision API Ready)

Our upload service is **perfectly structured** for Google Vision API integration. Here's the complete workflow:

---

## Step-by-Step Flow

### 1️⃣ Worker Captures/Selects Photo

```javascript
// Mobile app or web interface
const capturePhoto = async () => {
  // Camera capture or gallery selection
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Camera // or CameraSource.Photos
  });
  
  return photo;
};
```

---

### 2️⃣ Upload Photo to Server

```javascript
const uploadPhoto = async (photoFile) => {
  const formData = new FormData();
  formData.append('images', photoFile);
  
  // Upload to your backend
  const response = await fetch('/api/v1/issues/upload/before', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const result = await response.json();
  
  return result.data[0]; // { url, publicId, mimeType, fileSize }
};
```

**Backend Response:**
```json
{
  "statusCode": 200,
  "data": [{
    "url": "https://res.cloudinary.com/.../civic-issues/before/abc123.jpg",
    "publicId": "civic-issues/before/abc123",
    "mimeType": "image/jpeg",
    "fileSize": 245678
  }],
  "message": "1 image(s) uploaded successfully"
}
```

---

### 3️⃣ [FUTURE] Analyze with Google Vision API

```javascript
// This is where you'll integrate Google Vision API
const analyzeImageWithVision = async (imageUrl) => {
  // Option 1: Call Vision API from frontend (requires API key management)
  // Option 2: Call your backend endpoint that calls Vision API (recommended)
  
  const response = await fetch('/api/v1/issues/analyze-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  });
  
  const analysis = await response.json();
  
  return analysis.data;
};

// Vision API might return:
{
  "suggestedCategory": "Pothole",
  "categoryId": "uuid-of-pothole-category",
  "description": "Large pothole detected on road surface, approximately 30cm diameter",
  "severity": "HIGH",
  "detectedObjects": ["road_damage", "asphalt", "crack"],
  "confidence": 0.92,
  "landmarks": [],
  "textDetected": []
}
```

**Backend Endpoint for Vision API (Future Implementation):**
```typescript
// backend/src/modules/issues/issue.controller.ts
static analyzeImage = asyncHandler(async (req: Request, res: Response) => {
  const { imageUrl } = req.body;
  
  const analysis = await IssuesService.analyzeImageWithVision(imageUrl);
  
  res.status(200).json(
    new ApiResponse(200, analysis, "Image analyzed successfully")
  );
});

// backend/src/modules/issues/issue.service.ts
static async analyzeImageWithVision(imageUrl: string) {
  // Import Google Vision API client
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  
  // Analyze image
  const [result] = await client.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: 'LABEL_DETECTION' },
      { type: 'OBJECT_LOCALIZATION' },
      { type: 'TEXT_DETECTION' },
      { type: 'LANDMARK_DETECTION' }
    ]
  });
  
  // Map Vision API results to your issue categories
  const suggestedCategory = mapLabelsToCategory(result.labelAnnotations);
  const description = generateDescription(result);
  const severity = determineSeverity(result);
  
  return {
    suggestedCategory,
    description,
    severity,
    detectedObjects: result.labelAnnotations.map(l => l.description),
    confidence: result.labelAnnotations[0]?.score || 0
  };
}
```

---

### 4️⃣ Get GPS Location

```javascript
const getLocation = async () => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation not supported');
  }
  
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
```

---

### 5️⃣ Show Form with Pre-filled Data

```javascript
const IssueCreationForm = () => {
  const [formData, setFormData] = useState({
    categoryId: '',
    description: '',
    priority: 'MEDIUM',
    latitude: null,
    longitude: null,
    address: '',
    uploadedImages: []
  });
  const [loading, setLoading] = useState(false);
  
  const handlePhotoCapture = async () => {
    setLoading(true);
    try {
      // Step 1: Capture photo
      const photo = await capturePhoto();
      
      // Step 2: Upload to server
      const uploadedImage = await uploadPhoto(photo);
      
      // Step 3: Analyze with Vision API (future)
      const analysis = await analyzeImageWithVision(uploadedImage.url);
      
      // Step 4: Get GPS location
      const location = await getLocation();
      
      // Step 5: Pre-fill form
      setFormData({
        categoryId: analysis.categoryId,
        description: analysis.description,
        priority: analysis.severity,
        latitude: location.latitude,
        longitude: location.longitude,
        address: '', // Can use reverse geocoding
        uploadedImages: [uploadedImage]
      });
      
      // Show form to user with pre-filled data
      showForm();
      
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    // Step 6: Submit issue
    const response = await fetch('/api/v1/issues', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        categoryId: formData.categoryId,
        description: formData.description,
        priority: formData.priority,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        media: formData.uploadedImages.map(img => ({
          type: 'BEFORE',
          url: img.url,
          mimeType: img.mimeType,
          fileSize: img.fileSize
        }))
      })
    });
    
    const result = await response.json();
    
    if (result.statusCode === 201) {
      alert('Issue created successfully!');
      // Navigate to issue details or list
    }
  };
  
  return (
    <div>
      {loading && <Spinner />}
      
      {!formData.uploadedImages.length ? (
        <button onClick={handlePhotoCapture}>
          📷 Capture Issue Photo
        </button>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Show uploaded image */}
          <img src={formData.uploadedImages[0].url} alt="Issue" />
          
          {/* Pre-filled, editable fields */}
          <select value={formData.categoryId} onChange={...}>
            <option>Pothole</option>
            <option>Street Light</option>
            {/* ... */}
          </select>
          
          <textarea 
            value={formData.description} 
            onChange={...}
            placeholder="Description (AI-generated, you can edit)"
          />
          
          <select value={formData.priority} onChange={...}>
            <option>LOW</option>
            <option>MEDIUM</option>
            <option>HIGH</option>
            <option>CRITICAL</option>
          </select>
          
          <input 
            type="text" 
            value={`${formData.latitude}, ${formData.longitude}`}
            disabled
            placeholder="GPS Location (auto-captured)"
          />
          
          <button type="submit">✅ Submit Issue</button>
        </form>
      )}
    </div>
  );
};
```

---

## 🎯 Backend Endpoints Mapping

### Current Endpoints (Already Perfect)

```
1. Upload Image
   POST /api/v1/issues/upload/before
   ↓
   Returns: { url, publicId, mimeType, fileSize }

2. Create Issue
   POST /api/v1/issues
   ↓
   Body: {
     categoryId,
     description,
     latitude,
     longitude,
     media: [{ type: "BEFORE", url }]
   }
```

### Future Endpoint (For Vision API)

```
3. Analyze Image (NEW - Add this)
   POST /api/v1/issues/analyze-image
   ↓
   Body: { imageUrl }
   ↓
   Returns: {
     suggestedCategory,
     categoryId,
     description,
     severity,
     confidence
   }
```

---

## 🔮 Future Implementation: Vision API Integration

### Backend Service Method

```typescript
// backend/src/modules/issues/issue.service.ts

import vision from '@google-cloud/vision';

export class IssuesService {
  // ... existing methods ...
  
  static async analyzeImageWithVision(imageUrl: string) {
    const client = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_VISION_CREDENTIALS_PATH
    });
    
    try {
      const [result] = await client.annotateImage({
        image: { source: { imageUri: imageUrl } },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
          { type: 'TEXT_DETECTION' }
        ]
      });
      
      // Map Vision API labels to your issue categories
      const suggestedCategory = this.mapLabelsToCategory(
        result.labelAnnotations || []
      );
      
      // Generate description from detected objects
      const description = this.generateDescriptionFromLabels(
        result.labelAnnotations || []
      );
      
      // Determine severity based on detected objects
      const severity = this.determineSeverity(
        result.labelAnnotations || []
      );
      
      return {
        suggestedCategory,
        description,
        severity,
        detectedObjects: result.labelAnnotations?.map(l => ({
          name: l.description,
          confidence: l.score
        })) || [],
        detectedText: result.textAnnotations?.[0]?.description || null,
        confidence: result.labelAnnotations?.[0]?.score || 0
      };
      
    } catch (error) {
      console.error('Vision API error:', error);
      throw new ApiError(500, 'Failed to analyze image with Vision API');
    }
  }
  
  private static mapLabelsToCategory(labels: any[]) {
    // Map Vision API labels to your issue categories
    const labelDescriptions = labels.map(l => l.description.toLowerCase());
    
    // Check for road issues
    if (labelDescriptions.some(l => 
      ['pothole', 'road', 'asphalt', 'crack', 'damage'].includes(l)
    )) {
      return { name: 'Pothole', categoryId: 'uuid-pothole-category' };
    }
    
    // Check for drainage issues
    if (labelDescriptions.some(l => 
      ['drain', 'water', 'flood', 'sewage', 'drainage'].includes(l)
    )) {
      return { name: 'Drainage Issue', categoryId: 'uuid-drainage-category' };
    }
    
    // Check for street light issues
    if (labelDescriptions.some(l => 
      ['light', 'lamp', 'streetlight', 'lighting'].includes(l)
    )) {
      return { name: 'Street Light', categoryId: 'uuid-light-category' };
    }
    
    // Default
    return { name: 'Other', categoryId: null };
  }
  
  private static generateDescriptionFromLabels(labels: any[]) {
    const topLabels = labels
      .slice(0, 5)
      .map(l => l.description)
      .join(', ');
    
    return `Detected: ${topLabels}. Please provide more details about the issue.`;
  }
  
  private static determineSeverity(labels: any[]): Priority {
    const labelDescriptions = labels.map(l => l.description.toLowerCase());
    
    // Critical indicators
    if (labelDescriptions.some(l => 
      ['danger', 'emergency', 'critical', 'severe'].includes(l)
    )) {
      return 'CRITICAL';
    }
    
    // High priority indicators
    if (labelDescriptions.some(l => 
      ['damage', 'broken', 'hazard', 'unsafe'].includes(l)
    )) {
      return 'HIGH';
    }
    
    // Default to medium
    return 'MEDIUM';
  }
}
```

### Backend Controller

```typescript
// backend/src/modules/issues/issue.controller.ts

export class IssuesController {
  // ... existing methods ...
  
  static analyzeImage = asyncHandler(async (req: Request, res: Response) => {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      throw new ApiError(400, 'imageUrl is required');
    }
    
    const analysis = await IssuesService.analyzeImageWithVision(imageUrl);
    
    res.status(200).json(
      new ApiResponse(200, analysis, "Image analyzed successfully")
    );
  });
}
```

### Backend Route

```typescript
// backend/src/modules/issues/issue.routes.ts

// Add this route
router.post(
  "/analyze-image",
  requireRole(["FIELD_WORKER", "WARD_ENGINEER", "ZONE_OFFICER", "SUPER_ADMIN"]),
  validateRequest(analyzeImageSchema, 'body'),
  IssuesController.analyzeImage
);
```

### Validation Schema

```typescript
// backend/src/modules/issues/issue.schema.ts

export const analyzeImageSchema = z.object({
  imageUrl: z.string().url("Must be a valid URL")
});
```

---

## 📊 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FIELD WORKER APP                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  1. Capture/Select Photo from Camera or Gallery             │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  2. Upload to Server                                         │
│     POST /api/v1/issues/upload/before                        │
│     → Returns: { url, publicId, mimeType, fileSize }         │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  3. [FUTURE] Analyze with Vision API                         │
│     POST /api/v1/issues/analyze-image                        │
│     → Returns: { suggestedCategory, description, severity }  │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  4. Get GPS Location (getCurrentPosition)                    │
│     → Returns: { latitude, longitude }                       │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  5. Show Form with Pre-filled Data                           │
│     - Category: From Vision API                              │
│     - Description: From Vision API (editable)                │
│     - Priority: From Vision API                              │
│     - Location: From GPS (auto-filled)                       │
│     - Image: Already uploaded                                │
│                                                              │
│     Worker can EDIT any field or PROCEED as-is               │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  6. Submit Issue                                             │
│     POST /api/v1/issues                                      │
│     Body: {                                                  │
│       categoryId,                                            │
│       description,                                           │
│       priority,                                              │
│       latitude,                                              │
│       longitude,                                             │
│       media: [{ type: "BEFORE", url }]                       │
│     }                                                        │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│  ✅ Issue Created Successfully                               │
│     - Issue saved to database                                │
│     - Media linked to issue                                  │
│     - Auto-assigned to ward engineer                         │
│     - Email notification sent                                │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Why Current Implementation is Perfect

### 1. **Image Upload Separated from Issue Creation** ✅
- Images uploaded first, URL returned
- URL can be sent to Vision API
- No need to re-upload after analysis

### 2. **Flexible Form Submission** ✅
- Pre-fill from Vision API
- Worker can edit before submitting
- GPS location captured separately

### 3. **Clean Separation of Concerns** ✅
- Upload service handles images
- Vision API handles analysis (future)
- GPS service handles location
- Issue service handles creation

### 4. **Error Handling** ✅
- If upload fails, no issue created
- If Vision API fails, worker can manually fill form
- If GPS fails, worker can enter location manually

---

## 🚀 What You Need to Add (Future)

### 1. Vision API Endpoint
```typescript
POST /api/v1/issues/analyze-image
Body: { imageUrl: "https://..." }
```

### 2. Environment Variables
```env
GOOGLE_VISION_CREDENTIALS_PATH=/path/to/service-account.json
# OR
GOOGLE_VISION_API_KEY=your-api-key
```

### 3. Install Package
```bash
npm install @google-cloud/vision
```

### 4. Category Mapping Logic
Map Vision API labels to your issue categories

---

## 📝 Summary

### Current Implementation: ✅ PERFECT for Your Workflow

Your workflow is:
1. Upload photo → ✅ We have this
2. Analyze with Vision API → ⏳ Add this later
3. Pre-fill form → ✅ Frontend handles this
4. Get GPS location → ✅ Frontend handles this
5. Submit issue → ✅ We have this

**No changes needed to current backend!** Just add the Vision API endpoint when ready.

### For Now (Without Vision API)

Worker flow:
1. Capture photo
2. Upload photo → Get URL
3. GPS captures location
4. Worker manually selects category and fills description
5. Submit issue with image URL and location

### Later (With Vision API)

Same flow, but step 3 becomes:
3. Vision API analyzes image → Pre-fills category and description
4. Worker can edit or proceed
5. GPS captures location
6. Submit issue

**Your current module structure is 100% ready for this!** 🎉
