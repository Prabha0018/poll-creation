const express = require('express');
const { body, validationResult } = require('express-validator');
const Poll = require('../models/Poll');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/polls
// @desc    Get all polls
// @access  Public
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find().populate('author', 'name email');
    res.json(polls);
  } catch (error) {
    console.error('Get polls error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/polls/:id
// @desc    Get poll by ID
// @access  Public (but can check for user if token is present)
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('author', 'name email');
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    let hasUserVoted = false;
    let userVoteIndex = null;

    // If user is authenticated, check if they have voted
    let userId = null;
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {}
    }
    if (userId) {
      hasUserVoted = poll.hasUserVoted(userId);
      userVoteIndex = poll.getUserVote(userId);
    }

    // Convert poll to object and add these fields
    const pollObj = poll.toObject();
    pollObj.hasUserVoted = hasUserVoted;
    pollObj.getUserVote = userVoteIndex;

    res.json(pollObj);
  } catch (error) {
    console.error('Get poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/polls
// @desc    Create a new poll
// @access  Private
router.post('/', auth, [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('options').isArray({ min: 2 }).withMessage('At least two options are required'),
  body('options.*').trim().notEmpty().withMessage('Option text is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { question, options } = req.body;
    const poll = new Poll({
      question,
      options: options.map(text => ({ text })),
      author: req.user._id
    });
    await poll.save();
    res.status(201).json(poll);
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/polls/:id/vote
// @desc    Vote on a poll
// @access  Private
router.post('/:id/vote', auth, [
  body('optionIndex').isInt({ min: 0 }).withMessage('Valid option index is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    await poll.addVote(req.user._id, optionIndex);
    await poll.populate('author', 'name email');
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Vote error' });
  }
});

// @route   POST /api/polls/:id/clear-vote
// @desc    Remove user's vote from a poll
// @access  Private
router.post('/:id/clear-vote', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    await poll.removeVote(req.user._id);
    await poll.populate('author', 'name email');
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Clear vote error' });
  }
});

// @route   DELETE /api/polls/:id
// @desc    Delete a poll (only author)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this poll' });
    }
    await poll.deleteOne();
    res.json({ message: 'Poll deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 