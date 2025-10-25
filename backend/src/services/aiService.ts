import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Service for resume parsing, job matching, and scoring
 */
export class AIService {
  /**
   * Parse resume text and extract structured information
   */
  async parseResume(resumeText: string) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a resume parsing assistant. Extract key information from resumes and return a structured JSON object with the following fields:
            - name: candidate's full name
            - email: email address
            - phone: phone number
            - skills: array of technical and soft skills
            - experience: array of work experiences with {company, title, duration, description}
            - education: array of education with {institution, degree, field, year}
            - summary: brief professional summary`,
          },
          {
            role: 'user',
            content: resumeText,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const parsed = JSON.parse(completion.choices[0].message.content || '{}');
      logger.info('Resume parsed successfully');
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
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a job matching AI. Analyze the candidate's profile against the job requirements and return a JSON object with:
            - score: number from 0-100 representing match quality
            - strengths: array of matching qualifications
            - gaps: array of missing qualifications
            - reasoning: brief explanation of the score`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              candidate: candidateProfile,
              job: jobDescription,
            }),
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      logger.info(`Match score calculated: ${result.score}`);
      return result;
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
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Generate 5-7 relevant interview questions based on the job requirements and candidate's background. Return as a JSON array of strings.`,
          },
          {
            role: 'user',
            content: JSON.stringify({
              job: jobDescription,
              candidate: candidateProfile,
            }),
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      return result.questions || [];
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
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Analyze this job posting for legitimacy. Return JSON with:
            - isLegitimate: boolean
            - redFlags: array of concerning elements
            - suggestions: array of improvements`,
          },
          {
            role: 'user',
            content: jobDescription,
          },
        ],
        response_format: { type: 'json_object' },
      });

      return JSON.parse(completion.choices[0].message.content || '{}');
    } catch (error) {
      logger.error('Error analyzing job posting:', error);
      throw new Error('Failed to analyze job posting');
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
