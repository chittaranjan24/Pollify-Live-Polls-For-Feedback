import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchPolls = async () => {
    try {
      const { data } = await axios.get('/api/polls/my');
      setPolls(data);
    } catch (err) {
      setError('Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolls(); }, []);

  const copyLink = (shareCode, pollId) => {
    const url = `${window.location.origin}/poll/${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleActive = async (pollId) => {
    try {
      const { data } = await axios.patch(`/api/polls/${pollId}/toggle-active`);
      setPolls(polls.map(p => p._id === pollId ? { ...p, isActive: data.isActive } : p));
    } catch {
      alert('Failed to update poll status');
    }
  };

  const deletePoll = async (pollId) => {
    if (!window.confirm('Delete this poll? This cannot be undone.')) return;
    setDeletingId(pollId);
    try {
      await axios.delete(`/api/polls/${pollId}`);
      setPolls(polls.filter(p => p._id !== pollId));
    } catch {
      alert('Failed to delete poll');
    } finally {
      setDeletingId(null);
    }
  };

  const getPollStatus = (poll) => {
    if (poll.isPublished) return { label: 'Published', cls: 'badge-blue' };
    if (!poll.isActive) return { label: 'Inactive', cls: 'badge-red' };
    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) return { label: 'Expired', cls: 'badge-yellow' };
    return { label: 'Active', cls: 'badge-green' };
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-muted">Manage your polls and view analytics</p>
        </div>
        <Link to="/create" className="btn btn-primary">+ Create Poll</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{polls.length}</div>
          <div className="stat-label">Total Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{polls.filter(p => p.isActive && !p.isPublished).length}</div>
          <div className="stat-label">Active Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{polls.reduce((s, p) => s + (p.totalResponses || 0), 0)}</div>
          <div className="stat-label">Total Responses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{polls.filter(p => p.isPublished).length}</div>
          <div className="stat-label">Published</div>
        </div>
      </div>

      {/* Polls list */}
      {polls.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗳️</div>
          <h3>No polls yet</h3>
          <p>Create your first poll and start collecting feedback</p>
          <Link to="/create" className="btn btn-primary" style={{ marginTop: 16 }}>Create Poll →</Link>
        </div>
      ) : (
        <div className="polls-list">
          {polls.map(poll => {
            const status = getPollStatus(poll);
            return (
              <div key={poll._id} className="poll-row card fade-in">
                <div className="poll-row-main">
                  <div className="poll-row-info">
                    <div className="poll-row-title-row">
                      <h3>{poll.title}</h3>
                      <span className={`badge ${status.cls}`}>{status.label}</span>
                    </div>
                    <div className="poll-meta">
                      <span>📋 {poll.questions?.length} question{poll.questions?.length !== 1 ? 's' : ''}</span>
                      <span>💬 {poll.totalResponses} response{poll.totalResponses !== 1 ? 's' : ''}</span>
                      <span>🔒 {poll.isAnonymous ? 'Anonymous' : 'Identified'}</span>
                      {poll.expiresAt && (
                        <span>⏰ Expires {new Date(poll.expiresAt).toLocaleDateString()}</span>
                      )}
                      <span>📅 {new Date(poll.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="poll-row-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => copyLink(poll.shareCode, poll._id)}
                  >
                    {copiedId === poll._id ? '✅ Copied!' : '🔗 Copy Link'}
                  </button>

                  <Link to={`/analytics/${poll._id}`} className="btn btn-outline btn-sm">
                    📊 Analytics
                  </Link>

                  {!poll.isPublished && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => toggleActive(poll._id)}
                    >
                      {poll.isActive ? '⏸ Pause' : '▶ Resume'}
                    </button>
                  )}

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deletePoll(poll._id)}
                    disabled={deletingId === poll._id}
                  >
                    {deletingId === poll._id ? '...' : '🗑'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
