import re
from typing import List, Dict


VERIFIED_COMPANIES = {
    "google", "microsoft", "amazon", "apple", "meta", "netflix",
    "systems limited", "netsol", "10pearls", "arbisoft", "confiz",
}


SUSPICIOUS_KEYWORDS = {
    "high_risk": [
        "pay to apply", "registration fee", "security deposit",
        "send money", "wire transfer", "western union",
        "bank account", "credit card", "ssn", "cnic number",
    ],
    "medium_risk": [
        "work from home", "earn from home", "easy money",
        "quick money", "instant cash", "no experience needed",
        "unlimited earning", "make $$$", "get rich",
    ],
    "low_risk": [
        "whatsapp only", "telegram only", "dm me", "inbox me",
    ],
}


def check_suspicious_keywords(text: str) -> tuple:
    if not text:
        return 0, []
    text_lower = text.lower()
    score = 0
    flags = []
    
    for keyword in SUSPICIOUS_KEYWORDS["high_risk"]:
        if keyword in text_lower:
            score += 30
            flags.append(f"High risk: '{keyword}'")
    
    for keyword in SUSPICIOUS_KEYWORDS["medium_risk"]:
        if keyword in text_lower:
            score += 15
            flags.append(f"Medium risk: '{keyword}'")
    
    for keyword in SUSPICIOUS_KEYWORDS["low_risk"]:
        if keyword in text_lower:
            score += 5
            flags.append(f"Low risk: '{keyword}'")
    
    return min(score, 100), flags


def check_description_quality(description: str) -> tuple:
    if not description:
        return 30, ["No description provided"]
    
    length = len(description)
    score = 0
    flags = []
    
    if length < 50:
        score += 40
        flags.append(f"Very short description")
    elif length < 150:
        score += 20
        flags.append(f"Short description")
    
    return score, flags


def check_salary_validity(salary_range: str) -> tuple:
    if not salary_range:
        return 0, []
    
    score = 0
    flags = []
    salary_lower = salary_range.lower()
    
    if "unlimited" in salary_lower:
        score += 40
        flags.append("Unrealistic salary")
    
    return score, flags


def check_company_verification(company: str) -> tuple:
    if not company:
        return 20, ["No company name"]
    
    company_lower = company.lower().strip()
    
    if company_lower in VERIFIED_COMPANIES:
        return -10, ["Verified company"]
    
    for verified in VERIFIED_COMPANIES:
        if verified in company_lower:
            return -5, [f"Matches verified: {verified}"]
    
    return 0, []


def check_url_validity(url: str) -> tuple:
    if not url:
        return 0, []
    
    score = 0
    flags = []
    url_lower = url.lower()
    
    suspicious_domains = ["bit.ly", "tinyurl", "t.me", "wa.me"]
    
    for domain in suspicious_domains:
        if domain in url_lower:
            score += 20
            flags.append(f"Suspicious URL: {domain}")
            break
    
    return score, flags


def calculate_fake_score(job_data: dict) -> Dict:
    total_score = 0
    all_flags = []
    
    title_score, title_flags = check_suspicious_keywords(job_data.get("title", ""))
    total_score += title_score
    all_flags.extend(title_flags)
    
    desc_suspicious_score, desc_flags = check_suspicious_keywords(job_data.get("description", ""))
    total_score += desc_suspicious_score
    all_flags.extend(desc_flags)
    
    desc_quality_score, quality_flags = check_description_quality(job_data.get("description", ""))
    total_score += desc_quality_score
    all_flags.extend(quality_flags)
    
    salary_score, salary_flags = check_salary_validity(job_data.get("salary_range", ""))
    total_score += salary_score
    all_flags.extend(salary_flags)
    
    company_score, company_flags = check_company_verification(job_data.get("company", ""))
    total_score += company_score
    all_flags.extend(company_flags)
    
    url_score, url_flags = check_url_validity(job_data.get("url", ""))
    total_score += url_score
    all_flags.extend(url_flags)
    
    final_score = max(0, min(100, total_score))
    
    return {
        "fake_score": final_score,
        "is_suspicious": final_score >= 50,
        "is_verified": company_score < 0,
        "flags": all_flags
    }


def analyze_job(job_data: dict) -> dict:
    analysis = calculate_fake_score(job_data)
    
    return {
        **job_data,
        "fake_score": analysis["fake_score"],
        "is_suspicious": analysis["is_suspicious"],
        "is_verified": analysis["is_verified"],
    }