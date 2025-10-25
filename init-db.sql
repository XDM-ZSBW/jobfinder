-- JobMatch AI Initial Database Schema
-- This creates all tables from the Prisma schema

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('JOB_SEEKER', 'HIRING_MANAGER', 'ADMIN');
CREATE TYPE "ApplicationStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'REJECTED', 'ACCEPTED');

-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  role "UserRole" NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "User_email_idx" ON "User"(email);

-- Create JobSeekerProfile table
CREATE TABLE "JobSeekerProfile" (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "resumeUrl" TEXT,
  phone TEXT,
  location TEXT,
  skills TEXT[],
  experience JSONB,
  education JSONB,
  summary TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create HiringManagerProfile table
CREATE TABLE "HiringManagerProfile" (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  phone TEXT,
  verified BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Job table
CREATE TABLE "Job" (
  id TEXT PRIMARY KEY,
  "hiringManagerId" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  location TEXT NOT NULL,
  "salaryMin" INTEGER,
  "salaryMax" INTEGER,
  "remoteOk" BOOLEAN DEFAULT false NOT NULL,
  "employmentType" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("hiringManagerId") REFERENCES "HiringManagerProfile"(id) ON DELETE CASCADE
);

CREATE INDEX "Job_isActive_createdAt_idx" ON "Job"("isActive", "createdAt");

-- Create Application table
CREATE TABLE "Application" (
  id TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  status "ApplicationStatus" DEFAULT 'SUBMITTED' NOT NULL,
  "coverLetter" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("jobId") REFERENCES "Job"(id) ON DELETE CASCADE,
  FOREIGN KEY ("candidateId") REFERENCES "JobSeekerProfile"(id) ON DELETE CASCADE,
  UNIQUE("jobId", "candidateId")
);

CREATE INDEX "Application_status_createdAt_idx" ON "Application"(status, "createdAt");

-- Create Match table
CREATE TABLE "Match" (
  id TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "candidateId" TEXT NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  strengths TEXT[],
  gaps TEXT[],
  reasoning TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("jobId") REFERENCES "Job"(id) ON DELETE CASCADE,
  FOREIGN KEY ("candidateId") REFERENCES "JobSeekerProfile"(id) ON DELETE CASCADE,
  UNIQUE("jobId", "candidateId")
);

CREATE INDEX "Match_score_idx" ON "Match"(score);

-- Create Message table
CREATE TABLE "Message" (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("senderId") REFERENCES "User"(id) ON DELETE CASCADE,
  FOREIGN KEY ("receiverId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX "Message_senderId_receiverId_createdAt_idx" ON "Message"("senderId", "receiverId", "createdAt");

-- Create Prisma migrations table
CREATE TABLE "_prisma_migrations" (
  id VARCHAR(36) PRIMARY KEY,
  checksum VARCHAR(64) NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  migration_name VARCHAR(255) NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  applied_steps_count INTEGER DEFAULT 0 NOT NULL
);

SELECT 'Database schema created successfully!' as status;
