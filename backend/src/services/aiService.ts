import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSecrets } from '../config/secrets';
import { logger } from '../utils/logger';

let genAI: GoogleGenerativeAI;

/**
 * Initialize Gemini AI client with API key from Secret Manager
 */
async function getGeminiClient() {
  if (!genAI) {
    const secrets = await getSecrets();
    genAI = new GoogleGenerativeAI(secrets.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Helper to parse JSON from Gemini response (handles markdown wrapping)
 */
function parseGeminiJSON(text: string): any {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * AI Service for resume parsing, job matching, and scoring using Google Gemini Pro
 */
export class AIService {
  /**
   * Parse resume text and extract structured information
   */
  async parseResume(resumeText: string) {
    try {
      const ai = await getGeminiClient();

      const prompt = `You are a resume parsing assistant. Extract key information from this resume and return ONLY a valid JSON object (no markdown, no explanation) with these fields:
- name: candidate's full name
- email: email address  
- phone: phone number
- skills: array of technical and soft skills
- experience: array of work experiences with {company, title, duration, description}
- education: array of education with {institution, degree, field, year}
- summary: brief professional summary

Resume:
${resumeText}

JSON output:`;

      const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsed = parseGeminiJSON(text);
      
      logger.info('Resume parsed successfully with Gemini Pro');
      return parsed;
    } catch (error) {
      logger.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume');
    }
  }

  /**
   * Calculate match score between a candidate and a job
   */
  async calculateMatchScore(
    candidateProfile: any,
    jobDescription: any
  ): Promise<{
    score: number;
    strengths: string[];
    gaps: string[];
    reasoning: string;
  }> {
    try {
      const ai = await getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

      const prompt = `You are a job matching AI. Analyze the candidate's profile against the job requirements and return ONLY a valid JSON object with:
- score: number from 0-100 representing match quality
- strengths: array of matching qualifications
- gaps: array of missing qualifications
- reasoning: brief explanation of the score

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

Job Description:
${JSON.stringify(jobDescription, null, 2)}

JSON output:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const matchResult = parseGeminiJSON(text);
      logger.info(`Match score calculated with Gemini Pro: ${matchResult.score}`);
      return matchResult;
    } catch (error) {
      logger.error('Error calculating match score:', error);
      throw new Error('Failed to calculate match score');
    }
  }

  /**
   * Generate interview questions based on job requirements
   */
  async generateInterviewQuestions(
    jobDescription: string,
    candidateProfile: any
  ): Promise<string[]> {
    try {
      const ai = await getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

      const prompt = `Generate 5-7 relevant interview questions based on the job requirements and candidate's background. Return ONLY a valid JSON object with a "questions" array of strings.

Job Description:
${jobDescription}

Candidate Profile:
${JSON.stringify(candidateProfile, null, 2)}

JSON output (format: {"questions": ["question 1", "question 2", ...]}):`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsed = parseGeminiJSON(text);
      return parsed.questions || [];
    } catch (error) {
      logger.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  /**
   * Analyze job posting for potential red flags or issues
   */
  async analyzeJobPosting(jobDescription: string): Promise<{
    isLegitimate: boolean;
    redFlags: string[];
    suggestions: string[];
  }> {
    try {
      const ai = await getGeminiClient();
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-pro' });

      const prompt = `Analyze this job posting for legitimacy and quality. Look for:

LEGITIMACY INDICATORS:
- Vague or missing job descriptions
- Unrealistic salary ranges
- Non-corporate email domains (Gmail, Yahoo for businesses)
- Urgency language ("immediate need", "start today")
- Requests for personal info upfront (SSN, bank info)
- Poor grammar or unprofessional language
- Missing company details

Return ONLY a valid JSON object with:
- isLegitimate: true if this appears to be a legitimate job posting
- redFlags: array of specific concerning elements found (empty if legitimate)
- suggestions: array of improvement suggestions for the posting

Job Posting:
${jobDescription}

JSON output:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return parseGeminiJSON(text);
    } catch (error) {
      logger.error('Error analyzing job posting:', error);
      
      // Return safe defaults on error to prevent zero scores
      return {
        isLegitimate: true,
        redFlags: [],
        suggestions: ['Unable to analyze job posting automatically']
      };
    }
  }

  /**
   * Generate personalized job recommendations
   */
  async generateRecommendations(
    candidateProfile: any,
    availableJobs: any[]
  ): Promise<Array<{ jobId: string; score: number; reason: string }>> {
    try {
      const scores = await Promise.all(
        availableJobs.map(async (job) => {
          const match = await this.calculateMatchScore(candidateProfile, job);
          return {
            jobId: job.id,
            score: match.score,
            reason: match.reasoning,
          };
        })
      );

      // Sort by score descending
      return scores.sort((a, b) => b.score - a.score);
    } catch (error) {
      logger.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }
}

export const aiService = new AIService();
