# Google Vision AI Setup Guide

## 1. Install Dependencies

```bash
cd backend
npm install @google-cloud/vision
```

## 2. Google Cloud Setup

### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Vision API:
   - Go to APIs & Services > Library
   - Search for "Cloud Vision API"
   - Click Enable

### Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Name: `civic-vision-ai`
4. Role: `Cloud Vision AI Service Agent`
5. Create and download JSON key file
6. Save as `google-vision-key.json` in backend root (add to .gitignore)

## 3. Environment Variables

Add to your `.env` file:

```env
# ============= GOOGLE VISION AI =============
GOOGLE_VISION_KEY_PATH=./google-vision-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

## 4. Security Notes

- Never commit `google-vision-key.json` to git
- Add to `.gitignore`: `google-vision-key.json`
- For production, use Google Cloud IAM roles instead of key files

## 5. Test Setup

```bash
# Test if Vision API is working
npm run dev
# Check logs for Vision AI initialization
```