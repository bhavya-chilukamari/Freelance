import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { sendSuccess, sendError } from './utils/response.js';

import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import clientsRoutes from './modules/clients/clients.routes.js';
import projectsRoutes from './modules/projects/projects.routes.js';
import milestonesRoutes, { projectMilestonesRoutes } from './modules/milestones/milestones.routes.js';
import tasksRoutes from './modules/tasks/tasks.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

// Body Parsing Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    },
    'Freelance Platform API is operational'
  );
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/projects/:projectId/milestones', projectMilestonesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// 404 Catch-All Handler
app.use((req, res) => {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global Error Handler Middleware
app.use(errorHandler);

export default app;

