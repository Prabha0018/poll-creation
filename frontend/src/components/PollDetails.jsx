import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollsAPI, isAuthenticated } from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Styles/PollDetails.css';

function PollDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [userVoteIndex, setUserVoteIndex] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPoll();
    // eslint-disable-next-line
  }, [id]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const pollData = await pollsAPI.getPollById(id);
      setPoll(pollData);
      
      // Check if user has voted (if authenticated)
      if (isAuthenticated()) {
        setHasVoted(pollData.hasUserVoted);
        setUserVoteIndex(pollData.getUserVote);
        if (pollData.hasUserVoted) {
          navigate(`/poll/${id}/results`, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (idx) => {
    if (!isAuthenticated()) {
      setError('Please login to vote');
      toast.error('Please login to vote');
      return;
    }

    if (hasVoted) return;

    try {
      const updatedPoll = await pollsAPI.vote(id, idx);
      setPoll(updatedPoll);
      setHasVoted(true);
      setUserVoteIndex(idx);
      setError('');
      toast.success('Vote submitted!');
      navigate(`/poll/${id}/results`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Vote failed!');
    }
  };

  const handleClearVote = async () => {
    try {
      const updatedPoll = await pollsAPI.clearVote(id);
      setPoll(updatedPoll);
      setHasVoted(false);
      setUserVoteIndex(null);
      setError('');
      toast.success('Vote cleared!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Clear vote failed!');
    }
  };

  const handleDeletePoll = async () => {
    try {
      setDeleting(true);
      await pollsAPI.deletePoll(id);
      toast.success('Poll deleted!');
      navigate('/');
    } catch (err) {
      setError(err.message);
      setShowDeleteConfirm(false);
      toast.error(err.message || 'Delete failed!');
    } finally {
      setDeleting(false);
    }
  };

  const isAuthor = () => {
    if (!isAuthenticated() || !poll) return false;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return poll.author._id === user.id;
  };

  if (loading) {
    return (
      <div className="poll-details-container">
        <div className="loading">Loading poll...</div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="poll-details-container">
        <div className="error-message">{error}</div>
        <button onClick={fetchPoll} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-details-container">
        <div className="error-message">Poll not found.</div>
      </div>
    );
  }

  const totalVotes = poll.totalVotes;

  return (
    <div className="poll-details-container">
      <div className="poll-vote-card">
        <button className="back-to-polls-btn modern-back-btn" onClick={() => navigate('/')}
          style={{alignSelf: 'flex-start', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',color: '#fff'}}
        >
          <FiArrowLeft size={20} style={{marginRight: 4,color: '#fff'}} /> Back to Polls
        </button>
        {error && <div className="error-message">{error}</div>}
        <div className="poll-header" style={{flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}>
          <h2>{poll.question}</h2>
          <div className="poll-author">By {poll.author.name}</div>
          {isAuthor() && (
            <button 
              className="delete-poll-btn"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Poll'}
            </button>
          )}
        </div>
        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
              <h3>Delete Poll</h3>
              <p>Are you sure you want to delete this poll? This action cannot be undone.</p>
              <div className="delete-confirm-buttons">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={handleDeletePoll}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        {!hasVoted ? (
          isAuthenticated() ? (
            <div className="poll-options">
              {poll.options.map((opt, idx) => (
                <button 
                  key={idx} 
                  className="poll-option-btn" 
                  onClick={() => handleVote(idx)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          ) : (
            <div className="not-logged-in-message">
              <p>
                Please <Link to="/login" className="login-link">log in</Link> to vote on this poll.
              </p>
            </div>
          )
        ) : (
          <>
            <div className="poll-results">
              <h3>Results</h3>
              {poll.options.map((opt, idx) => (
                <div className="result-row" key={idx}>
                  <span className="result-label">
                    {opt.text}
                    {userVoteIndex === idx && <span className="your-vote"> (Your vote)</span>}
                  </span>
                  <div className="result-bar-bg">
                    <div 
                      className="result-bar" 
                      style={{
                        width: totalVotes ? `${(opt.votes/totalVotes)*100}%` : '0%'
                      }}
                    ></div>
                  </div>
                  <span className="result-count">{opt.votes}</span>
                </div>
              ))}
              <div className="total-votes">Total votes: {totalVotes}</div>
            </div>
            <button className="clear-vote-btn" onClick={handleClearVote}>
              Clear Vote
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PollDetails; 