import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleLoginButtonProps {
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
}

/**
 * Simple Google Login Button
 * 
 * Flow:
 * 1. User clicks "Login with Google"
 * 2. Google handles authentication:
 *    - If already logged into Google → Account chooser appears
 *    - If not logged in → Google login flow (email, password, consent)
 * 3. On success, returns user credentials
 * 4. App extracts user info and logs them in
 */
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-6">
      <div className="max-w-md w-full glass p-8 rounded-3xl text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">Welcome to GFT Studio +</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sign in with your Google account to access cinematic product showcase
          </p>
        </div>

        {/* Google Login Button */}
        <div className="pt-4">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => {
              console.error('Google Login Failed');
            }}
            useOneTap
            theme="filled_black"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 mt-4">
          By signing in, you agree to use Google authentication
        </p>
      </div>
    </div>
  );
};

export default GoogleLoginButton;

