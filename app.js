import express, { json } from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;

app.use(json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});