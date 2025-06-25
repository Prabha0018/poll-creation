import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { pollsAPI, isAuthenticated } from '../services/api';
import { toast } from 'react-toastify';
import './Styles/PollDetails.css';

function PollResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);
  const [userVoteIndex, setUserVoteIndex] = useState(null);

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const pollData = await pollsAPI.getPollById(id);
      setPoll(pollData);
      setUserVoteIndex(pollData.getUserVote);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearVote = async () => {
    setClearing(true);
    try {
      await pollsAPI.clearVote(id);
      await fetchPoll();
      toast.success('Vote cleared!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Clear vote failed!');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="poll-details-container">
        <div className="loading">Loading poll results...</div>
      </div>
    );
  }

  if (error) {
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
  const userCanClearVote = isAuthenticated() && poll.hasUserVoted;

  return (
    <div className="poll-details-container">
      <div className="results-card">
       
        <h2>{poll.question}</h2>
        <div className="poll-author">By {poll.author.name}</div>
        <div className="poll-results">
          <h3 style={{color: '#fff'}}>Results</h3>
          {poll.options.map((opt, idx) => {
            const percent = totalVotes ? (opt.votes / totalVotes) * 100 : 0;
            const isUserVote = userVoteIndex === idx;
            return (
              <div className="result-row" key={idx} style={{alignItems: 'center'}}>
                <span className="result-label">
                  {opt.text}
                  {isUserVote && <span className="your-vote"> (Your vote)</span>}
                </span>
                <div className="result-bar-bg" style={{flex: 2, marginRight: 8}}>
                  <div
                    className={`result-bar${isUserVote ? ' user-bar' : ''}`}
                    style={{ width: percent + '%' }}
                  ></div>
                </div>
                <span className="result-count">{opt.votes}</span>
                <span className="result-percent">{percent.toFixed(1)}%</span>
              </div>
            );
          })}
          <div className="total-votes">Total votes: {totalVotes}</div>
        </div>
        {userCanClearVote || true ? (
          <div className="results-actions">
            {userCanClearVote && (
              <button
                className="clear-vote-btn"
                onClick={handleClearVote}
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Clear Vote'}
              </button>
            )}
            <Link to={poll.hasUserVoted ? '/' : `/poll/${poll._id}`} className="view-poll-btn">Back to Poll</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PollResultsPage; 