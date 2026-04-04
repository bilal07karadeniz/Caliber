def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_parse_resume_endpoint_missing_file(client):
    response = client.post("/api/parse-resume", json={"file_path": "/nonexistent/file.pdf"})
    assert response.status_code == 200
    data = response.json()
    assert "extracted_text" in data
    assert "parsed_data" in data


def test_docs_endpoint(client):
    response = client.get("/docs")
    assert response.status_code == 200
