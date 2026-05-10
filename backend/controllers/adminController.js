import Poll from '../models/Poll.js';
import Nominee from '../models/Nominee.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';

export const login = async (req, res) => {
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
};

export const getStats = async (req, res) => {
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
};
