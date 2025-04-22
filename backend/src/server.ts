import app from './app';
import { createServer } from 'http';
import { initializeQueues } from './utils/redisQueue';

const PORT = process.env.PORT || 5000;

const server = createServer(app);

// Initialize Redis queue
initializeQueues();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
