import { PORT, CORS_ORIGIN } from './config';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import workspacesRouter from './routes/workspaces';
import tasksRouter from './routes/tasks';
import ticketsRouter from './routes/tickets';
import usersRouter from './routes/users';

const app = express();

// Global Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/users', usersRouter);

// Root Status check
app.get('/status', (req, res) => {
  res.json({ status: 'ok', service: 'KoWoPlanner Backend API', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 KoWoPlanner Backend API running on port ${PORT}`);
});
