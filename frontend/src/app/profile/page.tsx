'use client';

import { useState, useEffect } from 'react';
import { Header, Card, Button, Input, TextArea } from '@/components';

export default function ProfilePage() {
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [workPreference, setWorkPreference] = useState('Break it into smaller sub-problems');
  const [bio, setBio] = useState('');
  
  // Store original values for revert
  const [originalSkills, setOriginalSkills] = useState<string[]>([]);
  const [originalPortfolioUrl, setOriginalPortfolioUrl] = useState('');
  const [originalWorkPreference, setOriginalWorkPreference] = useState('');
  const [originalBio, setOriginalBio] = useState('');

  const skillOptions = [
    'Python', 'JavaScript', 'TypeScript', 'FastAPI', 'Next.js', 'React',
    'AI/ML', 'Data Analysis', 'API Design', 'Database Design',
    'UI/UX', 'Problem Solving', 'Communication', 'Teaching'
  ];

  useEffect(() => {
    // Generate or retrieve anonymous ID
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setAnonymousId(id);
    
    // Load profile from backend
    loadProfile(id);
  }, []);

  const loadProfile = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${id}/profile`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data.skills || []);
        setPortfolioUrl(data.portfolio_url || '');
        setWorkPreference(data.work_preference || 'Break it into smaller sub-problems');
        setBio(data.bio || '');
        
        // Store original values
        setOriginalSkills(data.skills || []);
        setOriginalPortfolioUrl(data.portfolio_url || '');
        setOriginalWorkPreference(data.work_preference || 'Break it into smaller sub-problems');
        setOriginalBio(data.bio || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/users/${anonymousId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills,
          portfolio_url: portfolioUrl,
          work_preference: workPreference,
          bio: bio,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      await response.json();
      
      // Update original values to current values
      setOriginalSkills(skills);
      setOriginalPortfolioUrl(portfolioUrl);
      setOriginalWorkPreference(workPreference);
      setOriginalBio(bio);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert to original values
    setSkills(originalSkills);
    setPortfolioUrl(originalPortfolioUrl);
    setWorkPreference(originalWorkPreference);
    setBio(originalBio);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header anonymousId={anonymousId} />

      <main className="container mx-auto px-8 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Your Profile
            </h1>
            <p className="text-2xl text-gray-600">
              Anonymous capability profile
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              Edit profile
            </Button>
          )}
        </div>

        {/* Anonymous ID Card */}
        <Card variant="info" className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Anonymous ID</h3>
          <code className="text-xl bg-white px-6 py-3 rounded-xl inline-block font-mono">
            {anonymousId}
          </code>
          <p className="mt-4 text-lg text-gray-600">
            Save this ID to access your profile later. We can't recover it for you.
          </p>
        </Card>

        {/* Skills Section */}
        <Card className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Your Capabilities
          </h2>
          
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`p-6 rounded-2xl text-xl font-semibold transition-all transform hover:scale-105 ${
                    skills.includes(skill)
                      ? 'bg-blue-600 text-white shadow-xl'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                  }`}
                >
                  {skills.includes(skill) && '✓ '}{skill}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {skills.map(skill => (
                <span
                  key={skill}
                  className="px-6 py-3 bg-blue-100 text-blue-700 rounded-xl text-xl font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Portfolio Section */}
        <Card className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Portfolio
          </h2>
          
          {isEditing ? (
            <Input
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://github.com/yourname or your-portfolio.com"
              helperText="Share your work - what you've built matters more than where you worked"
            />
          ) : (
            <div>
              {portfolioUrl ? (
                <a
                  href={portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl text-blue-600 hover:text-blue-700 underline"
                >
                  {portfolioUrl}
                </a>
              ) : (
                <p className="text-xl text-gray-500 italic">No portfolio URL added</p>
              )}
            </div>
          )}
        </Card>

        {/* Work Preferences */}
        <Card className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            How You Work
          </h2>
          
          {isEditing ? (
            <div className="space-y-6">
              <div>
                <label className="block text-2xl font-bold text-gray-900 mb-4">
                  Problem-solving approach
                </label>
                <select
                  value={workPreference}
                  onChange={(e) => setWorkPreference(e.target.value)}
                  className="w-full px-8 py-6 text-2xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option>Break it into smaller sub-problems</option>
                  <option>Research similar solutions first</option>
                  <option>Prototype quickly and iterate</option>
                  <option>Diagram the system before coding</option>
                </select>
              </div>
              
              <TextArea
                label="Why does that work for you?"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us in your own words..."
                rows={4}
              />
            </div>
          ) : (
            <div>
              <p className="text-2xl text-gray-700 mb-4">
                <strong>Approach:</strong> {workPreference}
              </p>
              {bio && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-xl text-gray-700 leading-relaxed">{bio}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Action Buttons (when editing) */}
        {isEditing && (
          <div className="flex gap-6">
            <Button 
              variant="secondary" 
              onClick={handleCancel} 
              fullWidth
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              fullWidth
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        )}

        {/* Privacy Notice */}
        <Card variant="success" className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🔒 Your Privacy
          </h3>
          <ul className="space-y-3 text-lg text-gray-700">
            <li>✓ This profile is completely anonymous</li>
            <li>✓ We cannot reverse-engineer your identity from your ID</li>
            <li>✓ Employers see capabilities, not personal information</li>
            <li>✓ You control when and how to reveal your identity</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
