'use client';

import { useState } from 'react';

type AuthMethod = 'email' | 'sms' | null;
type AuthStep = 'method' | 'code' | 'google';

interface QuickAuthProps {
  onAuthComplete: (account: string, method: 'email' | 'sms') => void;
}

const MYKEYS_API_URL = process.env.NEXT_PUBLIC_MYKEYS_API_URL || 'https://mykeys.zip';

export default function QuickAuth({ onAuthComplete }: QuickAuthProps) {
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

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth flow
    // For now, just redirect to assess page
    window.location.href = '/assess';
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

          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-xs text-gray-500 text-center">
            We only use your email address. Your name is never stored.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

