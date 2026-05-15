import express from 'express';

import authRouter from './modules/auth/auth.route.js';
import pollsRouter from './modules/polls/polls.route.js';
import pollResponseRouter from './modules/pollResponse/pollResponse.route.js';

const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/polls', pollsRouter);
app.use('/api/responses', pollResponseRouter);


// Health check
app.get('/api/health', (req, res) => res.json({ 
  status: 'ok', 
  message: 'Pollify API running' 
}));

export default app;