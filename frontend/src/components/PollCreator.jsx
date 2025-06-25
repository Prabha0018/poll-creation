import PollForm from "./PollForm";
import PollVote from "./PollVote";
//import PollResults from "./PollResults";
//
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { pollsAPI, isAuthenticated } from '../services/api';
import { FiArrowLeft } from 'react-icons/fi';
import "./Styles/PollCreator.css";
import { toast } from 'react-toastify';

function PollCreator() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitted, setSubmitted] = useState(false);
  const [votes, setVotes] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setError("Please login to create a poll");
      toast.error("Please login to create a poll");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const filteredOptions = options.filter(opt => opt.trim() !== '');
      const pollData = {
        question: question.trim(),
        options: filteredOptions
      };

      const newPoll = await pollsAPI.createPoll(pollData);
      setSubmitted(true);
      setVotes(newPoll.options.map(opt => opt.votes));
      setHasVoted(false);
      toast.success('Poll created successfully!');
      setTimeout(() => navigate(`/poll/${newPoll._id}`), 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Poll creation failed!');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (idx) => {
    if (hasVoted) return;
    const newVotes = [...votes];
    newVotes[idx] += 1;
    setVotes(newVotes);
    setHasVoted(true);
  };

  const totalVotes = votes.reduce((a, b) => a + b, 0);

  return (
    <div className="poll-container fade-in">
      <div className="poll-vote-card">
        <button className="back-to-polls-btn modern-back-btn" onClick={() => navigate('/')}
          style={{alignSelf: 'flex-start', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',color: '#fff'}}
        >
          <FiArrowLeft size={20} style={{marginRight: 4}} /> Back to Polls
        </button>
        <h1 className="poll-title">Create a Poll</h1>
        {error && <div className="error-message">{error}</div>}
        {!submitted ? (
          <PollForm
            question={question}
            options={options}
            onQuestionChange={(e) => setQuestion(e.target.value)}
            onOptionChange={handleOptionChange}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onSubmit={handleSubmit}
            loading={loading}
          />
        ) : (
          <div className="poll-preview">
            <h2>Poll: {question}</h2>
            {!hasVoted ? (
              <PollVote
                question={question}
                options={options.filter(opt => opt.trim() !== '')}
                onVote={handleVote}
                hasVoted={hasVoted}
              />
            ) : (
              <PollResults
                options={options.filter(opt => opt.trim() !== '')}
                votes={votes}
                totalVotes={totalVotes}
                onClearVote={() => {
                  setHasVoted(false);
                  setVotes(Array(options.filter(opt => opt.trim() !== '').length).fill(0));
                }}
              />
            )}
            <button
              className="add-btn"
              style={{ marginTop: 24 }}
              onClick={() => {
                setSubmitted(false);
                setQuestion("");
                setOptions(["", ""]);
                setVotes([]);
                setHasVoted(false);
                setError("");
              }}
            >
              Create Another Poll
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollCreator;
