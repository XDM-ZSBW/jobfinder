'use client';

import { useState, useEffect } from 'react';
import { PIIVerification, SkillBubbles } from '@/components';

type Step = 'welcome' | 'skills' | 'portfolio' | 'preferences' | 'pii-check' | 'complete';

export default function AssessPage() {
  const [step, setStep] = useState<Step>('welcome');
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [preference, setPreference] = useState('');
  const [preferenceReason, setPreferenceReason] = useState('');
  const [isVR, setIsVR] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [piiData, setPiiData] = useState<any>(null);
  const [showPiiVerification, setShowPiiVerification] = useState(false);
  const [useCanvasMode, setUseCanvasMode] = useState(true);

  useEffect(() => {
    // Generate anonymous ID on start
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setAnonymousId(id);

    // Detect VR
    setIsVR(/Quest/i.test(navigator.userAgent));
  }, []);

  const skillOptions = [
    { id: '1', name: 'Python', category: 'Programming Languages' },
    { id: '2', name: 'JavaScript', category: 'Programming Languages' },
    { id: '3', name: 'TypeScript', category: 'Programming Languages' },
    { id: '4', name: 'FastAPI', category: 'Frameworks' },
    { id: '5', name: 'Next.js', category: 'Frameworks' },
    { id: '6', name: 'React', category: 'Frameworks' },
    { id: '7', name: 'AI/ML', category: 'Technical Skills' },
    { id: '8', name: 'Data Analysis', category: 'Technical Skills' },
    { id: '9', name: 'API Design', category: 'Technical Skills' },
    { id: '10', name: 'Database Design', category: 'Technical Skills' },
    { id: '11', name: 'UI/UX', category: 'Design' },
    { id: '12', name: 'Problem Solving', category: 'Soft Skills' },
    { id: '13', name: 'Communication', category: 'Soft Skills' },
    { id: '14', name: 'Teaching', category: 'Soft Skills' },
  ];

  const toggleSkill = (skillName: string) => {
    setSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const checkPIIAndProceed = async () => {
    if (resumeText.trim().length > 0) {
      // Call PII redaction API
      try {
        const response = await fetch('http://localhost:3000/api/v1/redact/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: resumeText })
        });
        const data = await response.json();
        
        if (data.removed_items && data.removed_items.length > 0) {
          setPiiData(data);
          setShowPiiVerification(true);
        } else {
          // No PII found, proceed
          submitAssessment();
        }
      } catch (error) {
        console.error('PII check failed:', error);
        // Fallback: proceed anyway
        submitAssessment();
      }
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = async () => {
    // TODO: Call backend API to submit assessment
    setStep('complete');
  };

  const handlePiiAccept = () => {
    setResumeText(piiData.redacted_text);
    setShowPiiVerification(false);
    submitAssessment();
  };

  const handlePiiCancel = () => {
    setShowPiiVerification(false);
    setStep('skills'); // Go back to edit
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* VR Indicator */}
      {isVR && (
        <div className="fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg z-50">
          🥽 Quest 3 Optimized
        </div>
      )}

      {/* Header */}
      <header className="container mx-auto px-8 py-8">
        <div className="flex items-center justify-between">
          <a href="/" className="text-3xl font-bold text-gray-800 hover:text-blue-600">
            ← jobmatch
          </a>
          <div className="text-xl text-gray-500">
            Session: {anonymousId.slice(0, 8)}...
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12 max-w-4xl">
        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="text-center">
            <div className="text-8xl mb-8">👋</div>
            <h1 className="text-6xl font-bold text-gray-900 mb-8">
              Let's discover what you can do
            </h1>
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
              This is completely anonymous. No email, no sign-up.
              <br />
              Just a few questions to understand your capabilities.
            </p>
            
            <div className="bg-blue-50 border-4 border-blue-200 rounded-3xl p-8 mb-12 text-left">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">What we'll ask:</h3>
              <ul className="space-y-3 text-xl text-gray-700">
                <li>✓ Skills you have (not where you learned them)</li>
                <li>✓ What you've built (portfolio, projects)</li>
                <li>✓ How you prefer to work</li>
              </ul>
              <p className="mt-6 text-lg text-gray-600">
                <strong>What we won't ask:</strong> Name, email, job history, degrees
              </p>
            </div>

            <button
              onClick={() => setStep('skills')}
              className="px-20 py-10 bg-blue-600 text-white rounded-2xl text-4xl font-bold hover:bg-blue-700 active:bg-blue-800 transition-all shadow-2xl hover:scale-105 transform"
            >
              Let's start
            </button>
          </div>
        )}

        {/* Skills Step */}
        {step === 'skills' && (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">💪</div>
                  <div>
                    <h2 className="text-5xl font-bold text-gray-900">What can you do?</h2>
                    <p className="text-xl text-gray-500 mt-2">Select all that apply</p>
                  </div>
                </div>
                
                {/* Mode Toggle */}
                <button
                  onClick={() => setUseCanvasMode(!useCanvasMode)}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-lg font-semibold transition-all border-2 border-gray-300"
                >
                  {useCanvasMode ? '📋 Switch to List Mode' : '🎨 Switch to Canvas Mode'}
                </button>
              </div>
            </div>

            {/* Canvas Mode */}
            {useCanvasMode ? (
              <SkillBubbles
                availableSkills={skillOptions}
                selectedSkills={skillOptions.filter(s => skills.includes(s.name))}
                onSkillsChange={(selectedSkills) => {
                  setSkills(selectedSkills.map(s => s.name));
                }}
                canvasMode={true}
                className="mb-12"
              />
            ) : (
              /* Traditional Grid Mode */
              <div className="grid grid-cols-2 gap-6 mb-12">
                {skillOptions.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.name)}
                    className={`p-8 rounded-2xl text-2xl font-semibold transition-all transform hover:scale-105 ${
                      skills.includes(skill.name)
                        ? 'bg-blue-600 text-white shadow-xl'
                        : 'bg-white text-gray-700 border-4 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {skills.includes(skill.name) && '✓ '}{skill.name}
                  </button>
                ))}
              </div>
            )}

            {/* Resume/Experience Paste Field */}
            <div className="bg-white rounded-3xl p-12 shadow-lg mb-12">
              <label className="block text-2xl font-bold text-gray-900 mb-4">
                📋 Or paste your resume/experience here
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume, LinkedIn profile, or describe your experience...&#10;&#10;We'll extract your capabilities automatically. No personal info needed!&#10;&#10;Focus on what you've DONE, not job titles or company names."
                className="w-full px-8 py-6 text-xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none font-mono"
                rows={12}
              />
              <div className="mt-4 flex items-start gap-3 text-lg text-gray-600">
                <span className="text-2xl">💡</span>
                <p>
                  <strong>Pro tip:</strong> Include projects, technologies used, problems solved. 
                  We'll use AI to identify your capabilities while keeping your identity anonymous.
                </p>
              </div>
              {resumeText.length > 0 && (
                <div className="mt-4 text-lg text-green-600 font-semibold">
                  ✓ {resumeText.length} characters detected
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 px-12 py-6 bg-gray-200 text-gray-700 rounded-2xl text-2xl font-bold hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('portfolio')}
                disabled={skills.length === 0}
                className={`flex-1 px-12 py-6 rounded-2xl text-2xl font-bold transition ${
                  skills.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue ({skills.length} selected) →
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Step */}
        {step === 'portfolio' && (
          <div>
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🎨</div>
                <div>
                  <h2 className="text-5xl font-bold text-gray-900">Show your work</h2>
                  <p className="text-xl text-gray-500 mt-2">Optional but helpful</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-12 shadow-lg mb-12">
              <label className="block text-2xl font-bold text-gray-900 mb-4">
                Portfolio or GitHub URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://github.com/yourname or your-portfolio.com"
                className="w-full px-8 py-6 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-4 text-lg text-gray-500">
                We'll look at what you've built, not where you worked.
              </p>
            </div>

            <div className="bg-yellow-50 border-4 border-yellow-200 rounded-3xl p-8 mb-12">
              <p className="text-xl text-gray-700">
                <strong>💡 Pro tip:</strong> Your portfolio shows what you CAN DO better 
                than any resume. Share projects, code samples, or anything you've built.
              </p>
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setStep('skills')}
                className="flex-1 px-12 py-6 bg-gray-200 text-gray-700 rounded-2xl text-2xl font-bold hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('preferences')}
                className="flex-1 px-12 py-6 bg-blue-600 text-white rounded-2xl text-2xl font-bold hover:bg-blue-700 shadow-xl transition"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Preferences Step (XDMIQ style) */}
        {step === 'preferences' && (
          <div>
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl">🤔</div>
                <div>
                  <h2 className="text-5xl font-bold text-gray-900">How do you work?</h2>
                  <p className="text-xl text-gray-500 mt-2">Tell us your preference</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-12 shadow-lg mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Which approach do you prefer when facing a complex problem?
              </h3>
              
              <div className="space-y-6">
                {[
                  'Break it into smaller sub-problems',
                  'Research similar solutions first',
                  'Prototype quickly and iterate',
                  'Diagram the system before coding'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => setPreference(option)}
                    className={`w-full p-8 rounded-2xl text-2xl text-left font-semibold transition-all transform hover:scale-102 ${
                      preference === option
                        ? 'bg-purple-600 text-white shadow-xl'
                        : 'bg-gray-50 text-gray-700 border-4 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {preference === option && '✓ '}{option}
                  </button>
                ))}
              </div>

              {preference && (
                <div className="mt-8 p-6 bg-purple-50 rounded-xl">
                  <label className="block text-xl font-bold text-gray-900 mb-3">
                    Why does that work better for you?
                  </label>
                  <textarea
                    value={preferenceReason}
                    onChange={(e) => setPreferenceReason(e.target.value)}
                    placeholder="Tell us in your own words..."
                    className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => setStep('portfolio')}
                className="flex-1 px-12 py-6 bg-gray-200 text-gray-700 rounded-2xl text-2xl font-bold hover:bg-gray-300 transition"
              >
                ← Back
              </button>
              <button
                onClick={checkPIIAndProceed}
                disabled={!preference}
                className={`flex-1 px-12 py-6 rounded-2xl text-2xl font-bold transition ${
                  preference
                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Finish assessment →
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center">
            <div className="text-9xl mb-8">🎉</div>
            <h1 className="text-6xl font-bold text-gray-900 mb-8">
              You're all set!
            </h1>
            <p className="text-3xl text-gray-600 mb-12 leading-relaxed">
              We're analyzing your capabilities to find the best matches.
              <br />
              <span className="text-2xl text-gray-500 mt-4 block">
                (Still completely anonymous)
              </span>
            </p>

            <div className="bg-green-50 border-4 border-green-300 rounded-3xl p-12 mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">What happens next?</h3>
              <div className="space-y-4 text-xl text-gray-700 text-left">
                <p>✓ <strong>AI reviews</strong> your capabilities and portfolio</p>
                <p>✓ <strong>Human validates</strong> the matches (we never auto-match)</p>
                <p>✓ <strong>You get notified</strong> when there are good opportunities</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <button
                onClick={() => window.location.href = '/matches'}
                className="px-20 py-10 bg-blue-600 text-white rounded-2xl text-4xl font-bold hover:bg-blue-700 shadow-2xl hover:scale-105 transform transition"
              >
                Browse opportunities
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-12 py-6 bg-white text-gray-700 rounded-2xl text-2xl font-semibold hover:bg-gray-50 border-4 border-gray-200"
              >
                Back to home
              </button>
            </div>

            <p className="mt-12 text-xl text-gray-500">
              Your anonymous ID: <code className="bg-gray-100 px-4 py-2 rounded">{anonymousId}</code>
              <br />
              <span className="text-lg">(Save this if you want to return later)</span>
            </p>
          </div>
        )}
      </main>

      {/* PII Verification Modal */}
      {showPiiVerification && piiData && (
        <PIIVerification
          originalText={piiData.original_text}
          redactedText={piiData.redacted_text}
          removedItems={piiData.removed_items}
          redactionSummary={piiData.redaction_summary}
          onAccept={handlePiiAccept}
          onCancel={handlePiiCancel}
        />
      )}
    </div>
  );
}
