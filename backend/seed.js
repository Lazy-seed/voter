import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Poll from './models/Poll.js';
import Nominee from './models/Nominee.js';
import Vote from './models/Vote.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/live-polling');
    console.log('Connected to DB');

    // Clear existing data
    await User.deleteMany({});
    await Poll.deleteMany({});
    await Nominee.deleteMany({});
    await Vote.deleteMany({});

    // Create Admin
    await User.create({
      username: 'admin',
      password: 'password123', // Keeping it simple for the assignment
      role: 'admin'
    });
    console.log('Admin user created (username: admin, password: password123)');

    // Create Poll
    const poll = await Poll.create({
      title: 'Best JavaScript Framework 2026',
      description: 'Vote for your favorite JS framework!'
    });
    console.log('Poll created');

    // Create Nominees
    const nomineesData = [
      { name: 'React', bio: 'A JavaScript library for building user interfaces.' },
      { name: 'Vue', bio: 'The Progressive JavaScript Framework.' },
      { name: 'Angular', bio: 'The modern web developer\'s platform.' },
      { name: 'Svelte', bio: 'Cybernetically enhanced web apps.' },
      { name: 'Solid', bio: 'Simple and performant reactivity.' }
    ];

    const nominees = await Promise.all(
      nomineesData.map(n => Nominee.create({ ...n, pollId: poll._id }))
    );
    console.log('5 Nominees created');

    // Create some initial votes to populate the graph
    const sampleVotes = [];
    for (let i = 0; i < 50; i++) {
      // Randomly select a nominee (weighted slightly towards React/Vue for realism)
      const rand = Math.random();
      let nomineeIndex = 0;
      if (rand > 0.4) nomineeIndex = 1;
      if (rand > 0.7) nomineeIndex = 2;
      if (rand > 0.85) nomineeIndex = 3;
      if (rand > 0.95) nomineeIndex = 4;

      sampleVotes.push({
        pollId: poll._id,
        nomineeId: nominees[nomineeIndex]._id,
        sessionId: `dummy-session-${i}`
      });
    }

    await Vote.insertMany(sampleVotes);
    console.log('50 Sample votes created');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
