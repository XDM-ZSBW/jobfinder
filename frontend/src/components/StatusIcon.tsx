import React from 'react';
import type { FeatureStatus } from '@/lib/features';

export default function StatusIcon({ status }: { status: FeatureStatus }) {
  const base = 'w-6 h-6 mr-3 flex-shrink-0 mt-1';
  switch (status) {
    case 'live':
      return (
        <svg className={`${base} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Live">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'beta':
      return (
        <svg className={`${base} text-amber-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Beta">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428L12 22.857l-7.428-7.429A8.4 8.4 0 1119.428 4.57a8.4 8.4 0 010 10.857z" />
        </svg>
      );
    case 'coming':
      return (
        <svg className={`${base} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Coming soon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className={`${base} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-label="Planned">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
        </svg>
      );
  }
}