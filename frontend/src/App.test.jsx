import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import ActiveSession from './components/ActiveSession';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock window.open
window.open = jest.fn();

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('App Component', () => {
  const mockHistory = [
    { id: 1, title: 'Session 1', goal: 'Goal 1', scheduled_duration: 30, status: 'scheduled', focus_score: 100 },
    { id: 2, title: 'Session 2', goal: 'Goal 2', scheduled_duration: 30, status: 'active', focus_score: 95, start_time: new Date().toISOString() },
    { id: 3, title: 'Session 3', goal: 'Goal 3', scheduled_duration: 30, status: 'paused', focus_score: 90 },
    { id: 4, title: 'Session 4', goal: 'Goal 4', scheduled_duration: 30, status: 'completed', focus_score: 100 },
  ];

  const mockWeekly = [
    { week: '2026-W09', total_sessions: 4, completed_sessions: 1, overdue_sessions: 0, interrupted_sessions: 0 }
  ];

  beforeEach(() => {
    jest.useFakeTimers();
    axios.get.mockImplementation((url) => {
      if (url.includes('/sessions/history')) {
        return Promise.resolve({ data: mockHistory });
      }
      if (url.includes('/sessions/weekly-report')) {
        return Promise.resolve({ data: mockWeekly });
      }
      return Promise.reject(new Error('not found'));
    });
    axios.post.mockResolvedValue({ data: { id: 5, title: 'New', status: 'scheduled' } });
    axios.patch.mockResolvedValue({ data: { status: 'updated' } });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('matches snapshot', async () => {
    const { asFragment } = render(<App />);
    await waitFor(() => expect(screen.getByText('Session 1')).toBeInTheDocument());
    expect(asFragment()).toMatchSnapshot();
  });

  test('renders App and fetches initial data', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Session 1')).toBeInTheDocument());
    expect(screen.getByText('Deep Work Tracker')).toBeInTheDocument();
    expect(screen.getByText('Session 2')).toBeInTheDocument();
  });

  test('creates a new session', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 1'));
    const titleInput = screen.getByPlaceholderText(/Title \*/i);
    const goalInput = screen.getByPlaceholderText(/Goal \*/i);
    const durationInput = screen.getByPlaceholderText(/Duration \(minutes\) \*/i);
    const createBtn = screen.getByRole('button', { name: /Create Session/i });

    fireEvent.change(titleInput, { target: { value: 'New Session' } });
    fireEvent.change(goalInput, { target: { value: 'New Goal' } });
    fireEvent.change(durationInput, { target: { value: '45' } });
    
    fireEvent.click(createBtn);

    await waitFor(() => expect(axios.post).toHaveBeenCalledWith(expect.any(String), {
      title: 'New Session',
      goal: 'New Goal',
      scheduled_duration: 45
    }));

    // Check if fields are cleared
    await waitFor(() => expect(titleInput.value).toBe(''));
    
    // Fast-forward timers for highlight clearing
    act(() => {
      jest.advanceTimersByTime(4000);
    });
  });

  test('starts a scheduled session', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 1'));
    const startBtn = screen.getByRole('button', { name: /Start/i });
    fireEvent.click(startBtn);
    expect(axios.patch).toHaveBeenCalledWith(expect.stringContaining('/sessions/1/start'));
  });

  test('opens pause modal and confirms pause', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 2'));
    const pauseBtn = screen.getByRole('button', { name: /Pause/i });
    fireEvent.click(pauseBtn);

    expect(screen.getByText('Pause Session')).toBeInTheDocument();
    const reasonInput = screen.getByPlaceholderText(/Enter pause reason.../i);
    fireEvent.change(reasonInput, { target: { value: 'Phone call' } });
    
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmBtn);

    expect(axios.patch).toHaveBeenCalledWith(expect.stringContaining('/sessions/2/pause'), {
      reason: 'Phone call'
    });
  });

  test('resumes a paused session', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 3'));
    const resumeBtn = screen.getByRole('button', { name: /Resume/i });
    fireEvent.click(resumeBtn);
    expect(axios.patch).toHaveBeenCalledWith(expect.stringContaining('/sessions/3/resume'));
  });

  test('completes an active session', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 2'));
    const completeBtn = screen.getAllByRole('button', { name: /Complete/i })[0];
    fireEvent.click(completeBtn);
    expect(axios.patch).toHaveBeenCalledWith(expect.stringContaining('/sessions/2/complete'));
  });

  test('toggles history visibility', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 1'));
    const toggleBtn = screen.getByText(/Show History/i);
    fireEvent.click(toggleBtn);
    expect(screen.getByText('Session History')).toBeInTheDocument();
    expect(screen.getByText('Session 4')).toBeInTheDocument();
    
    fireEvent.click(toggleBtn);
    expect(screen.queryByText('Session History')).not.toBeInTheDocument();
  });

  test('downloads CSV', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 1'));
    const downloadBtn = screen.getByRole('button', { name: /Download CSV/i });
    fireEvent.click(downloadBtn);
    expect(window.open).toHaveBeenCalled();
  });

  test('timer updates periodically for active sessions', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 2'));
    
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // The exact text depends on current time vs start_time, 
    // but we check if the timer element exists
    expect(screen.getByText(/⏱/)).toBeInTheDocument();
  });

  test('handles Enter key navigation and submission', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 1'));
    const titleInput = screen.getByPlaceholderText(/Title \*/i);
    const goalInput = screen.getByPlaceholderText(/Goal \*/i);
    const durationInput = screen.getByPlaceholderText(/Duration \(minutes\) \*/i);

    fireEvent.keyDown(titleInput, { key: 'Enter' });
    expect(document.activeElement).toBe(goalInput);

    fireEvent.keyDown(goalInput, { key: 'Enter' });
    expect(document.activeElement).toBe(durationInput);

    // Fill fields to allow submission on Enter
    fireEvent.change(titleInput, { target: { value: 'T' } });
    fireEvent.change(goalInput, { target: { value: 'G' } });
    fireEvent.change(durationInput, { target: { value: '10' } });
    
    fireEvent.keyDown(durationInput, { key: 'Enter' });
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  test('modal closes on Cancel', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 2'));
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByText('Pause Session')).not.toBeInTheDocument();
  });

  test('pause modal submission via Enter key', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Session 2'));
    fireEvent.click(screen.getByRole('button', { name: /Pause/i }));
    
    const reasonInput = screen.getByPlaceholderText(/Enter pause reason.../i);
    fireEvent.change(reasonInput, { target: { value: 'Reason' } });
    fireEvent.keyDown(reasonInput, { key: 'Enter' });
    
    expect(axios.patch).toHaveBeenCalledWith(expect.stringContaining('/pause'), expect.anything());
  });

  test('renders empty message when no active sessions', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: [] })); // history
    axios.get.mockImplementationOnce(() => Promise.resolve({ data: [] })); // weekly
    
    render(<App />);
    await waitFor(() => expect(screen.getByText('No active sessions.')).toBeInTheDocument());
  });
});

