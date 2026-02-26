# 🚀 Deep Work Session Tracker

A full-stack productivity tracking system built with **FastAPI, SQLite, Alembic, React (Vite), and a Python SDK**.

This application allows users to create, manage, and analyze deep work sessions with proper state transitions, interruption tracking, weekly analytics, CSV export, and a modern UI.

---

# 🏗 System Architecture

```
+-------------------+        HTTP        +----------------------+
|   React Frontend  |  <------------->  |   FastAPI Backend    |
|  (Vite + Axios)   |                   |  (Business Logic)    |
+-------------------+                   +----------+-----------+
                                                   |
                                                   ▼
                                           +------------------+
                                           |   SQLite DB      |
                                           |  (SQLAlchemy)    |
                                           +------------------+
                                                   |
                                                   ▼
                                           +------------------+
                                           |   Alembic        |
                                           |  Migrations      |
                                           +------------------+
                                                   |
                                                   ▼
                                           +------------------+
                                           | Python SDK       |
                                           | (Requests Client)|
                                           +------------------+
```

---

# 🎯 Core Features

## ✅ Session Lifecycle Management
- Create session
- Start session
- Pause session (with reason)
- Resume session
- Complete session
- Overdue detection
- Interrupted detection (>3 pauses)
- Abandoned detection

## ✅ Analytics & Insights
- Focus score calculation
- Completion ratio
- Weekly productivity report
- CSV export of sessions

## ✅ Frontend UX
- Modern dark glass UI
- Real-time session timer
- Status badges
- Modal-based pause reason input
- Dynamic action buttons

## ✅ Backend Architecture
- Clean service layer
- Proper validation logic
- SQLite with Alembic migrations
- REST API design
- Separation of concerns

## ✅ Python SDK
- DeepWorkClient class
- Fully working sample script
- Programmatic session control

## ✅ Unit Testing
- Session state transition tests
- Interruption logic tests
- Overdue detection tests
- Resume validation tests
- In-memory test database setup

---

# 🧠 Session State Transitions

```
scheduled → active → paused → active → completed
                    ↓
                 interrupted (>3 pauses)

active → overdue (if duration exceeded 110%)
paused (no completion) → abandoned
```

---

# 📊 Focus Score Formula

```
focus_score = (1 - (pause_count / scheduled_duration)) * 100
```

This encourages fewer interruptions during work sessions.

---

# 📁 Project Structure

```
deepwork-tracker/
│
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers/
│   │     └── sessions.py
│   └── services/
│         └── session_services.py
│
├── alembic/
│
├── tests/
│   ├── conftest.py
│   ├── test_session_lifecycle.py
│   └── test_interruption_logic.py
│
├── deepwork_sdk/
│   └── client.py
│
├── sample_usage/
│   └── sample_script.py
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
├── setup.sh
├── setup.bat
└── README.md
```

---

# ⚙️ Backend Setup

## 1️⃣ Create Virtual Environment

```bash
python -m venv env
```

Activate:

**Windows**
```bash
env\Scripts\activate
```

**Mac/Linux**
```bash
source env/bin/activate
```

---

## 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3️⃣ Run Alembic Migrations

```bash
alembic upgrade head
```

---

## 4️⃣ Start Backend Server

```bash
uvicorn app.main:app --reload
```

Swagger Docs:
```
http://127.0.0.1:8000/docs
```

---

# 🌐 Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
npm install
npm run dev
```

Open:
```
http://localhost:5173
```

---

# 🐍 Python SDK Usage

Run sample script:

```bash
python -m sample_usage.sample_script
```

This will:
- Create session
- Start session
- Pause session
- Resume session
- Complete session
- Fetch history
- Fetch weekly report

---

# 🧪 Run Unit Tests

```bash
python -m pytest
```

All session lifecycle and interruption logic tests will execute using in-memory SQLite database.

---

# 📤 CSV Export

Endpoint:

```
GET /sessions/export
```

Downloads a CSV file containing all session records.

---

# 📈 Weekly Report

Endpoint:

```
GET /sessions/weekly-report
```

Returns:

```json
[
  {
    "week": "2026-W08",
    "total_sessions": 10,
    "completed_sessions": 8
  }
]
```

Overdue sessions are NOT counted as completed.

---

# 🔐 Validation Rules

- Cannot pause before starting
- Cannot resume unless paused
- Cannot complete without start_time
- >3 pauses → interrupted
- Overdue if duration exceeds 110%
- Pause requires reason

---

# 🧪 Testing Coverage Includes

- Invalid state transitions
- Interruption counting
- Overdue logic
- Resume validation
- Completion validation
- In-memory DB isolation per test

---

# 💡 Design Insights

### Why Service Layer?
Separates business logic from API routes for better testability and scalability.

### Why Alembic?
Ensures database version control and production-ready migration handling.

### Why SDK?
Allows programmatic usage and integration into automation workflows.

### Why Focus Score?
Encourages deep, uninterrupted work sessions.

---

# 🚀 Future Enhancements

- JWT Authentication
- User accounts
- Productivity analytics dashboard
- Charts (Recharts)
- Deployment on Render/Vercel
- Dockerization
- CI/CD pipeline
- Redis caching
- PostgreSQL production DB

---

# 🏆 Evaluation Criteria Checklist

✅ Session state transitions handled correctly  
✅ Robust validation  
✅ Accurate session history  
✅ SDK works  
✅ Clean frontend UX  
✅ Setup scripts  
✅ Professional README  
✅ Unit tests for session & interruption logic  

---  

This project was built as a comprehensive full-stack system demonstrating:

- Backend API design using FastAPI  
- Database modeling & migration management with SQLite + Alembic  
- Structured business logic using service-layer architecture  
- Modern frontend implementation with React (Vite)  
- Python SDK integration for programmatic usage  
- Real-time session state handling  
- Robust validation & edge case handling  
- Unit testing with in-memory database isolation  

---
