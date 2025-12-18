import "dotenv/config";
import { createApp } from "./app";

const app = createApp();

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on ${port}`);
});
