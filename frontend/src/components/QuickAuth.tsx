'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Declare Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

type AuthMethod = 'email' | 'sms' | null;
type AuthStep = 'method' | 'code' | 'google';

interface QuickAuthProps {
  onAuthComplete: (account: string, method: 'email' | 'sms') => void;
}

const MYKEYS_API_URL = import.meta.env.VITE_MYKEYS_API_URL || 'https://mykeys.zip';

export default function QuickAuth({ onAuthComplete }: QuickAuthProps) {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null);
  const [step, setStep] = useState<AuthStep>('method');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setCodeSent] = useState(false);

  const handleMethodSelect = (method: 'email' | 'sms') => {
    setAuthMethod(method);
    setError('');
  };

  const handleRequestCode = async () => {
    if (!authMethod) return;
    
    const identifier = authMethod === 'email' ? email : phoneNumber;
    if (!identifier) {
      setError(`Please enter your ${authMethod === 'email' ? 'email' : 'phone number'}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = authMethod === 'email' 
        ? { email } 
        : { phoneNumber };

      const response = await fetch(`${MYKEYS_API_URL}/api/auth/request-mfa-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send code');
      }

      setCodeSent(true);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = authMethod === 'email'
        ? { email, code }
        : { phoneNumber, code };

      const response = await fetch(`${MYKEYS_API_URL}/api/auth/verify-mfa-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Invalid verification code');
      }

      const data = await response.json();
      
      // Store anonymous_id if provided by backend, or generate one
      const anonymousId = data.anonymous_id || data.user_id || (() => {
        // Generate anonymous ID if not provided
        const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        return id;
      })();
      
      // Store anonymous_id in localStorage to mark user as authenticated
      if (typeof window !== 'undefined') {
        localStorage.setItem('anonymous_id', anonymousId);
      }

      // Code verified - now show Google login option
      setStep('google');
      if (authMethod) {
        onAuthComplete(authMethod === 'email' ? email : phoneNumber, authMethod);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Load Google Identity Services
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google?.accounts?.id) {
        setGoogleLoaded(true);
        initializeGoogleSignIn();
      }
    };

    // Check if already loaded
    if (window.google?.accounts?.id) {
      checkGoogleLoaded();
    } else {
      // Wait for script to load
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          checkGoogleLoaded();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (!window.google?.accounts?.id) {
          setError('Failed to load Google Sign-In. Please refresh the page.');
        }
      }, 5000);
    }
  }, [step]);

  const initializeGoogleSignIn = () => {
    if (!window.google?.accounts?.id || !googleButtonRef.current) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    if (!clientId) {
      // Fallback: use popup OAuth flow
      console.warn('Google Client ID not configured, using popup flow');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render button
      if (googleButtonRef.current && step === 'google') {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          locale: 'en',
        });
      }
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
      // Fallback handled by handleGoogleLogin button click
    }
  };

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      setError('');

      // Send credential to backend for verification
      const anonymousId = localStorage.getItem('anonymous_id');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      // Try to verify credential with backend
      try {
        const verifyResponse = await fetch(`${apiUrl}/api/auth/google/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
            anonymous_id: anonymousId,
          }),
        });

        if (verifyResponse.ok) {
          const data = await verifyResponse.json();
          
          // Update anonymous_id if backend provides a new one
          if (data.anonymous_id) {
            localStorage.setItem('anonymous_id', data.anonymous_id);
          }

          // Success - navigate to assessment
          navigate('/assessment');
          return;
        }
      } catch (verifyErr) {
        // Backend doesn't have verify endpoint, use popup flow instead
        console.log('Verify endpoint not available, using popup flow');
      }

      // Fallback: Use popup window for OAuth
      handleGoogleLoginPopup();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleGoogleLoginPopup = () => {
    const anonymousId = localStorage.getItem('anonymous_id');
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    if (!clientId) {
      setError('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.');
      setLoading(false);
      return;
    }

    // Build Google OAuth URL directly
    const redirectUri = `${window.location.origin}/assessment`;
    const scope = 'openid email profile';
    const responseType = 'token id_token';
    const state = anonymousId || 'anonymous';
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=${encodeURIComponent(responseType)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${encodeURIComponent(state)}&` +
      `nonce=${Math.random().toString(36).substring(2, 15)}`;
    
    // Open popup window
    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const popup = window.open(
      googleAuthUrl,
      'Google Sign-In',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      setError('Popup blocked. Please allow popups for this site.');
      setLoading(false);
      return;
    }

    // Listen for popup to close or redirect
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setLoading(false);
          // Check if we have anonymous_id (successful auth)
          const newAnonymousId = localStorage.getItem('anonymous_id');
          if (newAnonymousId) {
            // Mark Google auth as completed
            localStorage.setItem('google_auth_completed', 'true');
            navigate('/assessment');
          }
        } else {
          // Check if popup redirected to our domain
          try {
            const popupUrl = popup.location.href;
            if (popupUrl.includes(window.location.origin)) {
              // Extract token from URL hash or query params
              const url = new URL(popupUrl);
              const hash = url.hash.substring(1);
              const params = new URLSearchParams(hash);
              const accessToken = params.get('access_token');
              const idToken = params.get('id_token');
              
              if (accessToken || idToken) {
                // Successfully authenticated
                popup.close();
                clearInterval(checkPopup);
                // Mark Google auth as completed
                localStorage.setItem('google_auth_completed', 'true');
                // Store token if needed
                if (accessToken) {
                  localStorage.setItem('google_access_token', accessToken);
                }
                navigate('/assessment');
              }
            }
          } catch (e) {
            // Cross-origin error is expected until redirect happens
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(checkPopup);
        setError('Sign-in timed out. Please try again.');
        setLoading(false);
      }
    }, 300000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError('');
    
    // Use popup window approach for better UX
    handleGoogleLoginPopup();
  };

  if (step === 'method') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Quick Authentication
          </h3>
          <p className="text-gray-600 mb-6 text-center text-sm">
            Verify your account with a 4-digit code, then sign in with Google
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleMethodSelect('email')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                authMethod === 'email'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">Email</span>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('sms')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                authMethod === 'sms'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-900">SMS / Phone</span>
              </div>
            </button>
          </div>

          {authMethod && (
            <div className="mt-6 space-y-4">
              {authMethod === 'email' ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              )}

              <button
                onClick={handleRequestCode}
                disabled={loading || !(authMethod === 'email' ? email : phoneNumber)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'code') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => {
              setStep('method');
              setCodeSent(false);
              setCode('');
              setError('');
            }}
            className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Enter Verification Code
          </h3>
          <p className="text-gray-600 mb-6 text-center text-sm">
            We sent a 4-digit code to {authMethod === 'email' ? email : phoneNumber}
          </p>

          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setCode(value);
                setError('');
              }}
              placeholder="0000"
              maxLength={4}
              className="w-full px-4 py-4 text-center text-3xl font-mono tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              autoFocus
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading || code.length !== 4}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={handleRequestCode}
              className="w-full py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Resend code
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'google') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Account Verified!
            </h3>
            <p className="text-gray-600 text-sm">
              Now sign in with your Google account to continue
            </p>
          </div>

          {googleLoaded && googleButtonRef.current ? (
            <div ref={googleButtonRef} className="w-full"></div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>
          )}

          <p className="mt-4 text-xs text-gray-500 text-center">
            We only use your email address. Your name is never stored.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

