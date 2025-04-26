// server.ts
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; // Import the auth routes

const app = express();

app.use(cors());
app.use(express.json());

// Use the auth routes
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
