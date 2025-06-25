import React from "react";

function PollForm({ question, options, onQuestionChange, onOptionChange, onAddOption, onRemoveOption, onSubmit, loading = false }) {
  return (
    <form className="poll-form" onSubmit={onSubmit}>
      <label className="poll-label">
        Poll Question
        <input
          className="poll-input"
          type="text"
          value={question}
          onChange={onQuestionChange}
          placeholder="Enter your question..."
          required
          disabled={loading}
        />
      </label>
      <div className="poll-options">
        {options.map((option, idx) => (
          <div className="poll-option-row" key={idx}>
            <input
              className="poll-input option-input"
              type="text"
              value={option}
              onChange={(e) => onOptionChange(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              required
              disabled={loading}
            />
            {options.length > 2 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemoveOption(idx)}
                aria-label="Remove option"
                disabled={loading}
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" className="add-btn" onClick={onAddOption} disabled={loading}>
        + Add Option
      </button>
      <button type="submit" className="submit-btn" disabled={loading}>
        {loading ? 'Creating Poll...' : 'Create Poll'}
      </button>
    </form>
  );
}

export default PollForm;
