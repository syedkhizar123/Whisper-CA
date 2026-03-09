import app from "./src/app";
import { connectDB } from "./src/config/db";
import { createServer } from "http";
import dns from "dns"
import { initializeSocket } from "./src/utils/socket";

dns.setServers(["1.1.1.1" , "8.8.8.8"])

const PORT = process.env.PORT

const httpServer = createServer(app)

initializeSocket(httpServer)

connectDB().then(() => {
    httpServer.listen( PORT , () => {
    console.log("Server is up and running on PORT:" , PORT)
})
}).catch((error) => {
    console.log("Failed to start server" , error)
    process.exit(1)
})