export type FeatureStatus = 'live' | 'beta' | 'coming' | 'planned';
export type Feature = { label: string; status: FeatureStatus };

export const FEATURES: Feature[] = [
  { label: 'Anonymous skill-based browsing', status: 'live' },
  { label: 'AI chat assistant for job search', status: 'live' },
  { label: 'Canvas drawing input (accessibility)', status: 'beta' },
  { label: 'Job matching algorithm', status: 'coming' },
  { label: 'Employer verification & connections', status: 'planned' },
];

export const LEGEND = [
  { status: 'live' as FeatureStatus, label: 'Live', icon: '✅', color: 'text-green-600' },
  { status: 'beta' as FeatureStatus, label: 'Beta', icon: '🧪', color: 'text-amber-500' },
  { status: 'coming' as FeatureStatus, label: 'Coming', icon: '🕒', color: 'text-gray-500' },
  { status: 'planned' as FeatureStatus, label: 'Planned', icon: '◌', color: 'text-gray-500' },
];