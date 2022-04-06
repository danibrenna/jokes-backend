import { app } from "./app";

const PORT = process.env.NODE_PORT;

app.listen(PORT, () =>
  console.log(`Backend listening at http://localhost:${PORT}`)
);