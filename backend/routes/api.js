import express from 'express';
const router = express.Router();

import { getActivePoll, castVote } from '../controllers/pollController.js';
import { login, getStats } from '../controllers/adminController.js';

// --- AUDIENCE ROUTES ---
router.get('/poll', getActivePoll);
router.post('/vote', castVote);

// --- ADMIN ROUTES ---
router.post('/admin/login', login);
router.get('/admin/stats', getStats);

export default router;
