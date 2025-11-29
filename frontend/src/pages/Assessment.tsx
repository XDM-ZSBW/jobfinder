import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PIIVerification, SkillBubbles } from '@/components'

type Step = 'welcome' | 'field' | 'industry' | 'skills' | 'portfolio' | 'preferences' | 'pii-check' | 'complete'

interface Industry {
  id: string
  name: string
  icon: string
  description: string
}

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [anonymousId, setAnonymousId] = useState<string>('')
  const [selectedField, setSelectedField] = useState<string>('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [industrySearchTerm, setIndustrySearchTerm] = useState<string>('')
  const [skills, setSkills] = useState<string[]>([])
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [preference, setPreference] = useState('')
  const [preferenceReason, setPreferenceReason] = useState('')
  const [, setIsVR] = useState(false)
  const [resumeText, setResumeText] = useState('')
  const [piiData, setPiiData] = useState<any>(null)
  const [showPiiVerification, setShowPiiVerification] = useState(false)
  const [, setUseCanvasMode] = useState(true)

  useEffect(() => {
    // Generate anonymous ID on start
    const id = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    setAnonymousId(id)

    // Detect VR
    setIsVR(/Quest/i.test(navigator.userAgent))
  }, [])

  // High-level fields (like a bank would ask)
  const fields = [
    { id: 'education', name: 'Education & Teaching', icon: '👨‍🏫', description: 'Teachers, professors, trainers, education professionals' },
    { id: 'healthcare', name: 'Healthcare & Medical', icon: '👨‍⚕️', description: 'Doctors, nurses, therapists, medical professionals' },
    { id: 'government', name: 'Government & Public Service', icon: '🏛️', description: 'Federal, state, local government, public sector' },
    { id: 'it', name: 'Information Technology', icon: '💻', description: 'Software, IT, tech, engineering, development' },
    { id: 'business', name: 'Business & Finance', icon: '💼', description: 'Finance, consulting, management, operations' },
    { id: 'legal', name: 'Legal & Law', icon: '⚖️', description: 'Lawyers, paralegals, legal professionals' },
    { id: 'engineering', name: 'Engineering & Construction', icon: '🔧', description: 'Civil, mechanical, electrical engineers' },
    { id: 'sales', name: 'Sales & Marketing', icon: '📈', description: 'Sales, marketing, business development' },
    { id: 'creative', name: 'Creative & Design', icon: '🎨', description: 'Designers, artists, writers, creative professionals' },
    { id: 'science', name: 'Science & Research', icon: '🔬', description: 'Scientists, researchers, lab technicians' },
    { id: 'service', name: 'Service & Hospitality', icon: '🍽️', description: 'Hospitality, food service, customer service' },
    { id: 'other', name: 'Other', icon: '🌟', description: 'Other fields not listed above' },
  ]

  // Industry/domain options by field
  const industriesByField: Record<string, Industry[]> = {
    'education': [
      { id: 'k12', name: 'K-12 Education', icon: '📚', description: 'Elementary, middle, high school teaching' },
      { id: 'higher-ed', name: 'Higher Education', icon: '🎓', description: 'Colleges, universities, professors' },
      { id: 'edtech', name: 'EdTech', icon: '💻', description: 'Educational technology, online learning' },
      { id: 'training', name: 'Training & Development', icon: '📖', description: 'Corporate training, professional development' },
      { id: 'tutoring', name: 'Tutoring & Coaching', icon: '✏️', description: 'Private tutoring, academic coaching' },
      { id: 'curriculum', name: 'Curriculum Design', icon: '📝', description: 'Educational content creation' },
    ],
    'healthcare': [
      { id: 'physician', name: 'Physician', icon: '👨‍⚕️', description: 'Doctors, surgeons, medical practitioners' },
      { id: 'nursing', name: 'Nursing', icon: '👩‍⚕️', description: 'Registered nurses, nurse practitioners' },
      { id: 'therapy', name: 'Therapy & Rehabilitation', icon: '🏥', description: 'Physical, occupational, speech therapy' },
      { id: 'pharmacy', name: 'Pharmacy', icon: '💊', description: 'Pharmacists, pharmacy technicians' },
      { id: 'healthtech', name: 'Health Technology', icon: '🏥', description: 'Health IT, medical devices, telemedicine' },
      { id: 'public-health', name: 'Public Health', icon: '🌍', description: 'Epidemiology, health policy, community health' },
    ],
    'government': [
      { id: 'federal', name: 'Federal Government', icon: '🇺🇸', description: 'Federal agencies, departments' },
      { id: 'state', name: 'State Government', icon: '🏛️', description: 'State agencies, departments' },
      { id: 'local', name: 'Local Government', icon: '🏘️', description: 'City, county, municipal' },
      { id: 'military', name: 'Military & Defense', icon: '🪖', description: 'Armed forces, defense contractors' },
      { id: 'law-enforcement', name: 'Law Enforcement', icon: '👮', description: 'Police, security, corrections' },
      { id: 'public-service', name: 'Public Service', icon: '🤝', description: 'Non-profits, public service organizations' },
    ],
    'it': [
      { id: 'software', name: 'Software Development', icon: '💻', description: 'Web, mobile, desktop applications' },
      { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', description: 'ML models, NLP, computer vision' },
      { id: 'data', name: 'Data Science & Analytics', icon: '📊', description: 'Data analysis, visualization, BI' },
      { id: 'devops', name: 'DevOps & Infrastructure', icon: '⚙️', description: 'Cloud, CI/CD, infrastructure as code' },
      { id: 'cybersecurity', name: 'Cybersecurity', icon: '🔒', description: 'Security, information security, compliance' },
      { id: 'it-support', name: 'IT Support & Operations', icon: '🛠️', description: 'Help desk, system administration' },
    ],
    'business': [
      { id: 'finance', name: 'Finance & Accounting', icon: '💰', description: 'Financial services, fintech, accounting' },
      { id: 'consulting', name: 'Consulting & Strategy', icon: '💼', description: 'Business consulting, strategy' },
      { id: 'product', name: 'Product Management', icon: '🚀', description: 'Product strategy, roadmap, features' },
      { id: 'operations', name: 'Operations & Management', icon: '⚙️', description: 'Operations, supply chain, management' },
      { id: 'hr', name: 'Human Resources', icon: '👥', description: 'HR, talent acquisition, people ops' },
      { id: 'real-estate', name: 'Real Estate', icon: '🏠', description: 'Real estate, property management' },
    ],
    'legal': [
      { id: 'lawyer', name: 'Attorney / Lawyer', icon: '⚖️', description: 'Lawyers, attorneys, legal counsel' },
      { id: 'paralegal', name: 'Paralegal', icon: '📋', description: 'Paralegals, legal assistants' },
      { id: 'compliance', name: 'Compliance & Regulatory', icon: '📜', description: 'Compliance, regulatory affairs' },
      { id: 'legal-tech', name: 'Legal Technology', icon: '💻', description: 'Legal tech, law tech solutions' },
    ],
    'engineering': [
      { id: 'civil', name: 'Civil Engineering', icon: '🏗️', description: 'Infrastructure, construction, structural' },
      { id: 'mechanical', name: 'Mechanical Engineering', icon: '⚙️', description: 'Mechanical systems, manufacturing' },
      { id: 'electrical', name: 'Electrical Engineering', icon: '⚡', description: 'Electrical systems, electronics' },
      { id: 'chemical', name: 'Chemical Engineering', icon: '🧪', description: 'Chemical processes, materials' },
      { id: 'aerospace', name: 'Aerospace Engineering', icon: '✈️', description: 'Aerospace, aviation, defense' },
      { id: 'construction', name: 'Construction', icon: '🏗️', description: 'Construction management, building' },
    ],
    'sales': [
      { id: 'marketing', name: 'Marketing & Growth', icon: '📈', description: 'Digital marketing, SEO, growth hacking' },
      { id: 'sales', name: 'Sales', icon: '💬', description: 'Sales, business development, account management' },
      { id: 'advertising', name: 'Advertising', icon: '📢', description: 'Advertising, media, creative agencies' },
      { id: 'pr', name: 'Public Relations', icon: '📰', description: 'PR, communications, media relations' },
    ],
    'creative': [
      { id: 'design', name: 'Design & UX', icon: '🎨', description: 'UI/UX design, product design' },
      { id: 'writing', name: 'Writing & Content', icon: '✍️', description: 'Content writing, copywriting, editing' },
      { id: 'media', name: 'Media & Production', icon: '🎬', description: 'Video, audio, multimedia production' },
      { id: 'arts', name: 'Arts & Creative', icon: '🎭', description: 'Fine arts, performing arts, creative work' },
    ],
    'science': [
      { id: 'research', name: 'Research & Development', icon: '🔬', description: 'Scientific research, R&D' },
      { id: 'lab', name: 'Laboratory & Testing', icon: '🧪', description: 'Lab work, testing, analysis' },
      { id: 'biotech', name: 'Biotechnology', icon: '🧬', description: 'Biotech, pharmaceuticals, life sciences' },
      { id: 'environmental', name: 'Environmental Science', icon: '🌱', description: 'Environmental, sustainability, conservation' },
    ],
    'service': [
      { id: 'hospitality', name: 'Hospitality', icon: '🏨', description: 'Hotels, restaurants, tourism' },
      { id: 'customer-service', name: 'Customer Service', icon: '📞', description: 'Customer support, call centers' },
      { id: 'retail', name: 'Retail', icon: '🛍️', description: 'Retail, sales, store management' },
      { id: 'food-service', name: 'Food Service', icon: '🍽️', description: 'Restaurants, catering, food service' },
    ],
    'other': [
      { id: 'other', name: 'Other / Generalist', icon: '🌟', description: 'Multiple domains or specialized field' },
    ],
  }

  // Industry/domain options (flattened for backward compatibility)
  const industries = selectedField && industriesByField[selectedField] 
    ? industriesByField[selectedField]
    : [
    { id: 'software', name: 'Software Development', icon: '💻', description: 'Web, mobile, desktop applications' },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', description: 'ML models, NLP, computer vision' },
    { id: 'data', name: 'Data Science & Analytics', icon: '📊', description: 'Data analysis, visualization, BI' },
    { id: 'devops', name: 'DevOps & Infrastructure', icon: '⚙️', description: 'Cloud, CI/CD, infrastructure as code' },
    { id: 'design', name: 'Design & UX', icon: '🎨', description: 'UI/UX design, product design' },
    { id: 'marketing', name: 'Marketing & Growth', icon: '📈', description: 'Digital marketing, SEO, growth hacking' },
    { id: 'product', name: 'Product Management', icon: '🚀', description: 'Product strategy, roadmap, features' },
    { id: 'consulting', name: 'Consulting & Strategy', icon: '💼', description: 'Business consulting, strategy' },
    { id: 'finance', name: 'Finance & FinTech', icon: '💰', description: 'Financial services, fintech, accounting' },
    { id: 'healthcare', name: 'Healthcare & Biotech', icon: '🏥', description: 'Health tech, medical devices' },
    { id: 'education', name: 'Education & EdTech', icon: '📚', description: 'Learning platforms, training' },
    { id: 'other', name: 'Other / Generalist', icon: '🌟', description: 'Multiple domains or specialized field' },
  ]

  // Skill type definition
  type Skill = {
    id: string
    name: string
    category: string
  }

  // Skills by industry (mapped to all industry IDs)
  const skillsByIndustry: Record<string, Skill[]> = {
    'software': [
      { id: '1', name: 'Python', category: 'Programming Languages' },
      { id: '2', name: 'JavaScript', category: 'Programming Languages' },
      { id: '3', name: 'TypeScript', category: 'Programming Languages' },
      { id: '4', name: 'React', category: 'Frontend Frameworks' },
      { id: '5', name: 'Vue.js', category: 'Frontend Frameworks' },
      { id: '6', name: 'Node.js', category: 'Backend Frameworks' },
      { id: '7', name: 'FastAPI', category: 'Backend Frameworks' },
      { id: '8', name: 'Django', category: 'Backend Frameworks' },
      { id: '9', name: 'REST APIs', category: 'Technical Skills' },
      { id: '10', name: 'GraphQL', category: 'Technical Skills' },
      { id: '11', name: 'Database Design', category: 'Technical Skills' },
      { id: '12', name: 'Testing', category: 'Technical Skills' },
      { id: '13', name: 'Git', category: 'Tools' },
      { id: '14', name: 'Docker', category: 'Tools' },
    ],
    'ai-ml': [
      { id: '1', name: 'Python', category: 'Programming Languages' },
      { id: '2', name: 'TensorFlow', category: 'ML Frameworks' },
      { id: '3', name: 'PyTorch', category: 'ML Frameworks' },
      { id: '4', name: 'Scikit-learn', category: 'ML Frameworks' },
      { id: '5', name: 'NLP', category: 'ML Domains' },
      { id: '6', name: 'Computer Vision', category: 'ML Domains' },
      { id: '7', name: 'Deep Learning', category: 'ML Domains' },
      { id: '8', name: 'Data Preprocessing', category: 'Technical Skills' },
      { id: '9', name: 'Model Training', category: 'Technical Skills' },
      { id: '10', name: 'MLOps', category: 'Technical Skills' },
      { id: '11', name: 'Pandas', category: 'Data Libraries' },
      { id: '12', name: 'NumPy', category: 'Data Libraries' },
      { id: '13', name: 'Jupyter', category: 'Tools' },
      { id: '14', name: 'Model Deployment', category: 'Technical Skills' },
    ],
    'data': [
      { id: '1', name: 'Python', category: 'Programming Languages' },
      { id: '2', name: 'R', category: 'Programming Languages' },
      { id: '3', name: 'SQL', category: 'Data Languages' },
      { id: '4', name: 'Pandas', category: 'Data Libraries' },
      { id: '5', name: 'NumPy', category: 'Data Libraries' },
      { id: '6', name: 'Data Visualization', category: 'Technical Skills' },
      { id: '7', name: 'Statistical Analysis', category: 'Technical Skills' },
      { id: '8', name: 'ETL', category: 'Technical Skills' },
      { id: '9', name: 'Tableau', category: 'BI Tools' },
      { id: '10', name: 'Power BI', category: 'BI Tools' },
      { id: '11', name: 'Excel', category: 'Tools' },
      { id: '12', name: 'Data Modeling', category: 'Technical Skills' },
      { id: '13', name: 'Big Data', category: 'Technical Skills' },
      { id: '14', name: 'Data Warehousing', category: 'Technical Skills' },
    ],
    'devops': [
      { id: '1', name: 'Docker', category: 'Containers' },
      { id: '2', name: 'Kubernetes', category: 'Orchestration' },
      { id: '3', name: 'AWS', category: 'Cloud Platforms' },
      { id: '4', name: 'Azure', category: 'Cloud Platforms' },
      { id: '5', name: 'GCP', category: 'Cloud Platforms' },
      { id: '6', name: 'CI/CD', category: 'Technical Skills' },
      { id: '7', name: 'Terraform', category: 'IaC Tools' },
      { id: '8', name: 'Ansible', category: 'IaC Tools' },
      { id: '9', name: 'Linux', category: 'Operating Systems' },
      { id: '10', name: 'Bash Scripting', category: 'Technical Skills' },
      { id: '11', name: 'Monitoring', category: 'Technical Skills' },
      { id: '12', name: 'Logging', category: 'Technical Skills' },
      { id: '13', name: 'Git', category: 'Tools' },
      { id: '14', name: 'Infrastructure Design', category: 'Technical Skills' },
    ],
    'design': [
      { id: '1', name: 'UI Design', category: 'Design Skills' },
      { id: '2', name: 'UX Design', category: 'Design Skills' },
      { id: '3', name: 'Figma', category: 'Design Tools' },
      { id: '4', name: 'Adobe XD', category: 'Design Tools' },
      { id: '5', name: 'Sketch', category: 'Design Tools' },
      { id: '6', name: 'Prototyping', category: 'Design Skills' },
      { id: '7', name: 'User Research', category: 'Design Skills' },
      { id: '8', name: 'Wireframing', category: 'Design Skills' },
      { id: '9', name: 'Design Systems', category: 'Design Skills' },
      { id: '10', name: 'Accessibility', category: 'Design Skills' },
      { id: '11', name: 'HTML/CSS', category: 'Technical Skills' },
      { id: '12', name: 'Responsive Design', category: 'Design Skills' },
      { id: '13', name: 'Illustration', category: 'Design Skills' },
      { id: '14', name: 'Branding', category: 'Design Skills' },
    ],
    'marketing': [
      { id: '1', name: 'SEO', category: 'Digital Marketing' },
      { id: '2', name: 'SEM', category: 'Digital Marketing' },
      { id: '3', name: 'Content Marketing', category: 'Marketing Skills' },
      { id: '4', name: 'Social Media', category: 'Marketing Skills' },
      { id: '5', name: 'Email Marketing', category: 'Marketing Skills' },
      { id: '6', name: 'Analytics', category: 'Marketing Skills' },
      { id: '7', name: 'Google Ads', category: 'Advertising' },
      { id: '8', name: 'Facebook Ads', category: 'Advertising' },
      { id: '9', name: 'Conversion Optimization', category: 'Marketing Skills' },
      { id: '10', name: 'A/B Testing', category: 'Marketing Skills' },
      { id: '11', name: 'Marketing Automation', category: 'Marketing Skills' },
      { id: '12', name: 'Copywriting', category: 'Marketing Skills' },
      { id: '13', name: 'Data Analysis', category: 'Technical Skills' },
      { id: '14', name: 'Growth Hacking', category: 'Marketing Skills' },
    ],
    'product': [
      { id: '1', name: 'Product Strategy', category: 'Product Skills' },
      { id: '2', name: 'Roadmap Planning', category: 'Product Skills' },
      { id: '3', name: 'User Stories', category: 'Product Skills' },
      { id: '4', name: 'Agile', category: 'Methodologies' },
      { id: '5', name: 'Scrum', category: 'Methodologies' },
      { id: '6', name: 'User Research', category: 'Product Skills' },
      { id: '7', name: 'Analytics', category: 'Product Skills' },
      { id: '8', name: 'A/B Testing', category: 'Product Skills' },
      { id: '9', name: 'Stakeholder Management', category: 'Soft Skills' },
      { id: '10', name: 'Prioritization', category: 'Product Skills' },
      { id: '11', name: 'Prototyping', category: 'Product Skills' },
      { id: '12', name: 'Market Research', category: 'Product Skills' },
      { id: '13', name: 'Communication', category: 'Soft Skills' },
      { id: '14', name: 'Problem Solving', category: 'Soft Skills' },
    ],
    'consulting': [
      { id: '1', name: 'Business Strategy', category: 'Consulting Skills' },
      { id: '2', name: 'Process Improvement', category: 'Consulting Skills' },
      { id: '3', name: 'Change Management', category: 'Consulting Skills' },
      { id: '4', name: 'Data Analysis', category: 'Technical Skills' },
      { id: '5', name: 'Financial Analysis', category: 'Consulting Skills' },
      { id: '6', name: 'Project Management', category: 'Consulting Skills' },
      { id: '7', name: 'Stakeholder Management', category: 'Soft Skills' },
      { id: '8', name: 'Presentation Skills', category: 'Soft Skills' },
      { id: '9', name: 'Communication', category: 'Soft Skills' },
      { id: '10', name: 'Problem Solving', category: 'Soft Skills' },
      { id: '11', name: 'Excel', category: 'Tools' },
      { id: '12', name: 'PowerPoint', category: 'Tools' },
      { id: '13', name: 'Research', category: 'Consulting Skills' },
      { id: '14', name: 'Industry Knowledge', category: 'Consulting Skills' },
    ],
    'finance': [
      { id: '1', name: 'Financial Analysis', category: 'Finance Skills' },
      { id: '2', name: 'Accounting', category: 'Finance Skills' },
      { id: '3', name: 'Excel', category: 'Tools' },
      { id: '4', name: 'Financial Modeling', category: 'Finance Skills' },
      { id: '5', name: 'Risk Management', category: 'Finance Skills' },
      { id: '6', name: 'Python', category: 'Programming Languages' },
      { id: '7', name: 'SQL', category: 'Data Languages' },
      { id: '8', name: 'Blockchain', category: 'FinTech' },
      { id: '9', name: 'Payment Systems', category: 'FinTech' },
      { id: '10', name: 'Regulatory Compliance', category: 'Finance Skills' },
      { id: '11', name: 'Data Analysis', category: 'Technical Skills' },
      { id: '12', name: 'Reporting', category: 'Finance Skills' },
      { id: '13', name: 'Auditing', category: 'Finance Skills' },
      { id: '14', name: 'Budgeting', category: 'Finance Skills' },
    ],
    'healthcare': [
      { id: '1', name: 'Healthcare IT', category: 'Healthcare Skills' },
      { id: '2', name: 'HIPAA Compliance', category: 'Healthcare Skills' },
      { id: '3', name: 'Electronic Health Records', category: 'Healthcare Skills' },
      { id: '4', name: 'Medical Devices', category: 'Healthcare Skills' },
      { id: '5', name: 'Telemedicine', category: 'Healthcare Skills' },
      { id: '6', name: 'Python', category: 'Programming Languages' },
      { id: '7', name: 'Data Analysis', category: 'Technical Skills' },
      { id: '8', name: 'Machine Learning', category: 'Technical Skills' },
      { id: '9', name: 'Clinical Research', category: 'Healthcare Skills' },
      { id: '10', name: 'Regulatory Affairs', category: 'Healthcare Skills' },
      { id: '11', name: 'Quality Assurance', category: 'Healthcare Skills' },
      { id: '12', name: 'Project Management', category: 'Soft Skills' },
      { id: '13', name: 'Communication', category: 'Soft Skills' },
      { id: '14', name: 'Problem Solving', category: 'Soft Skills' },
    ],
    'education': [
      { id: '1', name: 'Learning Management Systems', category: 'EdTech' },
      { id: '2', name: 'Instructional Design', category: 'Education Skills' },
      { id: '3', name: 'E-Learning Platforms', category: 'EdTech' },
      { id: '4', name: 'Content Creation', category: 'Education Skills' },
      { id: '5', name: 'Curriculum Development', category: 'Education Skills' },
      { id: '6', name: 'Python', category: 'Programming Languages' },
      { id: '7', name: 'JavaScript', category: 'Programming Languages' },
      { id: '8', name: 'Video Production', category: 'Education Skills' },
      { id: '9', name: 'Assessment Design', category: 'Education Skills' },
      { id: '10', name: 'Gamification', category: 'EdTech' },
      { id: '11', name: 'Accessibility', category: 'Education Skills' },
      { id: '12', name: 'User Research', category: 'Education Skills' },
      { id: '13', name: 'Communication', category: 'Soft Skills' },
      { id: '14', name: 'Teaching', category: 'Education Skills' },
    ],
    // Education field - demo skills
    'k12': [
      { id: '1', name: 'Lesson Planning', category: 'Teaching' },
      { id: '2', name: 'Classroom Management', category: 'Teaching' },
      { id: '3', name: 'Student Assessment', category: 'Teaching' },
      { id: '4', name: 'Educational Technology', category: 'Technical' },
    ],
    'higher-ed': [
      { id: '1', name: 'Research', category: 'Academic' },
      { id: '2', name: 'Academic Writing', category: 'Academic' },
      { id: '3', name: 'Curriculum Design', category: 'Academic' },
      { id: '4', name: 'Student Advising', category: 'Academic' },
    ],
    'edtech': [
      { id: '1', name: 'Learning Management Systems', category: 'Technical' },
      { id: '2', name: 'Instructional Design', category: 'Design' },
      { id: '3', name: 'E-Learning Platforms', category: 'Technical' },
      { id: '4', name: 'JavaScript', category: 'Programming' },
    ],
    'training': [
      { id: '1', name: 'Corporate Training', category: 'Training' },
      { id: '2', name: 'Workshop Facilitation', category: 'Training' },
      { id: '3', name: 'Virtual Training', category: 'Technical' },
      { id: '4', name: 'Presentation Skills', category: 'Communication' },
    ],
    'tutoring': [
      { id: '1', name: 'One-on-One Instruction', category: 'Teaching' },
      { id: '2', name: 'Test Preparation', category: 'Teaching' },
      { id: '3', name: 'Online Tutoring', category: 'Technical' },
      { id: '4', name: 'Subject Expertise', category: 'Knowledge' },
    ],
    'curriculum': [
      { id: '1', name: 'Curriculum Design', category: 'Design' },
      { id: '2', name: 'Content Development', category: 'Content' },
      { id: '3', name: 'Assessment Design', category: 'Design' },
      { id: '4', name: 'Standards Alignment', category: 'Design' },
    ],
    // Healthcare field - demo skills
    'physician': [
      { id: '1', name: 'Patient Care', category: 'Clinical' },
      { id: '2', name: 'Diagnosis', category: 'Clinical' },
      { id: '3', name: 'Medical Records (EHR)', category: 'Technical' },
      { id: '4', name: 'Patient Communication', category: 'Communication' },
    ],
    'nursing': [
      { id: '1', name: 'Patient Care', category: 'Clinical' },
      { id: '2', name: 'Medication Administration', category: 'Clinical' },
      { id: '3', name: 'EHR Documentation', category: 'Technical' },
      { id: '4', name: 'Patient Assessment', category: 'Clinical' },
    ],
    'therapy': [
      { id: '1', name: 'Physical Therapy', category: 'Therapy' },
      { id: '2', name: 'Patient Assessment', category: 'Clinical' },
      { id: '3', name: 'Treatment Planning', category: 'Clinical' },
      { id: '4', name: 'Rehabilitation Techniques', category: 'Therapy' },
    ],
    'pharmacy': [
      { id: '1', name: 'Medication Dispensing', category: 'Pharmacy' },
      { id: '2', name: 'Prescription Verification', category: 'Pharmacy' },
      { id: '3', name: 'Patient Counseling', category: 'Communication' },
      { id: '4', name: 'Drug Interactions', category: 'Knowledge' },
    ],
    'healthtech': [
      { id: '1', name: 'EHR Systems', category: 'Technical' },
      { id: '2', name: 'HIPAA Compliance', category: 'Compliance' },
      { id: '3', name: 'Telemedicine Platforms', category: 'Technical' },
      { id: '4', name: 'Python', category: 'Programming' },
    ],
    'public-health': [
      { id: '1', name: 'Epidemiology', category: 'Research' },
      { id: '2', name: 'Data Analysis', category: 'Analytical' },
      { id: '3', name: 'Public Health Policy', category: 'Policy' },
      { id: '4', name: 'Health Education', category: 'Communication' },
    ],
    // Government field - demo skills
    'federal': [
      { id: '1', name: 'Policy Analysis', category: 'Analytical' },
      { id: '2', name: 'Grant Management', category: 'Administrative' },
      { id: '3', name: 'Compliance', category: 'Compliance' },
      { id: '4', name: 'Report Writing', category: 'Writing' },
    ],
    'state': [
      { id: '1', name: 'Policy Development', category: 'Analytical' },
      { id: '2', name: 'Program Management', category: 'Management' },
      { id: '3', name: 'Budget Management', category: 'Financial' },
      { id: '4', name: 'Stakeholder Management', category: 'Communication' },
    ],
    'local': [
      { id: '1', name: 'Municipal Operations', category: 'Administrative' },
      { id: '2', name: 'Community Engagement', category: 'Communication' },
      { id: '3', name: 'Budget Management', category: 'Financial' },
      { id: '4', name: 'Project Management', category: 'Management' },
    ],
    'military': [
      { id: '1', name: 'Leadership', category: 'Military' },
      { id: '2', name: 'Strategic Planning', category: 'Planning' },
      { id: '3', name: 'Operations Management', category: 'Management' },
      { id: '4', name: 'Security Clearance', category: 'Security' },
    ],
    'law-enforcement': [
      { id: '1', name: 'Investigation', category: 'Law Enforcement' },
      { id: '2', name: 'Report Writing', category: 'Writing' },
      { id: '3', name: 'Community Policing', category: 'Communication' },
      { id: '4', name: 'Emergency Response', category: 'Law Enforcement' },
    ],
    'public-service': [
      { id: '1', name: 'Program Management', category: 'Management' },
      { id: '2', name: 'Grant Writing', category: 'Writing' },
      { id: '3', name: 'Community Outreach', category: 'Communication' },
      { id: '4', name: 'Volunteer Management', category: 'Management' },
    ],
    // IT field - additional skills
    'cybersecurity': [
      { id: '1', name: 'Network Security', category: 'Security' },
      { id: '2', name: 'Penetration Testing', category: 'Security' },
      { id: '3', name: 'Incident Response', category: 'Security' },
      { id: '4', name: 'Python', category: 'Programming' },
    ],
    'it-support': [
      { id: '1', name: 'Help Desk Support', category: 'Support' },
      { id: '2', name: 'Troubleshooting', category: 'Technical' },
      { id: '3', name: 'Windows/Mac/Linux', category: 'Operating Systems' },
      { id: '4', name: 'Ticketing Systems', category: 'Tools' },
    ],
    // Business field - additional skills
    'operations': [
      { id: '1', name: 'Operations Management', category: 'Management' },
      { id: '2', name: 'Process Improvement', category: 'Analytical' },
      { id: '3', name: 'Supply Chain', category: 'Operations' },
      { id: '4', name: 'Excel', category: 'Tools' },
    ],
    'hr': [
      { id: '1', name: 'Recruitment', category: 'HR' },
      { id: '2', name: 'Talent Acquisition', category: 'HR' },
      { id: '3', name: 'Employee Relations', category: 'HR' },
      { id: '4', name: 'HRIS Systems', category: 'Tools' },
    ],
    'real-estate': [
      { id: '1', name: 'Property Management', category: 'Real Estate' },
      { id: '2', name: 'Sales & Leasing', category: 'Sales' },
      { id: '3', name: 'Market Analysis', category: 'Analytical' },
      { id: '4', name: 'Client Relations', category: 'Communication' },
    ],
    // Legal field - demo skills
    'lawyer': [
      { id: '1', name: 'Legal Research', category: 'Legal' },
      { id: '2', name: 'Legal Writing', category: 'Writing' },
      { id: '3', name: 'Litigation', category: 'Legal' },
      { id: '4', name: 'Client Counseling', category: 'Communication' },
    ],
    'paralegal': [
      { id: '1', name: 'Legal Research', category: 'Legal' },
      { id: '2', name: 'Document Preparation', category: 'Legal' },
      { id: '3', name: 'Case Management', category: 'Legal' },
      { id: '4', name: 'Client Communication', category: 'Communication' },
    ],
    'compliance': [
      { id: '1', name: 'Regulatory Compliance', category: 'Compliance' },
      { id: '2', name: 'Risk Assessment', category: 'Analytical' },
      { id: '3', name: 'Policy Development', category: 'Writing' },
      { id: '4', name: 'Auditing', category: 'Analytical' },
    ],
    'legal-tech': [
      { id: '1', name: 'Legal Software Development', category: 'Technical' },
      { id: '2', name: 'E-Discovery', category: 'Technical' },
      { id: '3', name: 'Python', category: 'Programming' },
      { id: '4', name: 'Legal Knowledge', category: 'Knowledge' },
    ],
    // Engineering field - demo skills
    'civil': [
      { id: '1', name: 'Structural Design', category: 'Engineering' },
      { id: '2', name: 'CAD (AutoCAD)', category: 'Tools' },
      { id: '3', name: 'Project Management', category: 'Management' },
      { id: '4', name: 'Site Planning', category: 'Engineering' },
    ],
    'mechanical': [
      { id: '1', name: 'Mechanical Design', category: 'Engineering' },
      { id: '2', name: 'CAD (SolidWorks)', category: 'Tools' },
      { id: '3', name: 'Manufacturing Processes', category: 'Engineering' },
      { id: '4', name: 'Project Management', category: 'Management' },
    ],
    'electrical': [
      { id: '1', name: 'Circuit Design', category: 'Engineering' },
      { id: '2', name: 'Power Systems', category: 'Engineering' },
      { id: '3', name: 'PLC Programming', category: 'Programming' },
      { id: '4', name: 'Testing & Validation', category: 'Engineering' },
    ],
    'chemical': [
      { id: '1', name: 'Process Design', category: 'Engineering' },
      { id: '2', name: 'Safety Protocols', category: 'Safety' },
      { id: '3', name: 'Process Optimization', category: 'Engineering' },
      { id: '4', name: 'Quality Control', category: 'Quality' },
    ],
    'aerospace': [
      { id: '1', name: 'Aircraft Design', category: 'Engineering' },
      { id: '2', name: 'Aerodynamics', category: 'Knowledge' },
      { id: '3', name: 'CAD (CATIA)', category: 'Tools' },
      { id: '4', name: 'Systems Engineering', category: 'Engineering' },
    ],
    'construction': [
      { id: '1', name: 'Construction Management', category: 'Management' },
      { id: '2', name: 'Project Planning', category: 'Planning' },
      { id: '3', name: 'Blueprint Reading', category: 'Technical' },
      { id: '4', name: 'Safety Management', category: 'Safety' },
    ],
    // Sales field - additional skills
    'sales': [
      { id: '1', name: 'Sales Process', category: 'Sales' },
      { id: '2', name: 'Lead Generation', category: 'Sales' },
      { id: '3', name: 'Negotiation', category: 'Negotiation' },
      { id: '4', name: 'CRM Systems', category: 'Tools' },
    ],
    'advertising': [
      { id: '1', name: 'Campaign Strategy', category: 'Marketing' },
      { id: '2', name: 'Creative Development', category: 'Creative' },
      { id: '3', name: 'Media Planning', category: 'Marketing' },
      { id: '4', name: 'Analytics', category: 'Analytical' },
    ],
    'pr': [
      { id: '1', name: 'Media Relations', category: 'PR' },
      { id: '2', name: 'Press Releases', category: 'Writing' },
      { id: '3', name: 'Crisis Management', category: 'PR' },
      { id: '4', name: 'Social Media', category: 'Marketing' },
    ],
    // Creative field - additional skills
    'writing': [
      { id: '1', name: 'Content Writing', category: 'Writing' },
      { id: '2', name: 'Copywriting', category: 'Writing' },
      { id: '3', name: 'SEO Writing', category: 'Writing' },
      { id: '4', name: 'Editing', category: 'Writing' },
    ],
    'media': [
      { id: '1', name: 'Video Production', category: 'Media' },
      { id: '2', name: 'Video Editing', category: 'Media' },
      { id: '3', name: 'Photography', category: 'Media' },
      { id: '4', name: 'Adobe Premiere', category: 'Tools' },
    ],
    'arts': [
      { id: '1', name: 'Fine Arts', category: 'Artistic' },
      { id: '2', name: 'Illustration', category: 'Artistic' },
      { id: '3', name: 'Digital Art', category: 'Artistic' },
      { id: '4', name: 'Adobe Creative Suite', category: 'Tools' },
    ],
    // Science field - demo skills
    'research': [
      { id: '1', name: 'Research Design', category: 'Research' },
      { id: '2', name: 'Data Collection', category: 'Research' },
      { id: '3', name: 'Statistical Analysis', category: 'Research' },
      { id: '4', name: 'Scientific Writing', category: 'Writing' },
    ],
    'lab': [
      { id: '1', name: 'Laboratory Techniques', category: 'Technical' },
      { id: '2', name: 'Sample Preparation', category: 'Technical' },
      { id: '3', name: 'Quality Control', category: 'Quality' },
      { id: '4', name: 'Report Writing', category: 'Writing' },
    ],
    'biotech': [
      { id: '1', name: 'Molecular Biology', category: 'Knowledge' },
      { id: '2', name: 'Cell Culture', category: 'Technical' },
      { id: '3', name: 'PCR', category: 'Technical' },
      { id: '4', name: 'Data Analysis', category: 'Analytical' },
    ],
    'environmental': [
      { id: '1', name: 'Environmental Assessment', category: 'Environmental' },
      { id: '2', name: 'Field Sampling', category: 'Environmental' },
      { id: '3', name: 'Data Analysis', category: 'Analytical' },
      { id: '4', name: 'GIS Mapping', category: 'Tools' },
    ],
    // Service field - demo skills
    'hospitality': [
      { id: '1', name: 'Customer Service', category: 'Service' },
      { id: '2', name: 'Guest Relations', category: 'Service' },
      { id: '3', name: 'Event Planning', category: 'Planning' },
      { id: '4', name: 'Reservation Systems', category: 'Tools' },
    ],
    'customer-service': [
      { id: '1', name: 'Customer Support', category: 'Service' },
      { id: '2', name: 'Problem Resolution', category: 'Service' },
      { id: '3', name: 'Communication', category: 'Communication' },
      { id: '4', name: 'Ticketing Systems', category: 'Tools' },
    ],
    'retail': [
      { id: '1', name: 'Sales', category: 'Sales' },
      { id: '2', name: 'Customer Service', category: 'Service' },
      { id: '3', name: 'Merchandising', category: 'Retail' },
      { id: '4', name: 'POS Systems', category: 'Tools' },
    ],
    'food-service': [
      { id: '1', name: 'Food Preparation', category: 'Food Service' },
      { id: '2', name: 'Kitchen Management', category: 'Management' },
      { id: '3', name: 'Food Safety', category: 'Safety' },
      { id: '4', name: 'Customer Service', category: 'Service' },
    ],
    'other': [
      { id: '1', name: 'Communication', category: 'Soft Skills' },
      { id: '2', name: 'Problem Solving', category: 'Soft Skills' },
      { id: '3', name: 'Project Management', category: 'Soft Skills' },
      { id: '4', name: 'Adaptability', category: 'Soft Skills' },
    ],
  }

  // Get filtered skills based on selected industry
  const skillOptions = selectedIndustry ? (skillsByIndustry[selectedIndustry] || skillsByIndustry['other']) : []

  const toggleSkill = (skillName: string) => {
    setSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    )
  }

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('handleNext called, current step:', step)
    
    if (step === 'welcome') {
      setStep('field')
    } else if (step === 'field') {
      console.log('Moving from field to industry, selectedField:', selectedField)
      setStep('industry')
    } else if (step === 'industry') {
      console.log('Moving from industry to skills, selectedIndustry:', selectedIndustry)
      setStep('skills')
    } else if (step === 'skills') {
      setStep('portfolio')
    } else if (step === 'portfolio') {
      setStep('preferences')
    } else if (step === 'preferences') {
      // Check for PII in resume text
      if (resumeText) {
        // Simulate PII detection (in production, call API)
        const hasPII = /@|email|phone|\d{3}-\d{2}-\d{4}/i.test(resumeText)
        if (hasPII) {
          const emails = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/g) || []
          const redactedText = resumeText
            .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]')
            .replace(/\d{3}-\d{2}-\d{4}/g, '[SSN]')
          
          setPiiData({
            original_text: resumeText,
            redacted_text: redactedText,
            removed_items: [
              ...emails.map(email => ({ type: 'email', value: email, reason: 'Email address detected' })),
              ...(/\d{3}-\d{2}-\d{4}/.test(resumeText) ? [{ type: 'ssn', value: '[REDACTED]', reason: 'SSN pattern detected' }] : [])
            ],
            redaction_summary: 'Found potential PII in your resume'
          })
          setShowPiiVerification(true)
          return
        }
      }
      setStep('complete')
    }
  }

  const handlePiiAccept = () => {
    setShowPiiVerification(false)
    setStep('complete')
  }

  const handlePiiCancel = () => {
    setShowPiiVerification(false)
    setResumeText('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to JobMatch Assessment
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Let's build your anonymous profile. This will help us match you with the right opportunities.
            </p>
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {step === 'field' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What field do you work in?
              </h2>
              <p className="text-xl text-gray-600">
                Select the broad category that best describes your work.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {fields.map((field) => (
                <button
                  key={field.id}
                  onClick={() => setSelectedField(field.id)}
                  className={`p-6 rounded-2xl border-4 transition-all transform hover:scale-105 text-left ${
                    selectedField === field.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{field.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {field.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {field.description}
                      </p>
                    </div>
                    {selectedField === field.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('welcome')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (selectedField) {
                    handleNext(e)
                  }
                }}
                disabled={!selectedField}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 'industry' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What's your specific area?
              </h2>
              <p className="text-xl text-gray-600">
                Select the specific industry or domain within {fields.find(f => f.id === selectedField)?.name || 'your field'}. This helps us show you the most relevant skills.
              </p>
            </div>

            {/* Search input */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search industries, job titles, or SOC codes..."
                value={industrySearchTerm}
                onChange={(e) => setIndustrySearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
              />
              {industrySearchTerm && (
                <p className="mt-2 text-sm text-gray-500">
                  Showing results for "{industrySearchTerm}"
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {(selectedField && industriesByField[selectedField] 
                ? industriesByField[selectedField].filter(industry => 
                    industrySearchTerm === '' || 
                    industry.name.toLowerCase().includes(industrySearchTerm.toLowerCase()) ||
                    industry.description.toLowerCase().includes(industrySearchTerm.toLowerCase())
                  )
                : []
              ).map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`p-6 rounded-2xl border-4 transition-all transform hover:scale-105 text-left ${
                    selectedIndustry === industry.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{industry.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {industry.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {industry.description}
                      </p>
                    </div>
                    {selectedIndustry === industry.id && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('field')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (selectedIndustry) {
                    handleNext(e)
                  }
                }}
                disabled={!selectedIndustry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Skills →
              </button>
            </div>
          </div>
        )}

        {step === 'skills' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Select Your Skills</h2>
            <SkillBubbles
              availableSkills={skillOptions}
              selectedSkills={skillOptions.filter(s => skills.includes(s.name))}
              onSkillsChange={(selectedSkills) => {
                console.log('onSkillsChange called with:', selectedSkills)
                const skillNames = selectedSkills.map(s => s.name)
                console.log('Setting skills to:', skillNames)
                setSkills(skillNames)
                console.log('Current skills state will be:', skillNames)
              }}
              onContinue={() => {
                console.log('Continue from SkillBubbles clicked, advancing to portfolio')
                handleNext()
              }}
              canvasMode={true}
            />
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setStep('industry')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Skills continue clicked, skills count:', skills.length)
                  if (skills.length > 0) {
                    handleNext(e)
                  } else {
                    console.warn('Cannot continue: no skills selected')
                  }
                }}
                disabled={skills.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'portfolio' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Portfolio URL</h2>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
            />
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or paste your resume text:
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume here..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep('skills')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Work Preferences</h2>
            <div className="space-y-4 mb-6">
              <label className="block">
                <input
                  type="radio"
                  name="preference"
                  value="remote"
                  checked={preference === 'remote'}
                  onChange={(e) => setPreference(e.target.value)}
                  className="mr-2"
                />
                Remote Work
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="preference"
                  value="hybrid"
                  checked={preference === 'hybrid'}
                  onChange={(e) => setPreference(e.target.value)}
                  className="mr-2"
                />
                Hybrid
              </label>
              <label className="block">
                <input
                  type="radio"
                  name="preference"
                  value="onsite"
                  checked={preference === 'onsite'}
                  onChange={(e) => setPreference(e.target.value)}
                  className="mr-2"
                />
                On-site
              </label>
            </div>
            <textarea
              value={preferenceReason}
              onChange={(e) => setPreferenceReason(e.target.value)}
              placeholder="Why do you prefer this? (optional)"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setStep('portfolio')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!preference}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Assessment
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Assessment Complete!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Your anonymous profile has been created. We'll start matching you with opportunities soon.
              </p>
            </div>

            <div className="flex flex-col gap-4 items-center mb-8">
              <Link
                to="/matches"
                className="px-12 py-6 bg-blue-600 text-white rounded-2xl text-2xl font-bold hover:bg-blue-700 shadow-xl hover:scale-105 transition-all"
              >
                Browse Opportunities →
              </Link>
              <Link
                to="/"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-50 border-2 border-gray-200 transition"
              >
                Back to Home
              </Link>
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
  )
}

