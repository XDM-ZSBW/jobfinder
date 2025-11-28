'use client';

import { useState, useEffect } from 'react';

export default function InteractiveDemo() {
  const [isMounted, setIsMounted] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getFrameDimensions = () => {
    switch (screenSize) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '100%', height: '600px' };
    }
  };

  const dimensions = getFrameDimensions();

  if (!isMounted) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Try It Free - No Sign Up Required
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Experience JobMatch.zip's powerful matching interface in action
            </p>

            {/* Device Selector */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setScreenSize('mobile')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  screenSize === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📱 Mobile
              </button>
              <button
                onClick={() => setScreenSize('tablet')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  screenSize === 'tablet'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => setScreenSize('desktop')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  screenSize === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                💻 Desktop
              </button>
            </div>
          </div>

          {/* Demo Frame */}
          <div className="relative">
            {/* Frame Container with Shadow */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 mx-auto" 
                 style={{ 
                   maxWidth: screenSize === 'desktop' ? '100%' : dimensions.width,
                   transition: 'all 0.3s ease'
                 }}>
              
              {/* Browser Chrome (for desktop) */}
              {screenSize === 'desktop' && (
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mx-4 px-4 py-1 bg-gray-100 rounded-md text-sm text-gray-500">
                    https://jobmatch.zip/canvas
                  </div>
                </div>
              )}

              {/* Iframe Content */}
              <div 
                className="relative overflow-hidden rounded-lg border border-gray-200 bg-white mx-auto"
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  maxWidth: '100%',
                  transition: 'all 0.3s ease'
                }}
              >
                <iframe
                  src="/canvas"
                  className="w-full h-full border-0"
                  title="JobMatch Canvas Demo"
                  sandbox="allow-scripts allow-forms"
                  loading="lazy"
                />
                
                {/* Overlay with CTA (optional hover effect) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6 pointer-events-none">
                  <div className="bg-white rounded-lg px-6 py-4 shadow-xl pointer-events-auto">
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Like what you see?
                    </p>
                    <a 
                      href="#subscribe"
                      className="inline-block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-indigo-700 transition-colors"
                    >
                      Start Your Free Trial
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Interactive Canvas</h3>
                <p className="text-gray-600 text-sm">
                  Draw, annotate, and collaborate on job applications in real-time
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Optimized for all devices - works even on 2G/3G connections
                </p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Save & Export</h3>
                <p className="text-gray-600 text-sm">
                  Your work auto-saves and syncs across all your devices
                </p>
              </div>
            </div>

            {/* Demo Stats */}
            <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">10K+</div>
                  <div className="text-gray-600 text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">95%</div>
                  <div className="text-gray-600 text-sm">Match Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">2.5x</div>
                  <div className="text-gray-600 text-sm">Faster Job Search</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
                  <div className="text-gray-600 text-sm">Support Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
