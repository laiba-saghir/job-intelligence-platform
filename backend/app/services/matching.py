from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.user import User
from app.models.skill import Skill


def calculate_match_score(user_skills: List[str], job_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """
    Calculate match score between user skills and job requirements.
    
    DSA Concepts Used:
    - Sets for O(1) lookup
    - Set operations for difference and intersection
    
    Args:
        user_skills: List of user's skill names
        job_skills: List of job's required skill names
    
    Returns:
        Tuple of (match_score, matched_skills, missing_skills)
    """
    # Convert to sets for O(1) lookup
    user_set = set(skill.lower().strip() for skill in user_skills)
    job_set = set(skill.lower().strip() for skill in job_skills)
    
    if not job_set:
        return 0.0, [], []
    
    # Set intersection - skills user has that job requires
    matched = user_set & job_set
    
    # Set difference - skills job requires that user doesn't have
    missing = job_set - user_set
    
    # Calculate score as percentage
    score = (len(matched) / len(job_set)) * 100
    
    return round(score, 2), sorted(list(matched)), sorted(list(missing))


def rank_jobs_for_user(user: User, jobs: List[Job]) -> List[dict]:
    """
    Rank all jobs based on user's skills.
    
    DSA Concepts Used:
    - Sorting by match score (descending)
    - Hash map for quick lookup
    
    Args:
        user: User object with skills
        jobs: List of Job objects
    
    Returns:
        List of dicts with job and match info, sorted by match_score
    """
    user_skill_names = [skill.name for skill in user.skills]
    
    if not user_skill_names:
        # If user has no skills, return jobs with 0 score
        return [
            {
                "job": job,
                "match_score": 0.0,
                "matched_skills": [],
                "missing_skills": [s.name for s in job.skills]
            }
            for job in jobs
        ]
    
    results = []
    for job in jobs:
        job_skill_names = [skill.name for skill in job.skills]
        score, matched, missing = calculate_match_score(user_skill_names, job_skill_names)
        
        results.append({
            "job": job,
            "match_score": score,
            "matched_skills": matched,
            "missing_skills": missing
        })
    
    # Sort by match_score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    
    return results


def get_skill_demand(jobs: List[Job]) -> dict:
    """
    Analyze which skills are most in demand.
    
    DSA Concepts Used:
    - Hash map (dict) for counting
    - Sorting for ranking
    
    Returns:
        Dict with skill names and their demand percentage
    """
    skill_count = {}
    total_jobs = len(jobs)
    
    if total_jobs == 0:
        return {}
    
    for job in jobs:
        for skill in job.skills:
            skill_name = skill.name
            skill_count[skill_name] = skill_count.get(skill_name, 0) + 1
    
    # Calculate percentages
    demand = {
        skill: round((count / total_jobs) * 100, 2)
        for skill, count in skill_count.items()
    }
    
    # Sort by demand descending
    return dict(sorted(demand.items(), key=lambda x: x[1], reverse=True))