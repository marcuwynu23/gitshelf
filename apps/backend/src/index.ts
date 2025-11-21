import express, {Request, Response} from "express";

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Simple GET route
app.get("/api/check", (req: Request, res: Response) => {
  res.json({
    message: "Hello from backend using Express and tsx!",
  });
});

// JSON API example: Get list of users
app.get("/api/users", (req: Request, res: Response) => {
  const users = [
    {id: 1, name: "Alice"},
    {id: 2, name: "Bob"},
    {id: 3, name: "Charlie"},
    {id: 4, name: "Sebastian"},
  ];
  res.json(users);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
