import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: '🗳️', title: 'Create Polls', desc: 'Build polls with multiple questions, options, and settings in minutes.' },
    { icon: '🔗', title: 'Share Instantly', desc: 'Share a unique link. Anyone can respond — no app install needed.' },
    { icon: '📊', title: 'Live Analytics', desc: 'Watch responses roll in with real-time charts and breakdowns.' },
    { icon: '🔒', title: 'Access Control', desc: 'Set polls as anonymous or require login. Add expiry times.' },
    { icon: '⚡', title: 'Real-time Updates', desc: 'Socket.io powered live updates as people submit responses.' },
    { icon: '📢', title: 'Publish Results', desc: 'Share final outcomes publicly once your poll is complete.' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="hero-content fade-in">
          <div className="hero-tag">✨ Full-stack MERN Polling Platform</div>
          <h1 className="hero-title">
            Create polls.<br />
            Collect feedback.<br />
            <span className="gradient-text">In real-time.</span>
          </h1>
          <p className="hero-subtitle">
            Build polls, share a link, and see live responses from your audience — with analytics, expiry control, and result publishing.
          </p>
          <div className="hero-cta">
            {user ? (
              <>
                <Link to="/create" className="btn btn-primary btn-lg">Create a Poll →</Link>
                <Link to="/dashboard" className="btn btn-outline btn-lg">My Dashboard</Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">Get Started Free →</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Everything you need to run polls</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-card fade-in" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            {[
              { step: '01', label: 'Create', desc: 'Register and build your poll with questions and options.' },
              { step: '02', label: 'Share', desc: 'Copy your unique poll link and send it anywhere.' },
              { step: '03', label: 'Collect', desc: 'Watch responses arrive in real-time on your dashboard.' },
              { step: '04', label: 'Publish', desc: 'Close the poll and publish the final results publicly.' },
            ].map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{s.step}</div>
                <div>
                  <h4>{s.label}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
