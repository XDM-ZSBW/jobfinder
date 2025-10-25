// User types
export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  HIRING_MANAGER = 'HIRING_MANAGER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Job Seeker types
export interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface JobSeekerProfile {
  id: string;
  userId: string;
  resumeUrl?: string;
  phone?: string;
  location?: string;
  skills: string[];
  experience?: WorkExperience[];
  education?: Education[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Hiring Manager types
export interface HiringManagerProfile {
  id: string;
  userId: string;
  company: string;
  title: string;
  phone?: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Job types
export interface Job {
  id: string;
  hiringManagerId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  remoteOk: boolean;
  employmentType: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Application types
export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  coverLetter?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Match types
export interface Match {
  id: string;
  jobId: string;
  candidateId: string;
  score: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
