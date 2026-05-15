import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../hooks/useSocket';
import './PollAnalytics.css';

export default function PollAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [liveFlash, setLiveFlash] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(`/api/polls/${id}/analytics`);
      setData(res.data);
      setLiveCount(res.data.poll.totalResponses);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Real-time updates via Socket.io
  const handleNewResponse = useCallback((update) => {
    setLiveCount(update.totalResponses);
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 1500);
    // Refresh analytics to get updated counts
    fetchAnalytics();
  }, [fetchAnalytics]);

  useSocket(id, handleNewResponse, null);

  const copyLink = () => {
    if (!data) return;
    const url = `${window.location.origin}/poll/${data.poll.shareCode || ''}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const publishResults = async () => {
    if (!window.confirm('Publish results? This will close the poll and make results public.')) return;
    setPublishing(true);
    try {
      await axios.patch(`/api/polls/${id}/publish`);
      fetchAnalytics();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const getPollFromId = async () => {
    // Get share code for copy link
    try {
      const res = await axios.get(`/api/polls/${id}`);
      return res.data.shareCode;
    } catch { return null; }
  };

  useEffect(() => {
    if (data && !data.poll.shareCode) {
      getPollFromId().then(code => {
        if (code) setData(prev => ({ ...prev, poll: { ...prev.poll, shareCode: code } }));
      });
    }
  }, [data]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (error) return (
    <div className="page">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Dashboard</button>
    </div>
  );

  const { poll, analytics, recentResponses } = data;

  return (
    <div className="page">
      {/* Header */}
      <div className="analytics-header">
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}>
          ← Back
        </button>
        <div className="header-actions">
          {!poll.isPublished && (
            <>
              <button className="btn btn-outline btn-sm" onClick={copyLink}>
                {copiedLink ? '✅ Copied!' : '🔗 Copy Poll Link'}
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={publishResults}
                disabled={publishing || poll.totalResponses === 0}
              >
                {publishing ? 'Publishing...' : '📢 Publish Results'}
              </button>
            </>
          )}
          {poll.isPublished && (
            <button className="btn btn-outline btn-sm" onClick={copyLink}>
              {copiedLink ? '✅ Copied!' : '🔗 Copy Results Link'}
            </button>
          )}
        </div>
      </div>

      <div className="poll-title-row">
        <h1>{poll.title}</h1>
        {poll.isPublished && <span className="badge badge-blue">Published</span>}
        {!poll.isPublished && poll.isActive && <span className="badge badge-green">Active</span>}
        {!poll.isPublished && !poll.isActive && <span className="badge badge-red">Inactive</span>}
      </div>

      {/* Live counter */}
      <div className={`live-banner ${liveFlash ? 'flash' : ''}`}>
        <div className="live-dot" />
        <span>Live</span>
        <span className="live-count">{liveCount} response{liveCount !== 1 ? 's' : ''} collected</span>
        {!poll.isPublished && poll.isActive && <span className="live-label">• Collecting</span>}
        {poll.isPublished && <span className="live-label">• Results Published</span>}
      </div>

      {/* Summary stats */}
      <div className="stats-row" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-value">{poll.totalResponses}</div>
          <div className="stat-label">Total Responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{analytics.length}</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {poll.totalResponses > 0
              ? Math.round(analytics.reduce((s, a) => s + a.totalAnswers, 0) / poll.totalResponses)
              : 0}
          </div>
          <div className="stat-label">Avg. Answers/Response</div>
        </div>
        {poll.expiresAt && (
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>
              {new Date() > new Date(poll.expiresAt) ? 'Expired' : new Date(poll.expiresAt).toLocaleDateString()}
            </div>
            <div className="stat-label">Expiry</div>
          </div>
        )}
      </div>

      {/* Question analytics */}
      <div className="questions-analytics">
        {analytics.map((qa, idx) => (
          <div key={qa.questionId} className="card qa-card fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
            <div className="qa-header">
              <div>
                <span className="qa-num">Q{idx + 1}</span>
                <span className="qa-title">{qa.questionText}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                {qa.isMandatory && <span className="badge badge-light">Mandatory</span>}
                <span className="badge badge-blue">{qa.totalAnswers} answered</span>
              </div>
            </div>

            <div className="options-analytics">
              {qa.optionCounts.map((opt, oi) => {
                const isTop = qa.topOption?.text === opt.text && opt.count > 0;
                return (
                  <div key={oi} className={`option-bar-row ${isTop ? 'is-top' : ''}`}>
                    <div className="option-bar-label">
                      <span className="option-bar-letter">{String.fromCharCode(65 + oi)}</span>
                      <span>{opt.text}</span>
                      {isTop && <span className="top-badge">👑 Top</span>}
                    </div>
                    <div className="option-bar-right">
                      <div className="progress-bar-wrap" style={{ flex: 1 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                      <span className="option-bar-count">{opt.count} ({opt.percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recent responses */}
      {recentResponses.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
            Recent Responses
          </h3>
          <div className="recent-list">
            {recentResponses.map((r, i) => (
              <div key={i} className="recent-item">
                <div className="recent-avatar">{poll.isAnonymous ? '?' : r.respondent[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14 }}>{r.respondent}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.answersCount} answers · {new Date(r.submittedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {poll.totalResponses === 0 && (
        <div className="empty-state" style={{ marginTop: 24 }}>
          <div className="empty-icon">📭</div>
          <h3>No responses yet</h3>
          <p>Share your poll link to start collecting responses</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={copyLink}>
            {copiedLink ? '✅ Copied!' : '🔗 Copy Poll Link'}
          </button>
        </div>
      )}
    </div>
  );
}
