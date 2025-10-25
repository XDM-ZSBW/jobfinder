# JobMatch AI API Documentation

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "JOB_SEEKER" // or "HIRING_MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "JOB_SEEKER"
    },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token"
  }
}
```

### Jobs

#### GET /jobs
Get all active jobs with optional filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 20)
- `location` (string): Filter by location
- `remoteOk` (boolean): Filter remote jobs
- `search` (string): Search in title/description

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [/* job objects */],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

#### POST /jobs
Create a new job posting (Hiring Manager only).

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "JavaScript", "React"],
  "location": "San Francisco, CA",
  "salaryMin": 120000,
  "salaryMax": 180000,
  "remoteOk": true,
  "employmentType": "Full-time"
}
```

#### GET /jobs/:id
Get a specific job by ID.

#### PUT /jobs/:id
Update a job posting (Hiring Manager only, own jobs).

#### DELETE /jobs/:id
Deactivate a job posting (Hiring Manager only, own jobs).

### Applications

#### POST /applications
Submit a job application.

**Request Body:**
```json
{
  "jobId": "job_id",
  "coverLetter": "I am excited to apply..."
}
```

#### GET /applications
Get user's applications (Job Seeker) or applications for jobs (Hiring Manager).

**Query Parameters:**
- `status` (string): Filter by status
- `jobId` (string): Filter by specific job

#### PATCH /applications/:id
Update application status (Hiring Manager only).

**Request Body:**
```json
{
  "status": "INTERVIEW_SCHEDULED"
}
```

### Matches

#### GET /matches
Get AI-matched jobs for candidate or candidates for job.

**Query Parameters:**
- `jobId` (string): Get matches for specific job (Hiring Manager)
- `candidateId` (string): Get job matches for candidate (Job Seeker)
- `minScore` (number): Minimum match score (0-100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "match_id",
      "jobId": "job_id",
      "candidateId": "candidate_id",
      "score": 85,
      "strengths": ["React expertise", "5+ years experience"],
      "gaps": ["AWS experience"],
      "reasoning": "Strong match based on technical skills..."
    }
  ]
}
```

#### POST /matches/calculate
Manually trigger match calculation for a job-candidate pair.

**Request Body:**
```json
{
  "jobId": "job_id",
  "candidateId": "candidate_id"
}
```

### Messages

#### GET /messages
Get messages between users.

**Query Parameters:**
- `conversationWith` (string): User ID of conversation partner

#### POST /messages
Send a message to another user.

**Request Body:**
```json
{
  "receiverId": "user_id",
  "content": "Hello, I'd like to discuss..."
}
```

#### PATCH /messages/:id/read
Mark a message as read.

### User Profiles

#### GET /profile
Get current user's profile.

#### PUT /profile
Update current user's profile.

**Job Seeker Request Body:**
```json
{
  "phone": "555-1234",
  "location": "New York, NY",
  "skills": ["JavaScript", "React", "Node.js"],
  "summary": "Experienced full-stack developer..."
}
```

**Hiring Manager Request Body:**
```json
{
  "company": "Tech Corp",
  "title": "Engineering Manager",
  "phone": "555-5678"
}
```

#### POST /profile/resume
Upload and parse resume (Job Seeker only).

**Request:**
- Multipart form data with resume file
- Supported formats: PDF, DOCX

**Response:**
```json
{
  "success": true,
  "data": {
    "parsed": {
      "skills": ["JavaScript", "Python"],
      "experience": [/* parsed experience */],
      "education": [/* parsed education */]
    }
  }
}
```

## WebSocket Events

Connect to WebSocket server at `http://localhost:4000`

### Events

#### `message:new`
Emitted when a new message is received.

**Payload:**
```json
{
  "id": "message_id",
  "senderId": "sender_id",
  "content": "Message content",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### `application:status_changed`
Emitted when application status changes.

**Payload:**
```json
{
  "applicationId": "app_id",
  "status": "INTERVIEW_SCHEDULED",
  "jobId": "job_id"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
