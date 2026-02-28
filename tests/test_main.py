from app.main import app
from fastapi.testclient import TestClient

def test_app_initialization():
    client = TestClient(app)
    # Testing a known endpoint to ensure the app is up
    response = client.get("/sessions/history")
    assert response.status_code == 200

def test_cors_middleware():
    client = TestClient(app)
    # Test preflight request for CORS
    response = client.options(
        "/sessions/history",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    # When allow_credentials=True, FastAPI returns the requested Origin instead of '*'
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
