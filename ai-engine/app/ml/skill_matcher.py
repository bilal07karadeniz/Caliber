from app.ml.embeddings import embedding_service


class SkillMatcher:
    def __init__(self):
        # Fix 18: Cache skill name embeddings to avoid recomputing
        self._embedding_cache: dict = {}

    def _get_cached_embedding(self, text: str):
        """Get embedding from cache or compute and cache it."""
        if text not in self._embedding_cache:
            self._embedding_cache[text] = embedding_service.encode_text(text)
        return self._embedding_cache[text]

    def compute_skill_overlap(self, user_skills: list[dict], job_skills: list[dict]) -> float:
        if not job_skills:
            return 1.0
        if not user_skills:
            return 0.0

        total_weight = 0.0
        matched_weight = 0.0

        user_skill_map = {s.get("name", "").lower(): s.get("level", 3) for s in user_skills}

        for js in job_skills:
            req_name = js.get("name", "").lower()
            req_level = js.get("level", 3)
            total_weight += req_level

            if req_name in user_skill_map:
                user_level = user_skill_map[req_name]
                ratio = min(user_level / max(req_level, 1), 1.0)
                matched_weight += req_level * ratio
            else:
                # Try semantic match using cached embeddings
                best_sim = 0.0
                job_vec = self._get_cached_embedding(req_name)
                for uname in user_skill_map:
                    uv = self._get_cached_embedding(uname)
                    if uv is not None and job_vec is not None:
                        sim = embedding_service.cosine_similarity(uv, job_vec)
                        if sim > best_sim:
                            best_sim = sim
                if best_sim > 0.8:
                    matched_weight += req_level * best_sim * 0.8

        return matched_weight / total_weight if total_weight > 0 else 0.0

    def identify_skill_gaps(self, user_skills: list[dict], job_skills: list[dict]) -> list[dict]:
        gaps = []
        user_map = {s.get("name", "").lower(): s.get("level", 0) for s in user_skills}

        for js in job_skills:
            name = js.get("name", "")
            req = js.get("level", 3)
            user_level = user_map.get(name.lower(), 0)
            if user_level < req:
                gaps.append({
                    "skill_name": name,
                    "required_level": req,
                    "user_level": user_level,
                    "gap": req - user_level,
                })

        return sorted(gaps, key=lambda x: x["gap"], reverse=True)


skill_matcher = SkillMatcher()
