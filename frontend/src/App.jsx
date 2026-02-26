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

  /* ================= FETCH FUNCTIONS ================= */

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/sessions/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  };

  const fetchWeekly = async () => {
    try {
      const res = await axios.get(`${API}/sessions/weekly-report`);
      setWeekly(res.data);
    } catch (err) {
      console.error("Weekly report fetch failed", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchWeekly();
  }, []);

  /* ================= CREATE ================= */

  const createSession = async () => {
    if (!title || !duration) return;

    try {
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
    } catch (err) {
      console.error("Create failed", err);
    }
  };

  /* ================= ACTIONS ================= */

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

  /* ================= PAUSE MODAL ================= */

  const openPauseModal = (id) => {
    setSelectedSession(id);
    setPauseReason("");
    setShowModal(true);
  };

  const confirmPause = async () => {
    if (!pauseReason) return;

    await axios.patch(`${API}/sessions/${selectedSession}/pause`, {
      reason: pauseReason,
    });

    setShowModal(false);
    setPauseReason("");
    setSelectedSession(null);
    fetchHistory();
  };

  const closeModal = () => {
    setShowModal(false);
    setPauseReason("");
    setSelectedSession(null);
  };

  const downloadCSV = () => {
    window.open(`${API}/sessions/export`);
  };

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Deep Work Tracker</h1>

      {/* ================= CREATE SECTION ================= */}
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

      {/* ================= SESSIONS ================= */}
      <div className="section">
        <h2>Sessions</h2>

        {history.map((item) => (
          <div className="history-item" key={item.id}>
            {/* HEADER FIXED ALIGNMENT */}
            <div className="item-header">
              <strong>{item.title}</strong>
              <span className={`badge ${item.status}`}>
                {item.status}
              </span>
            </div>

            <div className="focus-text">
              Focus: <b>{item.focus_score}%</b>
            </div>

            <div className="action-buttons">
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

      {/* ================= WEEKLY REPORT ================= */}
      <div className="section">
        <h2>Weekly Report</h2>

        {weekly.map((w, i) => (
          <div className="week-item" key={i}>
            Week: <b>{w.week}</b> | Total: {w.total_sessions} |
            Completed: {w.completed_sessions}
          </div>
        ))}
      </div>

      {/* ================= EXPORT ================= */}
      <div className="section">
        <button onClick={downloadCSV}>Download CSV</button>
      </div>

      {/* ================= MODAL ================= */}
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
              <button className="cancel-btn" onClick={closeModal}>
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