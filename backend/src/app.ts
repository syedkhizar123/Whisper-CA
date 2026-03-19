import express from "express"
import { clerkMiddleware } from '@clerk/express'
import authRoutes from "./routes/authRoutes"
import chatRoutes from "./routes/chatRoutes"
import messageRoutes from "./routes/messageRoutes"
import userRoutes from "./routes/userRoutes"
import { errorHandler } from "./middlewares/errorHandler"
import cors from "cors"


const app = express()
app.use(express.json())

const allowedOrigins = [
    "http://localhost:8081",
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean)

// Middleware that integrates clerk authentication into express application
app.use(clerkMiddleware())
app.use(cors({
    origin: allowedOrigins as any,
    credentials: true
}))

app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`)
    next()
})

app.get("/health" , (req , res) => {
    res.json({ status: "ok" , message: "Server is running"})
})

app.use("/api/auth" , authRoutes)
app.use("/api/chats" , chatRoutes)
app.use("/api/messages" , messageRoutes)
app.use("/api/users" , userRoutes)

// error handlers must come after all the routes and other middlewares so they can catch errors passed with next(err) or thrown inside async handlers.
app.use(errorHandler)


export default app