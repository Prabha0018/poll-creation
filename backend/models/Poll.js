const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true
  },
  options: [{
    text: {
      type: String,
      required: true,
      trim: true
    },
    votes: {
      type: Number,
      default: 0
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalVotes: {
    type: Number,
    default: 0
  },
  voters: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    optionIndex: {
      type: Number,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Method to add a vote
pollSchema.methods.addVote = function(userId, optionIndex) {
  if (optionIndex < 0 || optionIndex >= this.options.length) {
    throw new Error('Invalid option index');
  }
  
  // Check if user has already voted
  const existingVote = this.voters.find(vote => vote.user.toString() === userId.toString());
  if (existingVote) {
    throw new Error('User has already voted');
  }
  
  // Add vote
  this.options[optionIndex].votes += 1;
  this.totalVotes += 1;
  this.voters.push({
    user: userId,
    optionIndex: optionIndex
  });
  
  return this.save();
};

// Method to remove a vote
pollSchema.methods.removeVote = function(userId) {
  const existingVote = this.voters.find(vote => vote.user.toString() === userId.toString());
  if (!existingVote) {
    throw new Error('User has not voted on this poll');
  }
  
  // Remove vote
  this.options[existingVote.optionIndex].votes -= 1;
  this.totalVotes -= 1;
  this.voters = this.voters.filter(vote => vote.user.toString() !== userId.toString());
  
  return this.save();
};

// Method to check if user has voted
pollSchema.methods.hasUserVoted = function(userId) {
  return this.voters.some(vote => vote.user.toString() === userId.toString());
};

// Method to get user's vote
pollSchema.methods.getUserVote = function(userId) {
  const vote = this.voters.find(vote => vote.user.toString() === userId.toString());
  return vote ? vote.optionIndex : null;
};

module.exports = mongoose.model('Poll', pollSchema); 