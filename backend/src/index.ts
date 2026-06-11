import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import workspacesRouter from './routes/workspaces';
import tasksRouter from './routes/tasks';
import ticketsRouter from './routes/tickets';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Global Middleware
app.use(cors({
  origin: '*', // Allow all origins for prototype flexibility, configure properly in production
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
