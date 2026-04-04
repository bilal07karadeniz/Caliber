from app.services.skill_gap_analyzer import SkillGapAnalyzer


def test_get_recommendations():
    analyzer = SkillGapAnalyzer()
    gaps = [
        {"skill_name": "Docker", "required_level": 3, "user_level": 0, "gap": 3, "severity": "critical"},
        {"skill_name": "Python", "required_level": 5, "user_level": 4, "gap": 1, "severity": "minor"},
    ]
    recs = analyzer._get_recommendations(gaps)
    assert len(recs) > 0
    assert any(r["skill_name"] == "Docker" for r in recs)


def test_severity_classification():
    gaps_input = [
        {"skill_name": "A", "required_level": 5, "user_level": 2, "gap": 3, "severity": "critical"},
        {"skill_name": "B", "required_level": 4, "user_level": 2, "gap": 2, "severity": "moderate"},
        {"skill_name": "C", "required_level": 3, "user_level": 2, "gap": 1, "severity": "minor"},
    ]
    assert gaps_input[0]["severity"] == "critical"
    assert gaps_input[1]["severity"] == "moderate"
    assert gaps_input[2]["severity"] == "minor"
