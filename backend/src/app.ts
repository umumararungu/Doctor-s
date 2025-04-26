import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import doctorRoutes from './routes/doctorRoutes';
import patientRoutes from './routes/patientRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import scheduleRoutes from './routes/scheduleRoutes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API routes
app.use('/auth', authRoutes);
app.use('/doctors', doctorRoutes);
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/schedules', scheduleRoutes);


// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Home route
app.get('/', (req, res) => {
  res.send('Server is running! Welcome to the API.');
});

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
