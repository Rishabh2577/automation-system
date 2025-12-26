# 🎬 Studio Pro - Cinematic Product Showcase

Transform static product images into high-end cinematic videos with AI-powered 3D reconstruction and professional motion.

## 🔐 Authentication: Google OAuth Only

This app uses **Google OAuth** for authentication - simple, secure, and professional.

**See [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md) for detailed setup instructions.**

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Google OAuth Client ID (see setup guide)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Google OAuth

1. Get Google OAuth Client ID from [Google Cloud Console](https://console.cloud.google.com/)
2. Create `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_client_id_here
   ```

### 3. Start the App

```bash
npm run dev
```

**Access:** http://localhost:3000

**First time?** You'll see "Login with Google" button. Click it and authenticate!

---

## ✨ Features

### 🎥 Video Generation
- Upload product images
- AI-powered 3D reconstruction
- Cinematic camera movements
- Professional studio lighting
- Multiple aspect ratios (16:9, 9:16)

### 🎨 User Interface
- Modern dark theme
- Glass morphism effects
- Responsive design
- Smooth animations
- Professional layout

---

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Gemini API** for video generation

---

## 📁 Project Structure

```
├── services/
│   └── geminiService.ts       # Video generation
│
├── components/
│   ├── ApiKeyWall.tsx         # API key selection
│   ├── ImageUploader.tsx      # Image upload component
│   ├── LoadingScreen.tsx      # Loading state
│   └── ...                    # Other components
│
└── App.tsx                    # Main application
```

---

## 🌍 Deployment

**Platforms:** Vercel, Netlify, Cloudflare Pages

**Build Command:**
```bash
npm run build
```

**Output Directory:** `dist`

---

## 📦 Dependencies

- react ^19.2.3
- react-dom ^19.2.3
- @google/genai ^1.34.0
- typescript ~5.8.2
- vite ^6.2.0

---

## 📄 License

ISC

---

**Happy coding!** 🚀
