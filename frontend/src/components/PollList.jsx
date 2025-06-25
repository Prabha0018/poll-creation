import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI, isAuthenticated } from '../services/api';
import './Styles/PollList.css';

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingPolls, setDeletingPolls] = useState(new Set());

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollsAPI.getAllPolls();
      setPolls(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPolls(prev => new Set(prev).add(pollId));
      await pollsAPI.deletePoll(pollId);
      setPolls(polls.filter(poll => poll._id !== pollId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingPolls(prev => {
        const newSet = new Set(prev);
        newSet.delete(pollId);
        return newSet;
      });
    }
  };

  const isAuthor = (poll) => {
    if (!isAuthenticated() || !poll) return false;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return poll.author._id === user.id;
  };

  if (loading) {
    return (
      <div className="poll-list-container">
        <div className="loading">Loading polls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="poll-list-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchPolls} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="poll-list-container fade-in">
      <div className="poll-list-header">
        <h2>All Polls</h2>
        <Link to="/create" className="create-poll-btn">+ Create Poll</Link>
      </div>
      <div className="poll-list">
        {polls.length === 0 ? (
          <div className="empty-polls">No polls yet. Be the first to <Link to="/create">create one</Link>!</div>
        ) : (
          polls.map((poll) => (
            <div className="poll-card" key={poll._id}>
              <div className="poll-card-header">
                <div className="poll-question">{poll.question}</div>
                {isAuthor(poll) && (
                  <button
                    className="delete-poll-btn-small"
                    onClick={() => handleDeletePoll(poll._id)}
                    disabled={deletingPolls.has(poll._id)}
                    title="Delete this poll"
                  >
                    {deletingPolls.has(poll._id) ? '...' : '×'}
                  </button>
                )}
              </div>
              <div className="poll-meta">
                <span className="poll-author-avatar">{getInitials(poll.author.name)}</span>
                By {poll.author.name}
              </div>
              <div className="poll-stats">
                <span>{poll.totalVotes} votes</span>
                <span>{poll.options.length} options</span>
              </div>
              <Link to={`/poll/${poll._id}`} className="view-poll-btn">View / Vote</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PollList; 