import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import Poll from '../models/Poll.js';
import Nominee from '../models/Nominee.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';

// --- AUDIENCE ROUTES ---

// Get active poll and nominees
router.get('/poll', async (req, res) => {
  try {
    const poll = await Poll.findOne({ status: 'active' });
    if (!poll) return res.status(404).json({ message: 'No active poll found' });

    const nominees = await Nominee.find({ pollId: poll._id });
    
    // Check if current session already voted
    let hasVoted = false;
    let votedNomineeId = null;
    if (req.session.id) {
      const vote = await Vote.findOne({ pollId: poll._id, sessionId: req.session.id });
      if (vote) {
        hasVoted = true;
        votedNomineeId = vote.nomineeId;
      }
    }

    res.json({ poll, nominees, hasVoted, votedNomineeId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cast a vote
router.post('/vote', async (req, res) => {
  try {
    const { pollId, nomineeId } = req.body;
    const sessionId = req.session.id;

    if (!pollId || !nomineeId) {
      return res.status(400).json({ message: 'Poll ID and Nominee ID are required' });
    }

    // Ensure session hasn't voted for this poll already
    const existingVote = await Vote.findOne({ pollId, sessionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this session.' });
    }

    const vote = new Vote({ pollId, nomineeId, sessionId });
    await vote.save();

    // Broadcast the new vote event
    // Send updated stats to all connected admin clients
    const votes = await Vote.aggregate([
      { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
      { $group: { _id: '$nomineeId', count: { $sum: 1 } } }
    ]);
    
    const totalVotes = await Vote.countDocuments({ pollId });

    req.io.emit('VOTE_UPDATE', { votes, totalVotes });

    res.status(201).json({ message: 'Vote cast successfully' });
  } catch (error) {
    if (error.code === 11000) {
       return res.status(400).json({ message: 'You have already voted in this session.' });
    }
    res.status(500).json({ message: error.message });
  }
});

// --- ADMIN ROUTES ---

// Admin Login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, role: 'admin' });
    if (!user || user.password !== password) { // Simple check for assignment purpose
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set admin flag in session
    req.session.isAdmin = true;
    res.json({ message: 'Logged in successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Stats
router.get('/admin/stats', async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).json({ message: 'Unauthorized' });

  try {
    const poll = await Poll.findOne({ status: 'active' });
    if (!poll) return res.status(404).json({ message: 'No active poll' });

    const totalVotes = await Vote.countDocuments({ pollId: poll._id });
    
    const votes = await Vote.aggregate([
      { $match: { pollId: poll._id } },
      { $group: { _id: '$nomineeId', count: { $sum: 1 } } }
    ]);

    const nominees = await Nominee.find({ pollId: poll._id });

    res.json({
      poll,
      nominees,
      totalVotes,
      votes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
