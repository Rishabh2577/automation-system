
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/**
 * Google OAuth Client ID
 * REQUIRED: Must be set in .env file as VITE_GOOGLE_CLIENT_ID
 * 
 * Get your Client ID from: https://console.cloud.google.com/
 * See GOOGLE_AUTH_SETUP.md for detailed instructions
 */
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Show helpful error if Client ID is missing
if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
  console.error('❌ GOOGLE CLIENT ID MISSING!');
  console.error('📝 Please set VITE_GOOGLE_CLIENT_ID in your .env file');
  console.error('📖 See GOOGLE_AUTH_SETUP.md for instructions');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        backgroundColor: '#0a0a0a',
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '600px'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>⚠️ Configuration Required</h1>
          <h2 style={{ fontSize: '24px', color: '#ff6b6b', marginBottom: '20px' }}>Google Client ID Missing</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#ccc', marginBottom: '30px' }}>
            To use Google OAuth login, you need to set up your Google Client ID.
          </p>
          <div style={{ 
            textAlign: 'left', 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>📋 Quick Setup:</h3>
            <ol style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Open the <code>.env</code> file in project root</li>
              <li>Replace <code>YOUR_GOOGLE_CLIENT_ID_HERE</code> with your actual Client ID</li>
              <li>Save the file and restart the dev server</li>
            </ol>
          </div>
          <div style={{ 
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '15px',
            borderRadius: '12px',
            fontSize: '14px',
            marginTop: '20px'
          }}>
            <strong>📖 Need help getting a Client ID?</strong><br/>
            See <code>GOOGLE_AUTH_SETUP.md</code> for detailed instructions
          </div>
        </div>
      </div>
    )}
  </React.StrictMode>
);
