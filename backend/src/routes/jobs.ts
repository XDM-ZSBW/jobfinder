import { Router, Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Analyze job posting
router.post('/analyze', authenticateToken, async (req: any, res: Response) => {
  try {
    const { description, title, company } = req.body;

    if (!description) {
      return res.status(400).json({ 
        error: 'Job description is required' 
      });
    }

    // Use AI service to analyze the job posting
    const analysis = await aiService.analyzeJobPosting(description);

    res.json({
      title: title || 'Unknown Title',
      company: company || 'Unknown Company',
      isLegitimate: analysis.isLegitimate,
      redFlags: analysis.redFlags,
      suggestions: analysis.suggestions,
      requiredSkills: extractSkillsFromDescription(description),
      experienceLevel: extractExperienceLevel(description),
      jobType: extractJobType(description)
    });
  } catch (error) {
    logger.error('Job analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze job',
      message: error instanceof Error ? error.message : 'Analysis failed'
    });
  }
});

// Calculate match score between user and job
router.post('/match', authenticateToken, async (req: any, res: Response) => {
  try {
    const { jobDescription, resumeText } = req.body;

    if (!jobDescription || !resumeText) {
      return res.status(400).json({ 
        error: 'Job description and resume text are required' 
      });
    }

    // Create candidate profile from resume text
    const candidateProfile = {
      resume: resumeText,
      skills: extractSkillsFromResume(resumeText),
      experience: extractExperienceFromResume(resumeText)
    };

    // Create job profile from description
    const jobProfile = {
      description: jobDescription,
      requirements: extractSkillsFromDescription(jobDescription),
      experienceLevel: extractExperienceLevel(jobDescription)
    };

    // Calculate match score using AI service
    const matchResult = await aiService.calculateMatchScore(candidateProfile, jobProfile);

    res.json({
      matchScore: Math.round(matchResult.score),
      matchingSkills: matchResult.strengths,
      missingSkills: matchResult.gaps,
      reasoning: matchResult.reasoning,
      recommendations: generateRecommendations(matchResult)
    });
  } catch (error) {
    logger.error('Job matching error:', error);
    res.status(500).json({ 
      error: 'Failed to calculate match score',
      message: error instanceof Error ? error.message : 'Matching failed'
    });
  }
});

// Helper functions
function extractSkillsFromDescription(description: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'Agile', 'Scrum', 'Machine Learning', 'Data Analysis',
    'Project Management', 'Communication', 'Leadership'
  ];
  
  const foundSkills: string[] = [];
  const lowerDesc = description.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

function extractExperienceLevel(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('senior') || lowerDesc.includes('lead') || lowerDesc.includes('5+ years')) {
    return 'Senior';
  } else if (lowerDesc.includes('junior') || lowerDesc.includes('entry') || lowerDesc.includes('0-2 years')) {
    return 'Junior';
  } else if (lowerDesc.includes('mid') || lowerDesc.includes('3-5 years')) {
    return 'Mid-level';
  }
  
  return 'Not specified';
}

function extractJobType(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('full-time') || lowerDesc.includes('full time')) {
    return 'Full-time';
  } else if (lowerDesc.includes('part-time') || lowerDesc.includes('part time')) {
    return 'Part-time';
  } else if (lowerDesc.includes('contract')) {
    return 'Contract';
  } else if (lowerDesc.includes('internship')) {
    return 'Internship';
  }
  
  return 'Not specified';
}

function extractSkillsFromResume(resumeText: string): string[] {
  // Simple skill extraction from resume text
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
    'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git',
    'Agile', 'Scrum', 'Machine Learning', 'Data Analysis',
    'Project Management', 'Communication', 'Leadership'
  ];
  
  const foundSkills: string[] = [];
  const lowerResume = resumeText.toLowerCase();
  
  commonSkills.forEach(skill => {
    if (lowerResume.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

function extractExperienceFromResume(resumeText: string): string {
  // Extract years of experience from resume
  const yearsMatch = resumeText.match(/(\d+)\+?\s*years?/i);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years >= 5) return 'Senior';
    if (years >= 3) return 'Mid-level';
    return 'Junior';
  }
  
  return 'Not specified';
}

function generateRecommendations(matchResult: any): string[] {
  const recommendations: string[] = [];
  
  if (matchResult.score < 60) {
    recommendations.push('Consider gaining experience in the missing skills before applying');
    recommendations.push('Look for similar roles with lower requirements to build experience');
  } else if (matchResult.score >= 80) {
    recommendations.push('This is an excellent match! Highlight your relevant experience in your application');
    recommendations.push('Consider applying soon as this role seems well-suited for your background');
  } else {
    recommendations.push('Good match with room for improvement in specific areas');
    recommendations.push('Consider taking courses or projects to fill skill gaps');
  }
  
  if (matchResult.gaps.length > 0) {
    recommendations.push(`Focus on developing: ${matchResult.gaps.slice(0, 3).join(', ')}`);
  }
  
  return recommendations;
}

export default router;