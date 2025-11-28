import React from 'react';
import StatusIcon from '@/components/StatusIcon';
import type { Feature } from '@/lib/features';

export default function FeatureList({ features }: { features: Feature[] }) {
  return (
    <div className="space-y-4 text-left">
      {features.map((f) => (
        <div key={f.label} className="flex items-start">
          <StatusIcon status={f.status} />
          <span className="text-gray-700">
            <span className="sr-only">[{f.status}] </span>
            {f.label}
          </span>
        </div>
      ))}
    </div>
  );
}