from app.ml.skill_matcher import skill_matcher
from app.ml.embeddings import embedding_service


def test_skill_overlap_exact_match(sample_user_skills, sample_job_skills):
    score = skill_matcher.compute_skill_overlap(sample_user_skills, sample_job_skills)
    assert 0 <= score <= 1
    assert score > 0.3  # Should have some overlap


def test_skill_overlap_no_match():
    user = [{"name": "Cooking", "level": 5}]
    job = [{"name": "Python", "level": 3}]
    score = skill_matcher.compute_skill_overlap(user, job)
    assert score < 0.5


def test_skill_overlap_empty_job():
    score = skill_matcher.compute_skill_overlap([{"name": "Python", "level": 3}], [])
    assert score == 1.0


def test_skill_overlap_empty_user():
    score = skill_matcher.compute_skill_overlap([], [{"name": "Python", "level": 3}])
    assert score == 0.0


def test_identify_skill_gaps(sample_user_skills, sample_job_skills):
    gaps = skill_matcher.identify_skill_gaps(sample_user_skills, sample_job_skills)
    assert len(gaps) > 0
    gap_names = [g["skill_name"] for g in gaps]
    assert "Kubernetes" in gap_names  # User doesn't have Kubernetes


def test_embedding_similarity():
    vec1 = embedding_service.encode_text("Python programming")
    vec2 = embedding_service.encode_text("Python developer")
    if vec1 is not None and vec2 is not None:
        sim = embedding_service.cosine_similarity(vec1, vec2)
        assert sim > 0.5
