import app from "./src/app.js"
import http from "http"
import connectoDB from "./src/config/database.js"
import config from "./src/config/config.js";
import { initSocket } from "./src/sockets/server.socket.js";
import { startCleanupJob } from "./src/services/cleanup.service.js";


const httpServer = http.createServer(app);
initSocket(httpServer);

connectoDB();
startCleanupJob();

const port = config.PORT || 3000;

httpServer.listen(port, ()=>{
    console.log(`Server is running on port ${port}.`)
})