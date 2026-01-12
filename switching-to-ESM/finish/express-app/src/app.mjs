import express from "express";
import { fileURLToPath } from "url";

const app = express();

const publicPath = fileURLToPath(new URL("../public", import.meta.url));

app.use(express.static(publicPath));

app.get("/test", (req, res) => {
  res.send("Hello from ESM");
});

app.listen(3000);
