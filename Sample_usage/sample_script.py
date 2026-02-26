import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from deepwork_sdk import DeepWorkClient

client = DeepWorkClient()

session = client.create_session(
    title="SDK Deep Work",
    goal="Testing Python SDK",
    scheduled_duration=30,
)

print("Created:", session)

session_id = session["id"]

print("Starting session...")
client.start_session(session_id)

print("Pausing...")
client.pause_session(session_id, "Quick break")

print("Resuming...")
client.resume_session(session_id)

print("Completing...")
client.complete_session(session_id)

print("History:", client.get_history())
print("Weekly Report:", client.get_weekly_report())