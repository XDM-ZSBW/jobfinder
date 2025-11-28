"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, AlertCircle } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onVerified: () => void;
  requiredAge?: number;
  storageKey?: string;
}

/**
 * Age Verification Modal Component
 * 
 * COPPA Compliance: Blocks users under 18 from using the platform
 * Privacy: Uses sessionStorage only (no persistent tracking)
 * 
 * Features:
 * - Birthdate validation
 * - Under-age blocking
 * - Session-only storage
 * - Clear privacy messaging
 */
export function AgeVerificationModal({
  isOpen,
  onVerified,
  requiredAge = 18,
  storageKey = 'jobmatch_age_verified'
}: AgeVerificationModalProps) {
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Check if already verified in this session
    if (typeof window !== 'undefined') {
      const verified = sessionStorage.getItem(storageKey);
      if (verified === 'true') {
        onVerified();
      }
    }
  }, [storageKey, onVerified]);

  const calculateAge = (year: number, month: number, day: number): number => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateDate = (): boolean => {
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);

    // Basic validation
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      setError('Please enter a valid date');
      return false;
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      setError('Please enter a valid year');
      return false;
    }

    if (month < 1 || month > 12) {
      setError('Please enter a valid month (1-12)');
      return false;
    }

    if (day < 1 || day > 31) {
      setError('Please enter a valid day');
      return false;
    }

    // Check if date is valid
    const testDate = new Date(year, month - 1, day);
    if (testDate.getMonth() !== month - 1) {
      setError('Invalid date');
      return false;
    }

    // Check if date is in the future
    if (testDate > new Date()) {
      setError('Birthdate cannot be in the future');
      return false;
    }

    return true;
  };

  const handleVerify = () => {
    setError('');

    if (!validateDate()) {
      return;
    }

    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);

    const age = calculateAge(year, month, day);

    if (age < requiredAge) {
      // User is under required age - block access
      setIsBlocked(true);
      setError('');
      
      // Clear any form data
      setBirthYear('');
      setBirthMonth('');
      setBirthDay('');
      
      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      
      return;
    }

    // User is old enough - grant access
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, 'true');
    }
    onVerified();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  if (isBlocked) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Access Restricted
            </DialogTitle>
            <DialogDescription>
              You must be at least {requiredAge} years old to use JobMatch.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertDescription>
                We're sorry, but our platform is only available to users {requiredAge} years of age or older. 
                This is required by law to protect minors online.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>If you believe this is an error, please contact our support team.</p>
              <p className="font-semibold">All data you entered has been deleted for your privacy.</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = 'https://www.google.com';
                }
              }}
            >
              Leave Site
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Age Verification Required
          </DialogTitle>
          <DialogDescription>
            Please confirm your age to continue. You must be {requiredAge} or older to use JobMatch.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="birthdate">Birthdate</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  id="birth-month"
                  placeholder="MM"
                  type="number"
                  min="1"
                  max="12"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={2}
                />
                <span className="text-xs text-muted-foreground">Month</span>
              </div>
              <div>
                <Input
                  id="birth-day"
                  placeholder="DD"
                  type="number"
                  min="1"
                  max="31"
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={2}
                />
                <span className="text-xs text-muted-foreground">Day</span>
              </div>
              <div>
                <Input
                  id="birth-year"
                  placeholder="YYYY"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  onKeyPress={handleKeyPress}
                  maxLength={4}
                />
                <span className="text-xs text-muted-foreground">Year</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>🔒 Your birthdate is only used to verify your age.</p>
            <p>✅ We do not store your birthdate.</p>
            <p>🚫 This verification expires when you close your browser.</p>
          </div>
        </div>

        <div className="flex justify-between gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button onClick={handleVerify}>
            Verify Age
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="/privacy" className="underline" target="_blank">
            Privacy Policy
          </a>
          {' '}and{' '}
          <a href="/terms" className="underline" target="_blank">
            Terms of Service
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AgeVerificationModal;
