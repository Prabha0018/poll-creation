import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pollsAPI, isAuthenticated } from '../services/api';
import './Styles/PollList.css';
import { FiTrash2, FiArrowLeft, FiEdit } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';

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
  const [editingPollId, setEditingPollId] = useState(null);
  const [editingPollData, setEditingPollData] = useState({ question: '', options: [] });

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

  const handleEditClick = (poll) => {
    setEditingPollId(poll._id);
    setEditingPollData({
      question: poll.question,
      options: poll.options.map(opt => opt.text)
    });
  };

  const handleEditChange = (field, value, idx = null) => {
    if (field === 'question') {
      setEditingPollData(prev => ({ ...prev, question: value }));
    } else if (field === 'option') {
      setEditingPollData(prev => {
        const newOptions = [...prev.options];
        newOptions[idx] = value;
        return { ...prev, options: newOptions };
      });
    }
  };

  const handleEditOptionAdd = () => {
    setEditingPollData(prev => ({ ...prev, options: [...prev.options, ''] }));
  };

  const handleEditOptionRemove = (idx) => {
    setEditingPollData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx)
    }));
  };

  const handleEditCancel = () => {
    setEditingPollId(null);
    setEditingPollData({ question: '', options: [] });
  };

  const handleEditSave = async (pollId) => {
    try {
      const updatedPoll = await pollsAPI.updatePoll(pollId, {
        question: editingPollData.question,
        options: editingPollData.options
      });
      setPolls(polls.map(p => p._id === pollId ? updatedPoll : p));
      setEditingPollId(null);
      setEditingPollData({ question: '', options: [] });
    } catch (err) {
      alert('Failed to update poll: ' + err.message);
    }
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
                <div className="poll-question">
                  {editingPollId === poll._id ? (
                    <input
                      type="text"
                      value={editingPollData.question}
                      onChange={e => handleEditChange('question', e.target.value)}
                      className="edit-poll-input"
                      style={{ width: '100%', fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}
                    />
                  ) : (
                    poll.question
                  )}
                </div>
                {isAuthor(poll) && (
                  <div className="poll-action-buttons">
                    {editingPollId === poll._id ? null : (
                      <button
                        className="edit-poll-btn-small"
                        title="Edit this poll"
                        onClick={() => handleEditClick(poll)}
                      >
                        <FiEdit size={20} color="#fff" />
                      </button>
                    )}
                  <button
                    className="delete-poll-btn-small"
                    onClick={() => handleDeletePoll(poll._id)}
                    disabled={deletingPolls.has(poll._id)}
                    title="Delete this poll"
                  >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                  </button>
                  </div>
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
              {editingPollId === poll._id ? (
                <div className="edit-poll-options">
                  {editingPollData.options.map((opt, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => handleEditChange('option', e.target.value, idx)}
                        className="edit-poll-input"
                        style={{ flex: 1, marginRight: 8 }}
                      />
                      {editingPollData.options.length > 2 && (
                        <button type="button" style={{color:'#ff0000', background: 'transparent'}} onClick={() => handleEditOptionRemove(idx) }>
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="add-option-btn" onClick={handleEditOptionAdd}>+ Add Option</button>
                  <div className="edit-poll-actions">
                    <button type="button" className="save-btn" onClick={() => handleEditSave(poll._id)}>Save</button>
                    <button type="button" className="cancel-btn" onClick={handleEditCancel}>Cancel</button>
                  </div>
                </div>
              ) : (
              <Link to={`/poll/${poll._id}`} className="view-poll-btn">View / Vote</Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PollList; 