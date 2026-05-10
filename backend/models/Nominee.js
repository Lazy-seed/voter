import mongoose from 'mongoose';

const nomineeSchema = new mongoose.Schema({
  pollId: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  name: { type: String, required: true },
  bio: { type: String },
  image: { type: String } // optional URL to an image
});

export default mongoose.model('Nominee', nomineeSchema);
