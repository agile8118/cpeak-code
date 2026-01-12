const express = require("express");
const path = require("path");

const app = express();

const publicPath = path.join(__dirname, "../public");

app.use(express.static(publicPath));

app.get("/test", (req, res) => {
  res.send("Hello from CommonJS");
});

app.listen(3000);
