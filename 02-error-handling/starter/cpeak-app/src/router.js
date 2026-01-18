import Test from "./controllers/test.js";

export default (server) => {
  server.route("get", "/", Test.indexFile);
  server.route("post", "/api/bar", Test.bar);
};
