import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePoll.css';

const emptyOption = () => ({ text: '' });
const emptyQuestion = () => ({
  text: '',
  options: [emptyOption(), emptyOption()],
  isMandatory: true
});

export default function CreatePoll() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Question helpers
  const updateQuestion = (qi, field, val) => {
    const updated = [...questions];
    updated[qi] = { ...updated[qi], [field]: val };
    setQuestions(updated);
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);

  const removeQuestion = (qi) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== qi));
  };

  // Option helpers
  const updateOption = (qi, oi, val) => {
    const updated = [...questions];
    updated[qi].options[oi].text = val;
    setQuestions(updated);
  };

  const addOption = (qi) => {
    if (questions[qi].options.length >= 8) return;
    const updated = [...questions];
    updated[qi].options.push(emptyOption());
    setQuestions(updated);
  };

  const removeOption = (qi, oi) => {
    if (questions[qi].options.length <= 2) return;
    const updated = [...questions];
    updated[qi].options.splice(oi, 1);
    setQuestions(updated);
  };

  const validate = () => {
    if (!title.trim()) return 'Poll title is required';
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) return `Question ${i + 1} text is required`;
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].text.trim()) return `Question ${i + 1}, option ${j + 1} text is required`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/polls', {
        title: title.trim(),
        description: description.trim(),
        questions: questions.map(q => ({
          text: q.text.trim(),
          options: q.options.map(o => ({ text: o.text.trim() })),
          isMandatory: q.isMandatory
        })),
        isAnonymous,
        requiresAuth,
        expiresAt: expiresAt || null
      });
      navigate(`/analytics/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="create-header">
        <h1>Create a Poll</h1>
        <p className="text-muted">Build your poll, set options, then share the link</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        {/* Poll Details */}
        <div className="card form-section">
          <h2 className="section-label">📋 Poll Details</h2>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder="e.g. Team Lunch Preferences"
              value={title}
              onChange={e => { setTitle(e.target.value); setError(''); }}
              maxLength={200}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Description (optional)</label>
            <textarea
              placeholder="What is this poll about?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="questions-section">
          {questions.map((q, qi) => (
            <div key={qi} className="card question-card fade-in">
              <div className="question-header">
                <span className="question-num">Q{qi + 1}</span>
                <div className="question-header-right">
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={q.isMandatory}
                      onChange={e => updateQuestion(qi, 'isMandatory', e.target.checked)}
                    />
                    Mandatory
                  </label>
                  {questions.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Question</label>
                <input
                  type="text"
                  placeholder="Enter your question..."
                  value={q.text}
                  onChange={e => { updateQuestion(qi, 'text', e.target.value); setError(''); }}
                />
              </div>

              <div className="options-list">
                <label>Options</label>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="option-row">
                    <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                    <input
                      type="text"
                      placeholder={`Option ${oi + 1}`}
                      value={opt.text}
                      onChange={e => { updateOption(qi, oi, e.target.value); setError(''); }}
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        className="option-remove"
                        onClick={() => removeOption(qi, oi)}
                        title="Remove option"
                      >✕</button>
                    )}
                  </div>
                ))}
                {q.options.length < 8 && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => addOption(qi)}>
                    + Add Option
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline" onClick={addQuestion}>
            + Add Question
          </button>
        </div>

        {/* Settings */}
        <div className="card form-section">
          <h2 className="section-label">⚙️ Poll Settings</h2>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Anonymous Responses</div>
              <div className="toggle-desc">Respondent identities won't be recorded</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={e => setIsAnonymous(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="toggle-row">
            <div>
              <div className="toggle-label">Require Login to Respond</div>
              <div className="toggle-desc">Only logged-in users can submit responses</div>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={requiresAuth}
                onChange={e => setRequiresAuth(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Expiry Date & Time (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Leave blank for no expiry
            </div>
          </div>
        </div>

        <div className="create-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Creating poll...' : '🚀 Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
}
