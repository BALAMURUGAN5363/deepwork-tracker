import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import ActiveSession from "./components/ActiveSession";

const API = "http://127.0.0.1:8000";

function App() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");

  const titleRef = useRef(null);
  const goalRef = useRef(null);
  const durationRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [weekly, setWeekly] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  const [timers, setTimers] = useState({});
  const [highlightedId, setHighlightedId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

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
            // The backend returns start_time in IST now (due to to_ist conversion in history endpoint)
            // We need to parse it correctly. ISO strings like "2026-02-28T05:12:10"
            const start = new Date(session.start_time);
            const now = new Date();

            const diff = Math.floor((now.getTime() - start.getTime()) / 1000);

            if (diff >= 0) {
              const minutes = Math.floor(diff / 60);
              const seconds = diff % 60;

              updated[session.id] = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
            } else {
              // If start time is in future relative to client (sync issue), show 0m 00s
              updated[session.id] = "0m 00s";
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
    if (!title || !goal || !duration) return;

    const res = await axios.post(`${API}/sessions/`, {
      title,
      goal,
      scheduled_duration: parseInt(duration),
    });

    setTitle("");
    setGoal("");
    setDuration("");

    await fetchHistory();
    fetchWeekly();

    const newSessionId = res.data.id;
    setHighlightedId(newSessionId);
    
    // Clear highlight after 4 seconds
    setTimeout(() => setHighlightedId(null), 4000);
  };

  // Auto-scroll to newly created session
  useEffect(() => {
    if (highlightedId) {
      const element = document.getElementById(`session-${highlightedId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedId, history]);

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

  const handleEnterKey = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else if (!nextRef) {
        // If it's the last input, trigger createSession
        createSession();
      }
    }
  };

  /* ================= UI ================= */

  return (
    <div className="container">
      <h1>Deep Work Tracker</h1>

      {/* CREATE SESSION */}
      <div className="section">
        <h2>Create Session</h2>

        <input
          autoFocus
          ref={titleRef}
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => handleEnterKey(e, goalRef)}
        />

        <input
          ref={goalRef}
          placeholder="Goal *"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => handleEnterKey(e, durationRef)}
        />

        <input
          ref={durationRef}
          type="number"
          placeholder="Duration (minutes) *"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          onKeyDown={(e) => handleEnterKey(e, null)}
        />

        <button 
          onClick={createSession} 
          disabled={!title || !goal || !duration}
        >
          Create Session
        </button>
      </div>

      {/* SESSION LIST */}
      <div className="section">
        <h2>Current Sessions</h2>

        {history.filter(item => ["scheduled", "active", "paused"].includes(item.status)).map((item) => (
          <ActiveSession
            key={item.id}
            item={item}
            highlightedId={highlightedId}
            timerValue={timers[item.id]}
            onStart={startSession}
            onPause={openPauseModal}
            onResume={resumeSession}
            onComplete={completeSession}
          />
        ))}

        {history.filter(item => ["scheduled", "active", "paused"].includes(item.status)).length === 0 && (
          <p className="empty-msg">No active sessions.</p>
        )}
      </div>

      {/* HISTORY TOGGLE */}
      <div className="section center no-bg">
        <button 
          className="history-toggle-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {/* SESSION HISTORY */}
      {showHistory && (
        <div className="section history-section">
          <h2>Session History</h2>
          <div className="history-scroll-container">
            {history.filter(item => ["completed", "overdue", "interrupted"].includes(item.status)).map((item) => (
              <div className="history-item" key={item.id}>
                <div className="top-row">
                  <strong>{item.title}</strong>
                  <span className={`badge ${item.status}`}>
                    {item.status}
                  </span>
                </div>
                <div className="focus">
                  Focus: <b>{item.focus_score}%</b>
                </div>
              </div>
            ))}
            {history.filter(item => ["completed", "overdue", "interrupted"].includes(item.status)).length === 0 && (
              <p className="empty-msg">No history records yet.</p>
            )}
          </div>
        </div>
      )}

      {/* WEEKLY REPORT */}
      <div className="section">
        <h2>Weekly Report</h2>

        {weekly.map((w, i) => (
          <div className="week-item" key={i}>
            <div className="week-header">
              Week: <b>{w.week}</b>
            </div>
            <div className="week-stats">
              <div className="stat">
                <span className="stat-label">Total</span>
                <span className="stat-value">{w.total_sessions}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Completed</span>
                <span className="stat-value completed">{w.completed_sessions}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Overdue</span>
                <span className="stat-value overdue">{w.overdue_sessions}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Interrupted</span>
                <span className="stat-value interrupted">{w.interrupted_sessions}</span>
              </div>
            </div>
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
              autoFocus
              placeholder="Enter pause reason..."
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pauseReason) {
                  confirmPause();
                }
              }}
            />

            <div className="modal-buttons">
              <button 
                onClick={confirmPause} 
                disabled={!pauseReason}
              >
                Confirm
              </button>
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
