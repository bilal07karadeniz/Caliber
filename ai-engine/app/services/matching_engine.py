import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, Job, UserSkill, JobSkill, Skill, Resume, AiRecommendation
from app.ml.embeddings import embedding_service
from app.ml.skill_matcher import skill_matcher


DEGREE_KEYWORDS = {
    "phd": 4, "ph.d": 4, "doctorate": 4,
    "master": 3, "m.sc": 3, "m.a": 3, "mba": 3, "m.s.": 3,
    "bachelor": 2, "b.sc": 2, "b.a": 2, "b.s.": 2, "undergraduate": 2,
    "associate": 1, "diploma": 1, "certificate": 1,
}


class MatchingEngine:
    async def _get_user_skills(self, db: AsyncSession, user_id: str) -> list[dict]:
        result = await db.execute(
            select(UserSkill, Skill)
            .join(Skill, UserSkill.skillId == Skill.id)
            .where(UserSkill.userId == user_id)
        )
        return [{"name": row[1].name, "level": row[0].proficiencyLevel or 3} for row in result.all()]

    async def _get_job_skills(self, db: AsyncSession, job_id: str) -> list[dict]:
        result = await db.execute(
            select(JobSkill, Skill)
            .join(Skill, JobSkill.skillId == Skill.id)
            .where(JobSkill.jobId == job_id)
        )
        return [{"name": row[1].name, "level": row[0].requiredLevel or 3} for row in result.all()]

    async def _get_user_resume_text(self, db: AsyncSession, user_id: str) -> str:
        result = await db.execute(
            select(Resume).where(Resume.userId == user_id, Resume.isActive == True).limit(1)
        )
        resume = result.scalar_one_or_none()
        return resume.extractedText or "" if resume else ""

    async def _get_user_resume_parsed(self, db: AsyncSession, user_id: str) -> dict:
        result = await db.execute(
            select(Resume).where(Resume.userId == user_id, Resume.isActive == True).limit(1)
        )
        resume = result.scalar_one_or_none()
        if resume and resume.parsedData and isinstance(resume.parsedData, dict):
            return resume.parsedData
        return {}

    def _compute_education_score(self, parsed_data: dict, job_requirements: str) -> float:
        """Fix 5: Real education scoring instead of hardcoded 0.5."""
        education = parsed_data.get("education", [])
        if not education:
            return 0.3  # No education data

        requirements_lower = (job_requirements or "").lower()

        # Check if job mentions specific degree requirements
        required_level = 0
        for keyword, level in DEGREE_KEYWORDS.items():
            if keyword in requirements_lower:
                required_level = max(required_level, level)

        if required_level == 0:
            # Job doesn't require specific education
            return 1.0

        # Check user's education level
        user_level = 0
        for edu in education:
            edu_text = " ".join([
                edu.get("institution", ""),
                edu.get("degree", ""),
                edu.get("field", ""),
            ]).lower()
            for keyword, level in DEGREE_KEYWORDS.items():
                if keyword in edu_text:
                    user_level = max(user_level, level)

        if user_level >= required_level:
            return 1.0
        elif user_level > 0:
            return 0.7
        else:
            return 0.3

    def _compute_salary_score(self, job) -> float:
        """Fix 6: Real salary scoring instead of hardcoded 0.7."""
        salary_min = job.salaryMin
        salary_max = job.salaryMax

        if salary_min is None and salary_max is None:
            return 0.7  # No salary info, neutral

        effective_salary = salary_max or salary_min or 0
        if effective_salary <= 0:
            return 0.7

        if effective_salary >= 50000:
            return 0.9  # Competitive salary
        else:
            return 0.8  # Has salary but lower range

    async def compute_match_score(self, db: AsyncSession, user_id: str, job_id: str) -> dict:
        user_skills = await self._get_user_skills(db, user_id)
        job_skills = await self._get_job_skills(db, job_id)

        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()

        job_result = await db.execute(select(Job).where(Job.id == job_id))
        job = job_result.scalar_one_or_none()

        if not user or not job:
            return {"score": 0, "breakdown": {}, "skill_gaps": [], "explanation": "User or job not found"}

        # 1. Skill Match (40%)
        skill_score = skill_matcher.compute_skill_overlap(user_skills, job_skills)

        # 2. Experience Relevance (25%)
        resume_text = await self._get_user_resume_text(db, user_id)
        exp_score = 0.5
        if resume_text and job.description:
            user_vec = embedding_service.encode_text(resume_text[:2000])
            job_vec = embedding_service.encode_text(job.description[:2000])
            if user_vec is not None and job_vec is not None:
                exp_score = max(0, embedding_service.cosine_similarity(user_vec, job_vec))

        # 3. Education Match (15%) - Fix 5
        parsed_data = await self._get_user_resume_parsed(db, user_id)
        edu_score = self._compute_education_score(parsed_data, job.requirements)

        # 4. Location Match (10%)
        loc_score = 0.5
        if user and job:
            if job.employmentType == "REMOTE":
                loc_score = 1.0
            elif user.location and job.location:
                if user.location.lower() == job.location.lower():
                    loc_score = 1.0
                elif any(part in job.location.lower() for part in user.location.lower().split()):
                    loc_score = 0.7

        # 5. Salary Fit (10%) - Fix 6
        salary_score = self._compute_salary_score(job)

        # Weighted sum
        final_score = (
            skill_score * 0.40 +
            exp_score * 0.25 +
            edu_score * 0.15 +
            loc_score * 0.10 +
            salary_score * 0.10
        ) * 100

        skill_gaps = skill_matcher.identify_skill_gaps(user_skills, job_skills)

        breakdown = {
            "skill_match": round(skill_score * 100, 1),
            "experience_relevance": round(exp_score * 100, 1),
            "education_match": round(edu_score * 100, 1),
            "location_match": round(loc_score * 100, 1),
            "salary_fit": round(salary_score * 100, 1),
        }

        explanation = self._generate_explanation(breakdown, skill_gaps, final_score)

        return {
            "user_id": user_id,
            "job_id": job_id,
            "score": round(final_score, 1),
            "breakdown": breakdown,
            "skill_gaps": skill_gaps,
            "explanation": explanation,
        }

    def _generate_explanation(self, breakdown: dict, skill_gaps: list, score: float) -> str:
        level = "Strong" if score >= 80 else "Good" if score >= 60 else "Moderate" if score >= 40 else "Low"
        parts = [f"{level} match ({score:.0f}/100)."]

        if breakdown.get("skill_match", 0) > 70:
            parts.append("Your skills closely align with this role.")
        elif breakdown.get("skill_match", 0) > 40:
            parts.append("You have some relevant skills for this position.")

        if skill_gaps:
            top_gaps = [g["skill_name"] for g in skill_gaps[:3]]
            parts.append(f"Consider developing: {', '.join(top_gaps)}.")

        return " ".join(parts)

    async def match_user_to_jobs(self, db: AsyncSession, user_id: str, limit: int = 20) -> list[dict]:
        result = await db.execute(select(Job).where(Job.isActive == True))
        jobs = result.scalars().all()

        # Fix 8: Delete existing recommendations before inserting new ones
        await db.execute(
            AiRecommendation.__table__.delete().where(AiRecommendation.userId == user_id)
        )

        matches = []
        for job in jobs:
            match = await self.compute_match_score(db, user_id, job.id)
            matches.append(match)

            # Save to DB
            await db.execute(
                AiRecommendation.__table__.insert().values(
                    id=str(uuid.uuid4()),
                    userId=user_id,
                    jobId=job.id,
                    matchScore=match["score"],
                    skillGap=match.get("skill_gaps"),
                    explanation=match.get("explanation"),
                )
            )

        await db.commit()
        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]

    async def match_job_to_candidates(self, db: AsyncSession, job_id: str, limit: int = 20) -> list[dict]:
        result = await db.execute(select(User).where(User.role == "JOB_SEEKER", User.isActive == True))
        users = result.scalars().all()

        matches = []
        for user in users:
            match = await self.compute_match_score(db, user.id, job_id)
            matches.append(match)

        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:limit]


matching_engine = MatchingEngine()
