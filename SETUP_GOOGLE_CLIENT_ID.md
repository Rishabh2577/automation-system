# 🔑 Get Your Google Client ID (5 Minutes)

## ⚠️ REQUIRED: Your app needs a Google Client ID to work

You're seeing an error because the Google Client ID is not configured yet.

---

## 📋 Quick Steps:

### 1️⃣ Go to Google Cloud Console

Open: **https://console.cloud.google.com/**

### 2️⃣ Create/Select Project

- Click "Select a project" (top left)
- Click "NEW PROJECT"
- Name it: "Studio Pro" (or anything you want)
- Click "Create"

### 3️⃣ Enable Google+ API

- In the left menu: **APIs & Services** → **Library**
- Search for: **Google+ API**
- Click on it
- Click **"Enable"**

### 4️⃣ Create OAuth Credentials

- Go to: **APIs & Services** → **Credentials**
- Click **"+ CREATE CREDENTIALS"** (top)
- Select: **OAuth client ID**
- If asked, configure consent screen:
  - User Type: **External**
  - App name: **Studio Pro**
  - User support email: your email
  - Developer contact: your email
  - Save and Continue → Save and Continue → Save and Continue
- Back to Create OAuth client ID:
  - Application type: **Web application**
  - Name: **Studio Pro Web Client**
  - **Authorized JavaScript origins** → Add URIs:
    - `http://localhost:3000`
    - `http://localhost:5173`
  - Click **CREATE**

### 5️⃣ Copy Client ID

- A popup appears with your credentials
- **Copy the "Client ID"** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
- Click "OK"

### 6️⃣ Add to .env File

Open `.env` file in your project root and replace:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

With your actual Client ID:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
```

### 7️⃣ Restart Dev Server

In terminal:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Done!

Now open **http://localhost:3000** and the Google login should work!

---

## 🎯 What This Does:

- **Google Account Chooser**: If you're already logged into Google, you'll see your accounts
- **Google Login**: If not logged in, Google handles the full login flow
- **Instant Login**: After selecting an account, you're in!

---

## 🔧 Troubleshooting

### Error: "redirect_uri_mismatch"

**Fix:** Add `http://localhost:3000` to Authorized JavaScript origins in Google Console

### Error: "access_denied"

**Fix:** Make sure you enabled Google+ API

### Client ID still not working?

1. Double-check the Client ID is copied correctly (no spaces)
2. Make sure you saved the `.env` file
3. Restart the dev server
4. Clear browser cache

---

## 📝 Example .env File

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456ghi789.apps.googleusercontent.com
```

---

**Need more help?** Check `GOOGLE_AUTH_SETUP.md` for detailed documentation.

**Ready to go!** 🚀

