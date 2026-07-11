import React, { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function AuthHelper() {
  const [status, setStatus] = useState('Initializing Google Sign-in...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSignIn = async () => {
      try {
        setStatus('Opening Google login window...');
        const provider = new GoogleAuthProvider();
        
        // Always prompt for account selection to ensure a fresh flow
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await signInWithPopup(auth, provider);
        setStatus('Authentication successful! Syncing session...');
        
        const idToken = await result.user.getIdToken();
        
        if (window.opener) {
          // Post the ID token back to the main tab on the custom domain
          window.opener.postMessage(
            { type: 'AUTH_SUCCESS', idToken }, 
            '*'
          );
          setStatus('Success! Syncing with parent tab and closing window...');
          setTimeout(() => {
            window.close();
          }, 1200);
        } else {
          setStatus('Logged in successfully. You can close this window now.');
        }
      } catch (err: any) {
        console.error('Helper sign-in error:', err);
        setError(err.message || 'An unknown error occurred during sign-in.');
        setStatus('Authentication failed.');
        if (window.opener) {
          window.opener.postMessage(
            { type: 'AUTH_ERROR', error: err.message || 'Authentication failed' }, 
            '*'
          );
        }
      }
    };

    performSignIn();
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white/5 border border-white/10 rounded-[24px] p-8 max-w-sm w-full text-center backdrop-blur-md shadow-[0_8px_32px_rgba(0,229,255,0.05)]">
        <div className="w-12 h-12 bg-[#00E5FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <div className="w-3 h-3 bg-[#00E5FF] rounded-full" />
        </div>
        <h2 className="text-lg font-bold mb-2">Google Authenticator</h2>
        <p className="text-sm text-gray-300 font-mono text-xs mb-4">{status}</p>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-left text-xs text-red-400 mt-4 overflow-auto max-h-32">
            <span className="font-semibold block mb-1">Error Details:</span>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
