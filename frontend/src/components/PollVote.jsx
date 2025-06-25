import React from "react";

function PollVote({ question, options, onVote, hasVoted }) {
  return (
    <div className="poll-preview">
      <h2>Poll: {question}</h2>
      <ul className="preview-options">
        {options.map((opt, i) => (
          <li key={i} style={{ marginBottom: 12 }}>
            <button
              className="submit-btn"
              style={{ width: "100%", margin: 0 }}
              onClick={() => onVote(i)}
              disabled={hasVoted}
            >
              {opt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PollVote;
