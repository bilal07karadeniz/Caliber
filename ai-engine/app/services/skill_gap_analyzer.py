import json
import os
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import UserSkill, JobSkill, Skill, AiRecommendation


LEARNING_RESOURCES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "learning_resources.json")


def _load_resources() -> dict:
    try:
        with open(LEARNING_RESOURCES_PATH, "r") as f:
            return json.load(f)
    except Exception:
        return {}


class SkillGapAnalyzer:
    def __init__(self):
        self.resources = _load_resources()

    async def analyze_gap(self, db: AsyncSession, user_id: str, job_id: str) -> dict:
        # Get user skills
        user_result = await db.execute(
            select(UserSkill, Skill)
            .join(Skill, UserSkill.skillId == Skill.id)
            .where(UserSkill.userId == user_id)
        )
        user_skills = {row[1].name.lower(): row[0].proficiencyLevel or 0 for row in user_result.all()}

        # Get job skills
        job_result = await db.execute(
            select(JobSkill, Skill)
            .join(Skill, JobSkill.skillId == Skill.id)
            .where(JobSkill.jobId == job_id)
        )
        job_skills = [(row[1].name, row[0].requiredLevel or 3) for row in job_result.all()]

        gaps = []
        for skill_name, req_level in job_skills:
            user_level = user_skills.get(skill_name.lower(), 0)
            if user_level < req_level:
                gap = req_level - user_level
                severity = "critical" if gap >= 3 else "moderate" if gap >= 2 else "minor"
                gaps.append({
                    "skill_name": skill_name,
                    "required_level": req_level,
                    "user_level": user_level,
                    "gap": gap,
                    "severity": severity,
                })

        gaps.sort(key=lambda x: x["gap"], reverse=True)
        recommendations = self._get_recommendations(gaps)

        total_possible = sum(req for _, req in job_skills) or 1
        total_user = sum(user_skills.get(name.lower(), 0) for name, _ in job_skills)
        readiness = min(total_user / total_possible, 1.0) * 100

        return {
            "user_id": user_id,
            "job_id": job_id,
            "gaps": gaps,
            "recommendations": recommendations,
            "overall_readiness": round(readiness, 1),
        }

    def _get_recommendations(self, gaps: list) -> list:
        recommendations = []
        for gap in gaps:
            skill = gap["skill_name"]
            skill_resources = self.resources.get(skill, self.resources.get(skill.lower(), []))

            if isinstance(skill_resources, list):
                for r in skill_resources[:2]:
                    recommendations.append({
                        "skill_name": skill,
                        "resource_title": r.get("title", f"Learn {skill}"),
                        "resource_type": r.get("type", "course"),
                        "provider": r.get("provider", "Online"),
                        "estimated_duration": r.get("duration", "10 hours"),
                        "url": r.get("url", "#"),
                        "priority": gap["severity"],
                    })
            else:
                recommendations.append({
                    "skill_name": skill,
                    "resource_title": f"Learn {skill}",
                    "resource_type": "course",
                    "provider": "Various",
                    "estimated_duration": "10-20 hours",
                    "url": "#",
                    "priority": gap["severity"],
                })

        return recommendations

    async def get_career_insights(self, db: AsyncSession, user_id: str) -> dict:
        result = await db.execute(
            select(UserSkill, Skill)
            .join(Skill, UserSkill.skillId == Skill.id)
            .where(UserSkill.userId == user_id)
        )
        skills = [(row[1].name, row[1].category or "General", row[0].proficiencyLevel or 3) for row in result.all()]

        # Group by category
        categories: dict[str, list] = {}
        for name, cat, level in skills:
            categories.setdefault(cat, []).append((name, level))

        strongest = sorted(categories.items(), key=lambda x: sum(l for _, l in x[1]) / len(x[1]), reverse=True)

        strongest_areas = [cat for cat, _ in strongest[:3]]

        path_map = {
            "Programming": "Full Stack Developer",
            "Frontend": "Frontend Engineer",
            "Backend": "Backend Engineer",
            "Database": "Database Administrator",
            "DevOps": "DevOps Engineer",
            "Data Science": "Data Scientist",
            "Soft Skills": "Project Manager",
        }

        recommended_paths = [path_map.get(area, f"{area} Specialist") for area in strongest_areas]

        # Suggest next skills
        all_user_skills = {s.lower() for s, _, _ in skills}
        suggested = ["Docker", "Kubernetes", "AWS", "TypeScript", "Python", "React", "Machine Learning"]
        next_skills = [s for s in suggested if s.lower() not in all_user_skills][:5]

        return {
            "user_id": user_id,
            "strongest_areas": strongest_areas,
            "recommended_paths": recommended_paths,
            "next_skills": next_skills,
            "summary": f"Based on your skills, you're strongest in {', '.join(strongest_areas)}. Consider exploring {', '.join(recommended_paths)} career paths.",
        }

    async def get_learning_path(self, db: AsyncSession, user_id: str) -> dict:
        # Get all recommendation gaps for this user
        result = await db.execute(
            select(AiRecommendation).where(AiRecommendation.userId == user_id)
        )
        recs = result.scalars().all()

        all_gaps: dict[str, int] = {}
        for rec in recs:
            if rec.skillGap:
                gaps = rec.skillGap if isinstance(rec.skillGap, list) else []
                for gap in gaps:
                    name = gap.get("skill_name", "")
                    g = gap.get("gap", 0)
                    if name:
                        all_gaps[name] = max(all_gaps.get(name, 0), g)

        sorted_gaps = sorted(all_gaps.items(), key=lambda x: x[1], reverse=True)
        gap_list = [{"skill_name": n, "required_level": g + 2, "user_level": 2, "gap": g, "severity": "critical" if g >= 3 else "moderate" if g >= 2 else "minor"} for n, g in sorted_gaps]

        courses = self._get_recommendations(gap_list)

        return {
            "user_id": user_id,
            "courses": courses,
            "estimated_total_hours": f"{len(courses) * 15} hours",
        }


skill_gap_analyzer = SkillGapAnalyzer()
