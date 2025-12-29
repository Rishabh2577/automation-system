
import React, { useState, useEffect, useCallback } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import { GenerationState, GenerationStatus, ProductImage, AspectRatio } from './types';
import { generateProductVideo } from './services/geminiService';
import ApiKeyWall from './components/ApiKeyWall';
import ImageUploader from './components/ImageUploader';
import LoadingScreen from './components/LoadingScreen';
import GoogleLoginButton from './components/GoogleLoginButton';
import { UserMenu } from './components/UserMenu';
import AdminView from './components/AdminView';

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
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [pendingDownloadUrl, setPendingDownloadUrl] = useState<string | null>(null);
  const [showAdminView, setShowAdminView] = useState<boolean>(false);

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

  // Check API key on mount (no auth required)
  useEffect(() => {
    const checkKey = async () => {
      const exists = await window.aistudio.hasSelectedApiKey();
      setHasKey(exists);
    };
    checkKey();
  }, []);

  // Admin view keyboard shortcut (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminView(prev => !prev);
        console.log('🔐 Admin view toggled');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

      // Close login modal
      setShowLoginModal(false);

      // If there's a pending download, trigger it now
      if (pendingDownloadUrl) {
        handleDownload(pendingDownloadUrl, user);
        setPendingDownloadUrl(null);
      }
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

  /**
   * Track user activity (generation or download)
   */
  const trackActivity = useCallback((action: 'generation' | 'download', videoUrl?: string) => {
    const activity = {
      action,
      timestamp: new Date().toISOString(),
      user: userInfo || { email: 'anonymous', name: 'Anonymous User' },
      aspectRatio,
      imageCount: images.length,
      videoUrl: videoUrl || state.videoUrl
    };

    // Save to localStorage for now (can be sent to backend later)
    const existingHistory = JSON.parse(localStorage.getItem('user_activity_history') || '[]');
    existingHistory.push(activity);
    localStorage.setItem('user_activity_history', JSON.stringify(existingHistory));

    console.log('📊 Activity tracked:', activity);
  }, [userInfo, aspectRatio, images.length, state.videoUrl]);

  /**
   * Handle download with auth gate
   */
  const handleDownloadClick = useCallback((videoUrl: string) => {
    if (!isAuthenticated) {
      // User not logged in - show login modal and queue download
      setPendingDownloadUrl(videoUrl);
      setShowLoginModal(true);
      console.log('🔒 Login required for download');
    } else {
      // User logged in - proceed with download
      handleDownload(videoUrl, userInfo!);
    }
  }, [isAuthenticated, userInfo]);

  /**
   * Actual download execution
   */
  const handleDownload = useCallback((videoUrl: string, user: UserInfo) => {
    // Track download activity
    trackActivity('download', videoUrl);

    // Trigger download
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'product_master.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('✅ Download started for:', user.email);
  }, [trackActivity]);

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

      // Track generation activity (works for anonymous users too)
      trackActivity('generation', videoUrl);
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
  }, [images, aspectRatio, trackActivity]);

  // Show Admin View if toggled (Ctrl+Shift+A)
  if (showAdminView) {
    return <AdminView />;
  }

  // Show API Key wall if needed (no auth required)
  if (hasKey === false) {
    return <ApiKeyWall onKeySelected={() => setHasKey(true)} />;
  }

  const isGenerating = state.status === GenerationStatus.GENERATING;
  const isSelectionDisabled = isGenerating || isAspectRatioLocked;

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 md:py-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[600px] bg-white/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full" />
      </div>

      {state.status === GenerationStatus.GENERATING && (
        <LoadingScreen message={state.progressMessage} />
      )}

      {/* Optional Login Modal - shown when download requires auth */}
      {showLoginModal && (
        <GoogleLoginButton 
          onLoginSuccess={handleGoogleLoginSuccess}
          onClose={() => {
            setShowLoginModal(false);
            setPendingDownloadUrl(null);
          }}
        />
      )}

      {/* User Menu - Fixed to top-right (only shown after login) */}
      {userInfo && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
          <UserMenu userInfo={userInfo} onLogout={handleLogout} />
        </div>
      )}

      <main className="w-full max-w-4xl relative z-10 space-y-8 sm:space-y-12 md:space-y-16">
        <header className="text-center space-y-4 sm:space-y-6 pt-8 sm:pt-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tighter gradient-text px-2">
            GFT Studio +
          </h1>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-light px-4">
            Turn static product images into high-end cinematic commercials. <br className="hidden md:block" />
            3D reconstruction. Studio lighting. Professional motion.
          </p>
        </header>

        {state.status === GenerationStatus.SUCCESS && state.videoUrl ? (
          <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className={`mx-auto glass rounded-2xl sm:rounded-[40px] overflow-hidden shadow-2xl shadow-white/5 ring-1 ring-white/20 ${aspectRatio === '9:16' ? 'max-w-sm aspect-[9/16]' : 'aspect-video'}`}>
              <video
                src={state.videoUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-2">
              <button
                onClick={() => handleDownloadClick(state.videoUrl!)}
                className="px-6 sm:px-10 py-4 sm:py-5 bg-white text-black font-bold text-sm sm:text-base rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/10"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </button>
              <button
                onClick={() => {
                  setState({ status: GenerationStatus.IDLE, progressMessage: '' });
                  setImages([]);
                }}
                className="px-6 sm:px-10 py-4 sm:py-5 glass text-white font-bold text-sm sm:text-base rounded-2xl hover:bg-white/10 active:scale-95 transition-all"
              >
                Create New Video
              </button>
            </div>
          </div>
        ) : (
          <div className="glass p-6 sm:p-8 md:p-10 lg:p-14 rounded-3xl sm:rounded-[50px] space-y-8 sm:space-y-10 md:space-y-12 ring-1 ring-white/10 shadow-2xl relative overflow-hidden group">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

            <section className="space-y-6 sm:space-y-8 relative">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-xs sm:text-sm font-bold border border-white/10">01</span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Product References</h3>
              </div>
              <ImageUploader images={images} setImages={setImages} />
            </section>

            <section className="space-y-6 sm:space-y-8 relative">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 flex items-center justify-center text-xs sm:text-sm font-bold border border-white/10">02</span>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Format Selection</h3>
                </div>
                <button 
                  onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border transition-all duration-300 ${isAspectRatioLocked ? 'bg-white/10 border-white/30 text-white' : 'bg-transparent border-white/5 text-gray-500 hover:text-gray-300'}`}
                  title={isAspectRatioLocked ? "Unlock Aspect Ratio" : "Lock Aspect Ratio"}
                >
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                    {isAspectRatioLocked ? 'Locked' : 'Lock'}
                  </span>
                  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${isAspectRatioLocked ? 'scale-110' : 'scale-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isAspectRatioLocked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all ${
                      aspectRatio === opt.id 
                        ? 'bg-white/10 border-white/40 ring-2 ring-white/20' 
                        : 'bg-white/5 border-white/5 hover:bg-white/[0.07] grayscale opacity-60'
                    } ${isSelectionDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl text-white">
                      {opt.icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base truncate">{opt.label}</p>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest truncate">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-4 sm:pt-6 relative">
              <button
                onClick={handleStartGeneration}
                disabled={images.length === 0 || isGenerating}
                className={`w-full py-5 sm:py-6 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg md:text-xl transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-2xl ${
                  images.length > 0 && !isGenerating
                    ? 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-white/5' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="truncate">Processing...</span>
                  </>
                ) : images.length > 0 ? (
                  <>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    <span className="truncate">Generate Video</span>
                  </>
                ) : (
                  <span className="truncate">Upload Images to Start</span>
                )}
              </button>
            </div>

            {state.status === GenerationStatus.ERROR && (
              <div className="p-4 sm:p-5 bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl flex items-start gap-3 sm:gap-4 text-red-400 animate-in shake-in-1">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-xs sm:text-sm flex-1 min-w-0">
                  <p className="font-bold text-sm sm:text-base mb-1">Engine Latency Error</p>
                  <p className="opacity-70 leading-relaxed break-words">{state.error}</p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
