import app from "./src/app";
import { connectDB } from "./src/config/db";
import dns from "dns"

dns.setServers(["1.1.1.1" , "8.8.8.8"])

const PORT = process.env.PORT

connectDB().then(() => {
    app.listen( PORT , () => {
    console.log("Server is up and running on PORT:" , PORT)
})
}).catch((error) => {
    console.log("Failed to start server" , error)
    process.exit(1)
})