import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="container mx-auto px-8 py-8">
        <Link to="/" className="text-3xl font-bold text-gray-800 hover:text-blue-600">
          ← jobmatch
        </Link>
      </header>

      <main className="container mx-auto px-8 py-12 max-w-4xl">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-500 mb-12">
          Last updated: January 2025
        </p>

        <div className="prose prose-lg max-w-none">
          <section className="bg-white rounded-3xl p-12 shadow-lg mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              1. Anonymous-First Architecture
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              JobMatch AI is designed with privacy at its core:
            </p>
            <ul className="space-y-2 text-xl text-gray-700">
              <li>• <strong>Anonymous by Default:</strong> You can use most platform features without providing any personal information</li>
              <li>• <strong>Anonymous IDs:</strong> We use anonymous identifiers that cannot be reverse-engineered to identify you</li>
              <li>• <strong>Zero-Knowledge Design:</strong> The platform cannot correlate anonymous IDs to real identities</li>
              <li>• <strong>Optional Identity Linking:</strong> You choose when and how to link your identity</li>
            </ul>
          </section>

          <section className="bg-blue-50 border-4 border-blue-200 rounded-3xl p-12 mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              2. Automatic PII Removal
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              <strong>IMPORTANT:</strong> To maintain your anonymity, we automatically detect and remove personally identifiable information (PII) from anything you submit:
            </p>
            <ul className="space-y-3 text-xl text-gray-700">
              <li>
                <strong>What we remove:</strong>
                <ul className="ml-6 mt-2 space-y-2">
                  <li>• Names (your name, references' names)</li>
                  <li>• Contact information (email, phone, addresses)</li>
                  <li>• Company names with identifying context</li>
                  <li>• Specific dates (employment dates, birth dates)</li>
                  <li>• Location details (cities, offices)</li>
                  <li>• Educational institution names with dates</li>
                  <li>• Any other identifying information</li>
                </ul>
              </li>
              <li>
                <strong>What we keep:</strong> Your capabilities, skills, technologies used, problems solved, and work preferences
              </li>
              <li>
                <strong>Verification screen:</strong> Before we store anything, you'll see exactly what was removed and why
              </li>
              <li>
                <strong>Your consent:</strong> You must explicitly accept the redacted version before we proceed
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl p-12 shadow-lg mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              3. Data We Collect
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-4">
              We collect only capability data, never credentials or PII:
            </p>
            <ul className="space-y-2 text-xl text-gray-700">
              <li>• Technical skills (Python, React, etc.)</li>
              <li>• Capability areas (API design, data analysis)</li>
              <li>• Work preferences (how you solve problems)</li>
              <li>• Portfolio URLs (if provided and safe)</li>
              <li>• Match results and assessment data</li>
            </ul>
            <p className="text-xl text-gray-700 leading-relaxed mt-4">
              <strong>We do NOT collect:</strong> Your name, contact info, job history, education details, or any other PII unless you explicitly choose to provide it for authentication purposes.
            </p>
          </section>

          <section className="bg-white rounded-3xl p-12 shadow-lg mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              4. How We Use Your Data
            </h2>
            <ul className="space-y-2 text-xl text-gray-700">
              <li>• To match you with relevant job opportunities based on capabilities</li>
              <li>• To improve our matching algorithms</li>
              <li>• To provide you with personalized recommendations</li>
              <li>• To ensure platform security and prevent fraud</li>
            </ul>
            <p className="text-xl text-gray-700 leading-relaxed mt-4">
              <strong>We never:</strong> Sell your data, share it with third parties for marketing, or use it for purposes other than providing the JobMatch service.
            </p>
          </section>

          <section className="bg-green-50 border-4 border-green-300 rounded-3xl p-12 mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              5. Your Rights
            </h2>
            <ul className="space-y-2 text-xl text-gray-700">
              <li>• <strong>Access:</strong> Request all data associated with your anonymous ID</li>
              <li>• <strong>Deletion:</strong> Delete your profile and all data at any time</li>
              <li>• <strong>Export:</strong> Export your data in portable format</li>
              <li>• <strong>Control:</strong> Control visibility of your matches</li>
              <li>• <strong>Identity:</strong> Choose when to reveal your identity</li>
              <li>• <strong>Opt-out:</strong> Opt out of data collection at any time</li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl p-12 shadow-lg">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              6. Contact
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Questions about privacy? Contact us at{' '}
              <a href="mailto:privacy@jobmatch.ai" className="text-blue-600 hover:underline">
                privacy@jobmatch.ai
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

