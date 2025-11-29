import React from 'react'
import { Card, Button } from '@/components'

interface RemovedItem {
  type: string;
  value: string;
  reason: string;
}

interface PIIVerificationProps {
  originalText: string;
  redactedText: string;
  removedItems: RemovedItem[];
  redactionSummary: string;
  onAccept: () => void;
  onCancel: () => void;
}

export const PIIVerification: React.FC<PIIVerificationProps> = ({
  originalText,
  redactedText,
  removedItems,
  redactionSummary,
  onAccept,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-y-auto p-12 shadow-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">🔒</div>
            <div>
              <h2 className="text-5xl font-bold text-gray-900">
                Privacy Protection
              </h2>
              <p className="text-2xl text-gray-600 mt-2">
                We removed personal information to keep you anonymous
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <Card variant="info" className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            What we removed:
          </h3>
          <p className="text-2xl text-gray-700">
            {redactionSummary}
          </p>
        </Card>

        {/* Detailed removals */}
        {removedItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Details:
            </h3>
            <div className="space-y-4">
              {removedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">⚠️</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-lg text-lg font-semibold">
                          {item.type.toUpperCase()}
                        </span>
                        <code className="text-xl font-mono text-gray-700">
                          {item.value}
                        </code>
                      </div>
                      <p className="text-lg text-gray-700">
                        <strong>Why removed:</strong> {item.reason}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Before/After comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              What you entered:
            </h4>
            <div className="bg-gray-50 rounded-xl p-6 text-lg text-gray-700 font-mono max-h-64 overflow-y-auto border-2 border-gray-300">
              {originalText}
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              What we'll store:
            </h4>
            <div className="bg-green-50 rounded-xl p-6 text-lg text-gray-700 font-mono max-h-64 overflow-y-auto border-2 border-green-300">
              {redactedText}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <Card variant="success" className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ✓ Why this matters
          </h3>
          <ul className="space-y-2 text-lg text-gray-700">
            <li>• Your identity stays completely anonymous</li>
            <li>• Employers see your capabilities, not your personal details</li>
            <li>• You control when and how to reveal your identity</li>
            <li>• We cannot reverse-engineer who you are from stored data</li>
          </ul>
        </Card>

        {/* Actions */}
        <div className="flex gap-6">
          <Button
            variant="secondary"
            onClick={onCancel}
            fullWidth
            size="lg"
          >
            ← Go back and edit
          </Button>
          <Button
            variant="primary"
            onClick={onAccept}
            fullWidth
            size="lg"
          >
            Accept and continue →
          </Button>
        </div>

        <p className="mt-6 text-center text-lg text-gray-500">
          By continuing, you agree to our updated{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms &amp; Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};
