import ollama
import json
from typing import List, Dict, Optional
import os

class OllamaAIService:
    """
    AI service using Ollama (llama3.2) for capability extraction.
    
    Invariants:
    - Results queued for human review, never auto-applied
    - Extract capabilities, not credentials
    - Maintain anonymity (no PII processing)
    """
    
    def __init__(self):
        self.model = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
        self.client = ollama.Client(host=self.base_url)
    
    def parse_resume(self, resume_text: str) -> Dict[str, any]:
        """
        Extract capabilities from resume text.
        
        Returns:
        {
            "skills": ["Python", "FastAPI", ...],
            "capabilities": ["Backend development", ...],
            "confidence": "high" | "medium" | "low",
            "reasoning": "Explanation of extraction"
        }
        """
        prompt = self._build_resume_parsing_prompt(resume_text)
        
        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                stream=False
            )
            
            # Parse structured output
            result = self._parse_llm_response(response['response'])
            return result
            
        except Exception as e:
            return {
                "skills": [],
                "capabilities": [],
                "confidence": "low",
                "reasoning": f"Error during parsing: {str(e)}",
                "error": str(e)
            }
    
    def analyze_assessment(
        self,
        skills: List[str],
        portfolio_url: Optional[str],
        work_preference: str,
        work_preference_reason: Optional[str]
    ) -> Dict[str, any]:
        """
        Analyze assessment submission for quality and completeness.
        
        Returns analysis for human review, does NOT auto-approve.
        """
        prompt = self._build_assessment_analysis_prompt(
            skills, portfolio_url, work_preference, work_preference_reason
        )
        
        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                stream=False
            )
            
            return {
                "analysis": response['response'],
                "confidence": self._assess_confidence(response['response']),
                "requires_review": True  # Always requires human review
            }
            
        except Exception as e:
            return {
                "analysis": f"Error during analysis: {str(e)}",
                "confidence": "low",
                "requires_review": True,
                "error": str(e)
            }
    
    def generate_match_rationale(
        self,
        user_skills: List[str],
        job_requirements: List[str],
        match_score: int
    ) -> str:
        """Generate explanation for why a match was created"""
        prompt = f"""Explain why this is a {match_score}% match between a candidate and a job.

Candidate capabilities: {', '.join(user_skills)}
Job requirements: {', '.join(job_requirements)}

Provide a concise 2-3 sentence explanation focusing on overlapping capabilities.
Do NOT mention credentials, degrees, or job titles."""

        try:
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                stream=False
            )
            return response['response']
        except Exception as e:
            return f"Match based on {len(set(user_skills) & set(job_requirements))} overlapping capabilities."
    
    def _build_resume_parsing_prompt(self, resume_text: str) -> str:
        """Build prompt for resume capability extraction"""
        return f"""You are an expert at identifying technical capabilities from resumes.

CRITICAL RULES:
1. Extract CAPABILITIES (what they can DO), not credentials (degrees, job titles)
2. Focus on: technologies used, problems solved, systems built
3. Ignore: company names, job titles, degree names, dates
4. Output ONLY technical skills and capabilities

Resume text:
{resume_text}

Extract and list:
1. Technical skills (programming languages, frameworks, tools)
2. Capability areas (e.g., "Backend development", "Data analysis", "API design")

Format your response as JSON:
{{
  "skills": ["skill1", "skill2", ...],
  "capabilities": ["capability1", ...],
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation"
}}"""

    def _build_assessment_analysis_prompt(
        self,
        skills: List[str],
        portfolio_url: Optional[str],
        work_preference: str,
        work_preference_reason: Optional[str]
    ) -> str:
        """Build prompt for assessment quality analysis"""
        return f"""Analyze this job seeker assessment for quality and completeness.

Skills claimed: {', '.join(skills)}
Portfolio: {portfolio_url or 'Not provided'}
Work preference: {work_preference}
Reasoning: {work_preference_reason or 'Not provided'}

Evaluate:
1. Skill diversity (too narrow or well-rounded?)
2. Portfolio presence (helpful for verification)
3. Self-awareness (thoughtful work preference reasoning?)
4. Red flags (suspicious patterns, spam)

Provide a brief 3-4 sentence analysis. Focus on quality, not credentials."""

    def _parse_llm_response(self, response_text: str) -> Dict:
        """Parse structured JSON from LLM response"""
        try:
            # Try to extract JSON from response
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end > start:
                json_str = response_text[start:end]
                return json.loads(json_str)
        except:
            pass
        
        # Fallback: return raw text
        return {
            "skills": [],
            "capabilities": [],
            "confidence": "low",
            "reasoning": response_text
        }
    
    def _assess_confidence(self, analysis_text: str) -> str:
        """Assess confidence level from analysis text"""
        text_lower = analysis_text.lower()
        
        negative_indicators = [
            'unclear', 'suspicious', 'limited', 'minimal',
            'red flag', 'concerning', 'vague', 'incomplete'
        ]
        positive_indicators = [
            'strong', 'comprehensive', 'detailed', 'clear',
            'well-rounded', 'diverse', 'thoughtful', 'thorough'
        ]
        
        negative_count = sum(1 for word in negative_indicators if word in text_lower)
        positive_count = sum(1 for word in positive_indicators if word in text_lower)
        
        if positive_count >= 2 and negative_count == 0:
            return "high"
        elif negative_count >= 2:
            return "low"
        else:
            return "medium"
