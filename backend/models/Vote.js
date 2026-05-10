import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  nomineeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Nominee', required: true },
  sessionId: { type: String, required: true }, // The unique session ID for the voter
  createdAt: { type: Date, default: Date.now }
});

// A session can only vote once per poll
voteSchema.index({ pollId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('Vote', voteSchema);
