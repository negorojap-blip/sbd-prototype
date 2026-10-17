import express from 'express';
import cors from 'cors';
import { createSbdApiMiddleware } from './sbdServerMiddleware.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use((req, res, next) => {
  createSbdApiMiddleware()(req, res, next);
});

app.listen(PORT, () => {
  console.log(`SBD REST API Server running at http://localhost:${PORT}`);
});
