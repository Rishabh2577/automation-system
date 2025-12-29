# Product Flow Documentation

## Overview
This app allows users to generate product videos without requiring login, but requires authentication to download the generated videos. All user activity is tracked for analytics.

---

## User Flow

### 1. **Public Access (No Login Required)**

#### What Users Can Do:
- ✅ Access the main UI immediately
- ✅ Upload product images (up to 5)
- ✅ Select video format (Landscape/Portrait)
- ✅ Generate videos with AI
- ✅ Preview generated videos

#### What Requires Login:
- 🔒 **Download videos** - Login modal appears when clicking "Download Video"

---

### 2. **Authentication Flow**

#### Login Trigger Point:
1. **Download Button**: Clicking "Download Video" when not logged in

#### Login Process:
```
User clicks Download
   ↓
Login modal opens (Google Sign-In)
   ↓
User authenticates with Google
   ↓
Login modal closes automatically
   ↓
Download starts immediately
   ↓
User stays logged in for future downloads
```

#### Persistent Login:
- Users remain logged in across sessions (localStorage)
- "Sign In" button → Shows "User Menu" after login
- User can logout from dropdown menu

---

### 3. **Activity Tracking**

#### Tracked Events:

**Video Generation** (Anonymous + Authenticated):
```json
{
  "action": "generation",
  "timestamp": "2025-12-29T12:00:00Z",
  "user": {
    "email": "user@example.com" | "anonymous",
    "name": "User Name" | "Anonymous User"
  },
  "aspectRatio": "16:9",
  "imageCount": 5,
  "videoUrl": "blob:..."
}
```

**Video Download** (Authenticated Only):
```json
{
  "action": "download",
  "timestamp": "2025-12-29T12:01:00Z",
  "user": {
    "email": "user@example.com",
    "name": "User Name"
  },
  "aspectRatio": "16:9",
  "imageCount": 5,
  "videoUrl": "blob:..."
}
```

#### Storage:
- **Frontend**: localStorage (`user_activity_history`)
- **Backend** (optional): MySQL database via API endpoints

---

## Admin Dashboard

### Access:
**Keyboard Shortcut**: `Ctrl + Shift + A` (Windows) / `Cmd + Shift + A` (Mac)

### Features:
1. **Activity Statistics**:
   - Total activities
   - Total video generations
   - Total downloads
   - Unique users

2. **Activity Log**:
   - Real-time activity feed
   - Filter by action type (All/Generation/Download)
   - User details (name, email)
   - Timestamp, format, image count

3. **Export**:
   - Download activity history as JSON
   - For external analysis or backup

4. **Clear History**:
   - Remove all tracked activities
   - Confirmation dialog prevents accidents

---

## Technical Implementation

### Frontend Components

#### Modified Files:
1. **App.tsx**
   - Removed mandatory login
   - Added optional login modal
   - Implemented download gate
   - Added activity tracking
   - Admin view toggle

2. **GoogleLoginButton.tsx**
   - Added close button for modal
   - Support for optional mode

3. **AdminView.tsx** (New)
   - Admin dashboard component
   - Activity visualization
   - Export functionality

### Backend API Endpoints

#### Activity Tracking:

**POST** `/api/activity/track`
```json
{
  "action": "generation" | "download",
  "userId": "user@example.com",
  "userName": "User Name",
  "aspectRatio": "16:9",
  "imageCount": 5,
  "videoUrl": "https://..."
}
```

**GET** `/api/activity/history`
```
Query params:
- action: filter by 'generation' | 'download'
- userId: filter by user email
- limit: number of records (default: 100)
- offset: pagination offset (default: 0)
```

**GET** `/api/activity/stats`
```json
{
  "total": 150,
  "byAction": {
    "generation": 100,
    "download": 50
  },
  "uniqueUsers": 25,
  "recentActivity": [...],
  "topUsers": [...]
}
```

### Database Schema

```sql
CREATE TABLE user_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action ENUM('generation', 'download') NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  aspect_ratio VARCHAR(10) NOT NULL,
  image_count INT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_email (user_email),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

## Setup Instructions

### 1. Database Setup (Optional)
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE gft_studio;
USE gft_studio;

# Run schema
source backend/database/activity_schema.sql;
```

### 2. Environment Variables
```env
# Backend (.env in /backend folder)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gft_studio
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Start Services
```bash
# Frontend
npm run dev

# Backend (separate terminal)
cd backend
npm start
```

---

## User Experience Benefits

✅ **Frictionless Entry**: Users can try the product immediately without signup barriers

✅ **Smart Authentication**: Login only when necessary (download)

✅ **Seamless Flow**: Pending downloads auto-trigger after login

✅ **Analytics**: Track user behavior for product improvements

✅ **Admin Insights**: Real-time dashboard for monitoring usage

---

## Future Enhancements

### Potential Additions:
1. **Email Notifications**: Send download links via email
2. **Usage Limits**: Limit generations for anonymous users
3. **Premium Features**: Unlock HD downloads for paid users
4. **Social Sharing**: Share videos without downloading
5. **Video Gallery**: User library of generated videos
6. **API Integration**: Send activity data to analytics platforms

---

## Security Considerations

### Current Implementation:
- ✅ Google OAuth for authentication
- ✅ Client-side activity tracking (localStorage)
- ✅ No sensitive data in activity logs
- ✅ Admin view requires keyboard shortcut (not exposed in UI)

### Production Recommendations:
1. **Admin Authentication**: Add password/auth for admin dashboard
2. **Backend Validation**: Verify user tokens on API calls
3. **Rate Limiting**: Prevent abuse of generation endpoint
4. **Data Encryption**: Encrypt activity data at rest
5. **GDPR Compliance**: Add privacy policy and data deletion options

---

## Support

For questions or issues:
- Check console logs (F12 → Console)
- Admin dashboard: `Ctrl + Shift + A`
- Activity history: localStorage key `user_activity_history`

---

**Last Updated**: December 29, 2025
**Version**: 1.0.0

