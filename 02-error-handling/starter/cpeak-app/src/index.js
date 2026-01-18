import cpeak, { parseJSON } from "../cpeak/index.js";
import apiRouter from "./router.js";
import pkg from "pg";

export const pool = new pkg.Pool({
  user: "joseph",
  host: "localhost",
  database: "weer",
  password: "",
  port: 5432,
});

const fetchExternalData = (val) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (val === "9") {
        reject(new Error("Value 9 is restricted."));
      } else {
        resolve({ status: "success", received: val });
      }
    }, 500);
  });
};

const PORT = 8020;

const server = new cpeak();

// ------ Middlewares ------ //

// For parsing JSON body
server.beforeEach(parseJSON);

// ------ API Routes ------ //
apiRouter(server);

// A route to check if a URL exists, error happens if id is not valid
server.route("get", "/url", async (req, res) => {
  const id = req.params.get("id");

  const result = await pool.query(
    "SELECT real_url, shortened_url_id FROM urls WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "URL not found" });
  }

  const urlData = result.rows[0];

  return res.status(200).json({
    real_url: urlData.real_url,
    shortened_url_id: urlData.shortened_url_id,
  });
});

// This route has a synchronous error if the username is not provided
server.route("get", "/hello", (req, res) => {
  const username = req.params.get("username");

  if (!username.length) {
    return res.status(400).json({ error: "Username is required" });
  }

  return res.status(200).json({
    message: `Welcome, ${username.toUpperCase()}`,
  });
});

// This route has an asynchronous error if the input is "9"
server.route("get", "/data", async (req, res) => {
  const input = req.params.get("input");

  const data = await fetchExternalData(input);

  return res.status(200).json(data);
});

server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
