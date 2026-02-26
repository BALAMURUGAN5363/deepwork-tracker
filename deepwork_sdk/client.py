import requests


class DeepWorkClient:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url

    def create_session(self, title, goal, scheduled_duration):
        response = requests.post(
            f"{self.base_url}/sessions/",
            json={
                "title": title,
                "goal": goal,
                "scheduled_duration": scheduled_duration,
            },
        )
        return response.json()

    def start_session(self, session_id):
        return requests.patch(
            f"{self.base_url}/sessions/{session_id}/start"
        ).json()

    def pause_session(self, session_id, reason):
        return requests.patch(
            f"{self.base_url}/sessions/{session_id}/pause",
            json={"reason": reason},
        ).json()

    def resume_session(self, session_id):
        return requests.patch(
            f"{self.base_url}/sessions/{session_id}/resume"
        ).json()

    def complete_session(self, session_id):
        return requests.patch(
            f"{self.base_url}/sessions/{session_id}/complete"
        ).json()

    def get_history(self):
        return requests.get(
            f"{self.base_url}/sessions/history"
        ).json()

    def get_weekly_report(self):
        return requests.get(
            f"{self.base_url}/sessions/weekly-report"
        ).json()

    def export_csv(self):
        return requests.get(
            f"{self.base_url}/sessions/export"
        )