describe('ActiveSession Component', () => {
  const mockItem = {
    id: 1,
    title: 'Test Session',
    status: 'active',
    focus_score: 100,
  };

  const mockProps = {
    item: mockItem,
    highlightedId: null,
    timerValue: '10m 00s',
    onStart: jest.fn(),
    onPause: jest.fn(),
    onResume: jest.fn(),
    onComplete: jest.fn(),
  };

  test('matches snapshot when active', () => {
    const { asFragment } = render(<ActiveSession {...mockProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('matches snapshot when scheduled', () => {
    const scheduledProps = {
      ...mockProps,
      item: { ...mockItem, status: 'scheduled' },
      timerValue: null,
    };
    const { asFragment } = render(<ActiveSession {...scheduledProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('matches snapshot when paused', () => {
    const pausedProps = {
      ...mockProps,
      item: { ...mockItem, status: 'paused' },
      timerValue: null,
    };
    const { asFragment } = render(<ActiveSession {...pausedProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('calls onStart when Start button is clicked', () => {
    const scheduledProps = {
      ...mockProps,
      item: { ...mockItem, status: 'scheduled' },
    };
    render(<ActiveSession {...scheduledProps} />);
    fireEvent.click(screen.getByText('Start'));
    expect(mockProps.onStart).toHaveBeenCalledWith(1);
  });

  test('calls onPause when Pause button is clicked', () => {
    render(<ActiveSession {...mockProps} />);
    fireEvent.click(screen.getByText('Pause'));
    expect(mockProps.onPause).toHaveBeenCalledWith(1);
  });

  test('calls onComplete when Complete button is clicked (active)', () => {
    render(<ActiveSession {...mockProps} />);
    fireEvent.click(screen.getByText('Complete'));
    expect(mockProps.onComplete).toHaveBeenCalledWith(1);
  });

  test('calls onResume when Resume button is clicked', () => {
    const pausedProps = {
      ...mockProps,
      item: { ...mockItem, status: 'paused' },
    };
    render(<ActiveSession {...pausedProps} />);
    fireEvent.click(screen.getByText('Resume'));
    expect(mockProps.onResume).toHaveBeenCalledWith(1);
  });

  test('calls onComplete when Complete button is clicked (paused)', () => {
    const pausedProps = {
      ...mockProps,
      item: { ...mockItem, status: 'paused' },
    };
    render(<ActiveSession {...pausedProps} />);
    fireEvent.click(screen.getByText('Complete'));
    expect(mockProps.onComplete).toHaveBeenCalledWith(1);
  });
});