import type { Request , Response , NextFunction } from "express";

export const errorHandler = async (err: Error , _req: Request , res: Response , _next: NextFunction) => {

    console.log("Error" , err)

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500
    // if status code is 200 and we still hit error handler , that means it's an internal error

    res.status(statusCode).json({
        error: err.message || "Internal Server Error" 
    })
}