import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
}

/**
 * Custom Google Login Button with labs.google/fx style
 * 
 * Flow:
 * 1. User clicks custom pink pill button
 * 2. Wraps Google's official login button with custom styling
 * 3. Google handles authentication (same as before)
 * 4. Returns credentials to app
 */
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6">
      <div className="max-w-md w-full glass p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-center space-y-5 sm:space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Title */}
        <div className="px-2 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2 whitespace-nowrap inline-flex items-baseline justify-center gap-1">
            <span>Welcome to GFT Studio</span><span className="inline-block">+</span>
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
            Sign in with your Google account to access cinematic product showcase
          </p>
        </div>

        {/* Custom Styled Google Sign-In Button - labs.google/fx style */}
        <div className="pt-2 sm:pt-4 flex justify-center">
          {/* Wrapper with custom pink pill styling that overlays the Google button */}
          <div className="relative inline-block">
            {/* Actual Google Login button (invisible but clickable) */}
            <div className="opacity-0 pointer-events-auto">
              <GoogleLogin
                onSuccess={onLoginSuccess}
                onError={() => {
                  console.error('Google Login Failed');
                }}
                useOneTap={false}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>

            {/* Custom styled overlay (non-interactive, just visual) */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 px-8 py-3 rounded-full bg-white hover:bg-gray-200 active:scale-95 transition-all duration-200 shadow-xl shadow-white/10 pointer-events-none">
              {/* Google G Icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-black font-bold text-base whitespace-nowrap">Sign in</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4 px-2">
          By signing in, you agree to use Google authentication
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;

