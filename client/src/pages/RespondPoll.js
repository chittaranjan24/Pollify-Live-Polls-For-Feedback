import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import './RespondPoll.css';

export default function RespondPoll() {
  const { shareCode } = useParams();
  const { user } = useAuth();
  const [pollData, setPollData] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'respond' | 'expired' | 'results'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Real-time: if poll gets published while viewing
  const handlePublished = useCallback(() => {
    window.location.reload();
  }, []);

  useSocket(pollData?.poll?._id, null, handlePublished);

  const fetchPoll = async () => {
    try {
      const { data } = await axios.get(`/api/polls/share/${shareCode}`);
      setPollData(data);
      setViewMode(data.viewMode);
    } catch (err) {
      setError(err.response?.data?.message || 'Poll not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPoll(); }, [shareCode]);

  const selectOption = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async () => {
    const { poll } = pollData;

    // Validate mandatory questions
    const mandatoryQuestions = poll.questions.filter(q => q.isMandatory);
    for (let q of mandatoryQuestions) {
      if (answers[q._id] === undefined) {
        setSubmitError(`Please answer: "${q.text}"`);
        return;
      }
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await axios.post('/api/responses/submit', {
        shareCode,
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
          questionId,
          selectedOptionIndex
        }))
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  if (error) return (
    <div className="respond-page">
      <div className="respond-container">
        <div className="respond-card card">
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <h2 style={{ margin: '16px 0 8px' }}>Poll Not Found</h2>
            <p style={{ color: 'var(--text-muted)' }}>{error}</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Go Home</Link>
          </div>
        </div>
      </div>
    </div>
  );

  const { poll } = pollData;

  // Success / submitted view
  if (submitted) return (
    <div className="respond-page">
      <div className="respond-container">
        <div className="respond-card card">
          <div className="submitted-view fade-in">
            <div className="submitted-icon">🎉</div>
            <h2>Response Submitted!</h2>
            <p>Thank you for participating in <strong>{poll.title}</strong>.</p>
            <div className="submitted-meta">
              <span>{Object.keys(answers).length} question{Object.keys(answers).length !== 1 ? 's' : ''} answered</span>
              <span>•</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <Link to="/" className="btn btn-outline" style={{ marginTop: 24 }}>Go Home</Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Expired
  if (viewMode === 'expired') return (
    <div className="respond-page">
      <div className="respond-container">
        <div className="respond-card card">
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48 }}>⏰</div>
            <h2 style={{ margin: '16px 0 8px' }}>Poll Closed</h2>
            <h3 style={{ color: 'var(--primary-light)', marginBottom: 12 }}>{poll.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>This poll is no longer accepting responses.</p>
            <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 13 }}>
              {poll.totalResponses} total responses collected
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Results / Published view
  if (viewMode === 'results') return (
    <div className="respond-page">
      <div className="respond-container">
        <div className="results-header">
          <span className="badge badge-blue">📢 Published Results</span>
          <h1>{poll.title}</h1>
          {poll.description && <p className="poll-description">{poll.description}</p>}
          <div className="results-meta">
            <span>📊 {poll.totalResponses} total responses</span>
            <span>•</span>
            <span>By {poll.creator?.name}</span>
          </div>
        </div>

        <div className="results-questions">
          {poll.questions.map((q, qi) => {
            const totalVotes = q.options.reduce((s, o) => s + (o.count || 0), 0);
            const topOption = q.options.reduce((a, b) => (a.count || 0) > (b.count || 0) ? a : b);
            return (
              <div key={q._id} className="card result-card fade-in" style={{ animationDelay: `${qi * 0.07}s` }}>
                <div className="result-q-header">
                  <span className="qa-num">Q{qi + 1}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{q.text}</span>
                </div>
                <div className="result-options">
                  {q.options.map((opt, oi) => {
                    const count = opt.count || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isTop = opt.text === topOption.text && count > 0;
                    return (
                      <div key={oi} className={`result-option ${isTop ? 'is-top' : ''}`}>
                        <div className="result-option-label">
                          <span className="option-bar-letter">{String.fromCharCode(65 + oi)}</span>
                          <span>{opt.text}</span>
                          {isTop && <span className="top-badge">👑</span>}
                        </div>
                        <div className="result-option-bar-row">
                          <div className="progress-bar-wrap" style={{ flex: 1 }}>
                            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="option-bar-count">{count} ({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Main respond view
  return (
    <div className="respond-page">
      <div className="respond-container">
        <div className="respond-header fade-in">
          <h1>{poll.title}</h1>
          {poll.description && <p className="poll-description">{poll.description}</p>}
          <div className="respond-meta">
            {poll.isAnonymous && <span className="badge badge-green">🔒 Anonymous</span>}
            {poll.requiresAuth && <span className="badge badge-yellow">🔐 Login Required</span>}
            {poll.expiresAt && (
              <span className="badge badge-light">
                ⏰ Expires {new Date(poll.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {!user && poll.requiresAuth && (
          <div className="alert alert-info">
            You need to <Link to="/login">log in</Link> to respond to this poll.
          </div>
        )}

        {submitError && <div className="alert alert-error">{submitError}</div>}

        <div className="respond-questions">
          {poll.questions.map((q, qi) => (
            <div
              key={q._id}
              className={`card respond-q fade-in ${!q.isMandatory ? 'optional' : ''}`}
              style={{ animationDelay: `${qi * 0.06}s` }}
            >
              <div className="respond-q-header">
                <span className="qa-num">Q{qi + 1}</span>
                <span className="respond-q-text">{q.text}</span>
                {!q.isMandatory && <span className="badge badge-light" style={{ flexShrink: 0 }}>Optional</span>}
              </div>

              <div className="respond-options">
                {q.options.map((opt, oi) => {
                  const selected = answers[q._id] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      className={`respond-option ${selected ? 'selected' : ''}`}
                      onClick={() => selectOption(q._id, oi)}
                    >
                      <span className={`option-radio ${selected ? 'checked' : ''}`} />
                      <span className="option-bar-letter">{String.fromCharCode(65 + oi)}</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="respond-submit">
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {Object.keys(answers).length} / {poll.questions.length} questions answered
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={submitting || (!user && poll.requiresAuth)}
          >
            {submitting ? 'Submitting...' : '✓ Submit Response'}
          </button>
        </div>
      </div>
    </div>
  );
}
