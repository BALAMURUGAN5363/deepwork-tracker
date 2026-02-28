import React from 'react';
import PropTypes from 'prop-types';

const ActiveSession = ({ 
  item, 
  highlightedId, 
  timerValue, 
  onStart, 
  onPause, 
  onResume, 
  onComplete 
}) => {
  return (
    <div 
      className={`history-item ${highlightedId === item.id ? "new-highlight" : ""}`} 
      key={item.id}
      id={`session-${item.id}`}
    >
      <div className="top-row">
        <strong>{item.title}</strong>

        {/* Badge aligned to right */}
        <span className={`badge ${item.status}`}>
          {item.status}
        </span>
      </div>

      {item.status === "active" && (
        <div className="timer">
          ⏱ {timerValue || "0m 00s"}
        </div>
      )}

      <div className="focus">
        Focus: <b>{item.focus_score}%</b>
      </div>

      <div className="actions">
        {item.status === "scheduled" && (
          <button onClick={() => onStart(item.id)}>
            Start
          </button>
        )}

        {item.status === "active" && (
          <>
            <button
              className="pause-btn"
              onClick={() => onPause(item.id)}
            >
              Pause
            </button>
            <button
              className="complete-btn"
              onClick={() => onComplete(item.id)}
            >
              Complete
            </button>
          </>
        )}

        {item.status === "paused" && (
          <>
            <button
              className="resume-btn"
              onClick={() => onResume(item.id)}
            >
              Resume
            </button>
            <button
              className="complete-btn"
              onClick={() => onComplete(item.id)}
            >
              Complete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

ActiveSession.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    focus_score: PropTypes.number.isRequired,
  }).isRequired,
  highlightedId: PropTypes.number,
  timerValue: PropTypes.string,
  onStart: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default ActiveSession;
