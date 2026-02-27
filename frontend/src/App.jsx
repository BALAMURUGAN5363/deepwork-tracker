import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = "http://127.0.0.1:8000";

function App() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");

  const [history, setHistory] = useState([]);
  const [weekly, setWeekly] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const [timers, setTimers] = useState({});

  /* ================= FETCH ================= */

  const fetchHistory = async () => {
    const res = await axios.get(`${API}/sessions/history`);
    setHistory(res.data);
  };

  const fetchWeekly = async () => {
    const res = await axios.get(`${API}/sessions/weekly-report`);
    setWeekly(res.data);
  };

  useEffect(() => {
    fetchHistory();
    fetchWeekly();
  }, []);

  /* ================= REAL TIMER (FIXED UTC ISSUE) ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = { ...prev };

        history.forEach((session) => {
          if (session.status === "active" && session.start_time) {

            // ✅ Force UTC interpretation
            const start = new Date(session.start_time + "Z");
            const now = new Date();

            const diff = Math.floor(
              (now.getTime() - start.getTime()) / 1000
            );

            if (diff >= 0) {
              const minutes = Math.floor(diff / 60);
              const seconds = diff % 60;

              updated[session.id] =
                `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
            }
          }
        });

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [history]);

  /* ================= ACTIONS ================= */

  const createSession = async () => {
    if (!title || !duration) return;

    await axios.post(`${API}/sessions/`, {
      title,
      goal,
      scheduled_duration: parseInt(duration),
    });

    setTitle("");
    setGoal("");
    setDuration("");

    fetchHistory();
    fetchWeekly();
  };

  const startSession = async (id) => {
    await axios.patch(`${API}/sessions/${id}/start`);
    fetchHistory();
  };

  const resumeSession = async (id) => {
    await axios.patch(`${API}/sessions/${id}/resume`);
    fetchHistory();
  };

  const completeSession = async (id) => {
    await axios.patch(`${API}/sessions/${id}/complete`);
    fetchHistory();
    fetchWeekly();
  };

  const openPauseModal = (id) => {
    setSelectedSession(id);
    setShowModal(true);
  };

  const confirmPause = async () => {
    if (!pauseReason) return;

    await axios.patch(`${API}/sessions/${selectedSession}/pause`, {
      reason: pauseReason,
    });

    setPauseReason("");
    setShowModal(false);
    fetchHistory();
  };

  const downloadCSV = () => {
    window.open(`${API}/sessions/export`);
  };

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Deep Work Tracker</h1>

      {/* CREATE SESSION */}
      <div className="section">
        <h2>Create Session</h2>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />

        <input
          type="number"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <button onClick={createSession}>Create Session</button>
      </div>

      {/* SESSION LIST */}
      <div className="section">
        <h2>Sessions</h2>

        {history.map((item) => (
          <div className="history-item" key={item.id}>
            <div className="top-row">
              <strong>{item.title}</strong>

              {/* Badge aligned to right */}
              <span className={`badge ${item.status}`}>
                {item.status}
              </span>
            </div>

            {item.status === "active" && (
              <div className="timer">
                ⏱ {timers[item.id] || "0m 00s"}
              </div>
            )}

            <div className="focus">
              Focus: <b>{item.focus_score}%</b>
            </div>

            <div className="actions">
              {item.status === "scheduled" && (
                <button onClick={() => startSession(item.id)}>
                  Start
                </button>
              )}

              {item.status === "active" && (
                <>
                  <button
                    className="pause-btn"
                    onClick={() => openPauseModal(item.id)}
                  >
                    Pause
                  </button>
                  <button
                    className="complete-btn"
                    onClick={() => completeSession(item.id)}
                  >
                    Complete
                  </button>
                </>
              )}

              {item.status === "paused" && (
                <>
                  <button
                    className="resume-btn"
                    onClick={() => resumeSession(item.id)}
                  >
                    Resume
                  </button>
                  <button
                    className="complete-btn"
                    onClick={() => completeSession(item.id)}
                  >
                    Complete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* WEEKLY REPORT */}
      <div className="section">
        <h2>Weekly Report</h2>

        {weekly.map((w, i) => (
          <div className="week-item" key={i}>
            Week: <b>{w.week}</b> | Total: {w.total_sessions} |
            Completed: {w.completed_sessions}
          </div>
        ))}
      </div>

      <div className="section center">
        <button onClick={downloadCSV}>Download CSV</button>
      </div>

      {/* PAUSE MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Pause Session</h3>

            <input
              placeholder="Enter pause reason..."
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
            />

            <div className="modal-buttons">
              <button onClick={confirmPause}>Confirm</button>
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
