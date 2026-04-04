import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, Job, UserSkill, JobSkill, Skill, Resume, AiRecommendation
from app.ml.embeddings import embedding_service
from app.ml.skill_matcher import skill_matcher


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

        # 3. Education Match (15%)
        edu_score = 0.5

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

        # 5. Salary Fit (10%)
        salary_score = 0.7

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
