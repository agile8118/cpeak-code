import http from "node:http";
import fs from "node:fs/promises";

import { parseJSON } from "./util.js";

class Cpeak {
  constructor() {
    this.server = http.createServer();
    this.routes = {};
    this.middleware = [];

    this.server.on("request", async (req, res) => {
      // Send a file back to the client
      res.sendFile = async (path, mime) => {
        const fileHandle = await fs.open(path, "r");
        const fileStream = fileHandle.createReadStream();

        res.setHeader("Content-Type", mime);

        fileStream.pipe(res);
      };

      // Set the status code of the response
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };

      // Send a json data back to the client (for small json data, less than the highWaterMark)
      res.json = (data) => {
        // This is only good for bodies that their size is less than the highWaterMark value
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(data));
      };

      const urlWithoutParams = req.url.split("?")[0];
      req.params = new URLSearchParams(req.url.split("?")[1]);

      // Run all the middleware functions before we run the corresponding route
      const runMiddleware = async (req, res, middleware, index) => {
        // Out exit point...
        if (index === middleware.length) {
          // If the routes object does not have a key of req.method + req.url, return 404
          if (!this.routes[req.method.toLocaleLowerCase() + urlWithoutParams]) {
            return res
              .status(404)
              .json({ error: `Cannot ${req.method} ${urlWithoutParams}` });
          }

          // Handle the promise errors by passing them to the handleErr to save developers from having to manually wrap every handler in try catch.
          try {
            await this.routes[req.method.toLowerCase() + urlWithoutParams](
              req,
              res,
              (err) => {
                res.setHeader("Connection", "close");
                this._handleErr(err, req, res);
              },
            );
          } catch (err) {
            res.setHeader("Connection", "close");
            this._handleErr(err, req, res);
          }
        } else {
          await middleware[index](req, res, async () => {
            await runMiddleware(req, res, middleware, index + 1);
          });
        }
      };

      await runMiddleware(req, res, this.middleware, 0);
    });
  }

  route(method, path, cb) {
    this.routes[method + path] = cb;
  }

  beforeEach(cb) {
    this.middleware.push(cb);
  }

  handleErr(cb) {
    this._handleErr = cb;
  }

  listen(port, cb) {
    this.server.listen(port, () => {
      cb();
    });
  }
}

export { parseJSON };

export default Cpeak;
