import cpeak, { parseJSON } from "../cpeak/index.js";
import apiRouter from "./router.js";

const PORT = 8020;

const server = new cpeak();

// ------ Middlewares ------ //

// For parsing JSON body
server.beforeEach(parseJSON);

// ------ API Routes ------ //
apiRouter(server);

server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
