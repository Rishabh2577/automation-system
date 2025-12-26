
import React, { useState, useEffect, useCallback } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import { GenerationState, GenerationStatus, ProductImage, AspectRatio } from './types';
import { generateProductVideo } from './services/geminiService';
import ApiKeyWall from './components/ApiKeyWall';
import ImageUploader from './components/ImageUploader';
import LoadingScreen from './components/LoadingScreen';
import GoogleLoginButton from './components/GoogleLoginButton';

interface UserInfo {
  email: string;
  name: string;
  picture?: string;
}

/**
 * Main App Component with Google Authentication
 * 
 * Authentication Flow:
 * 1. Check if user is already logged in (from localStorage)
 * 2. If not → Show Google Login button
 * 3. User clicks "Login with Google"
 * 4. Google handles authentication (account selection or full login)
 * 5. On success → Extract user info, save to state & localStorage
 * 6. User can access the app
 * 7. Logout clears session
 */
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState<boolean>(false);
  const [state, setState] = useState<GenerationState>({
    status: GenerationStatus.IDLE,
    progressMessage: ''
  });

  // Check if user is already logged in on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('google_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserInfo(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('google_user');
      }
    }
  }, []);

  // Check API key when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const checkKey = async () => {
        const exists = await window.aistudio.hasSelectedApiKey();
        setHasKey(exists);
      };
      checkKey();
    }
  }, [isAuthenticated]);

  /**
   * Handle successful Google login
   * Extracts user info from JWT token and saves session
   */
  const handleGoogleLoginSuccess = (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        console.error('No credential received');
        return;
      }

      // Decode JWT token to extract user info
      const token = credentialResponse.credential;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      
      // Extract user information
      const user: UserInfo = {
        email: payload.email || '',
        name: payload.name || '',
        picture: payload.picture || undefined,
      };

      // Save to state and localStorage
      setUserInfo(user);
      setIsAuthenticated(true);
      localStorage.setItem('google_user', JSON.stringify(user));

      console.log('✅ Google login successful:', user.email);
    } catch (error) {
      console.error('❌ Failed to process Google login:', error);
    }
  };

  /**
   * Handle logout
   * Clears session and redirects to login
   */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem('google_user');
    console.log('✅ Logged out successfully');
  };

  const handleStartGeneration = useCallback(async () => {
    if (images.length === 0) return;

    setState({
      status: GenerationStatus.GENERATING,
      progressMessage: 'Initializing Video Generation Engine...'
    });

    try {
      const videoUrl = await generateProductVideo(images, aspectRatio, (msg) => {
        setState(prev => ({ ...prev, progressMessage: msg }));
      });
      setState({
        status: GenerationStatus.SUCCESS,
        progressMessage: '',
        videoUrl
      });
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_RESET_REQUIRED") {
        setHasKey(false);
        setState({ status: GenerationStatus.IDLE, progressMessage: '' });
      } else {
        setState({
          status: GenerationStatus.ERROR,
          progressMessage: '',
          error: err.message || 'An unexpected error occurred during generation.'
        });
      }
    }
  }, [images, aspectRatio]);

  // Show Google Login if not authenticated
  if (!isAuthenticated) {
    return <GoogleLoginButton onLoginSuccess={handleGoogleLoginSuccess} />;
  }

  // Show API Key wall if needed
  if (hasKey === false) {
    return <ApiKeyWall onKeySelected={() => setHasKey(true)} />;
  }

  const isGenerating = state.status === GenerationStatus.GENERATING;
  const isSelectionDisabled = isGenerating || isAspectRatioLocked;

  return (
    <div className="min-h-screen relative flex flex-col items-center px-6 py-12 md:py-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-white/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full" />
      </div>

      {state.status === GenerationStatus.GENERATING && (
        <LoadingScreen message={state.progressMessage} />
      )}

      <main className="w-full max-w-4xl relative z-10 space-y-16">
        <header className="text-center space-y-6 relative">
          {/* User info and logout button */}
          <div className="absolute top-0 right-0 flex items-center gap-3">
            {userInfo && (
              <>
                {userInfo.picture && (
                  <img 
                    src={userInfo.picture} 
                    alt={userInfo.name}
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                )}
                <span className="text-sm text-gray-400 hidden md:block">
                  {userInfo.name}
                </span>
              </>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 glass text-white text-sm font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-2 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            High-Fidelity Pipeline
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter gradient-text">
            Studio Pro
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Turn static product angles into high-end cinematic commercials. <br className="hidden md:block" />
            3D reconstruction. Studio lighting. Professional motion.
          </p>
        </header>

        {state.status === GenerationStatus.SUCCESS && state.videoUrl ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className={`mx-auto glass rounded-[40px] overflow-hidden shadow-2xl shadow-white/5 ring-1 ring-white/20 ${aspectRatio === '9:16' ? 'max-w-sm aspect-[9/16]' : 'aspect-video'}`}>
              <video
                src={state.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={state.videoUrl}
                download="product_master.mp4"
                className="px-10 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Master
              </a>
              <button
                onClick={() => {
                  setState({ status: GenerationStatus.IDLE, progressMessage: '' });
                  setImages([]);
                }}
                className="px-10 py-5 glass text-white font-bold rounded-2xl hover:bg-white/10 active:scale-95 transition-all"
              >
                Create New Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-10 md:p-14 rounded-[50px] space-y-12 ring-1 ring-white/10 shadow-2xl relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <section className="space-y-8 relative">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-bold border border-white/10">01</span>
                <h3 className="text-2xl font-semibold tracking-tight">Product References</h3>
              </div>
              <ImageUploader images={images} setImages={setImages} />
            </section>

            <section className="space-y-8 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-sm font-bold border border-white/10">02</span>
                  <h3 className="text-2xl font-semibold tracking-tight">Format Selection</h3>
                </div>
                <button 
                  onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${isAspectRatioLocked ? 'bg-white/10 border-white/30 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300'}`}
                  title={isAspectRatioLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isAspectRatioLocked ? 'Locked' : 'Lock'}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isAspectRatioLocked ? 'scale-110' : 'scale-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isAspectRatioLocked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: '16:9', label: 'Landscape', sub: 'Widescreen Ads', icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2" strokeWidth="2"/></svg>
                  )},
                  { id: '9:16', label: 'Portrait', sub: 'Reels & Shorts', icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="12" height="20" x="6" y="2" rx="2" strokeWidth="2"/></svg>
                  )},
                ].map(opt => (
                  <button
                    key={opt.id}
                    disabled={isSelectionDisabled}
                    onClick={() => setAspectRatio(opt.id as AspectRatio)}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                      aspectRatio === opt.id 
                        ? 'bg-white/10 border-white/40 ring-2 ring-white/20' 
                        : 'bg-white/5 border-white/5 hover:bg-white/[0.07] grayscale opacity-60'
                    } ${isSelectionDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="p-3 bg-white/5 rounded-xl text-white">
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-6 relative">
              <button
                onClick={handleStartGeneration}
                disabled={images.length === 0 || isGenerating}
                className={`w-full py-6 rounded-3xl font-bold text-xl transition-all flex items-center justify-center gap-4 shadow-2xl ${
                  images.length > 0 && !isGenerating
                    ? 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-white/5' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : images.length > 0 ? (
                  <>
                    <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    Render Cinematic Master
                  </>
                ) : (
                  'Upload Images to Start'
                )}
              </button>
            </div>

            {state.status === GenerationStatus.ERROR && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 text-red-400 animate-in shake-in-1">
                <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="font-bold text-base mb-1">Engine Latency Error</p>
                  <p className="opacity-70 leading-relaxed">{state.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="pt-16 pb-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-gray-600 text-[10px] uppercase tracking-[0.3em] font-bold">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Neural Reconstruction Active
          </div>
          <div className="flex gap-10">
            <span>Volumetric 3D</span>
            <span>Raytraced Shadows</span>
            <span>Studio Master</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
