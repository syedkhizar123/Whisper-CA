import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../middlewares/auth";
import { Chat } from "../models/Chat";
import { Types } from "mongoose";


export const getChats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId
        const chats = await Chat.find({ participants: userId })
            .populate("participants", "name email avatar")
            .populate("lastMessage")
            .sort({ lastMessage: -1 })

        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(p => p._id.toString() !== userId)
            return {
                _id: chat._id,
                participant: otherParticipant ?? null,
                lastMessage: chat.lastMessage,
                lastMessageAt: chat.lastMessageAt,
                createdAt: chat.createdAt
            }
        })

        return res.status(200).json(formattedChats)
    } catch (error) {
        res.status(500)
        next(error)
    }
}



export const getCreateChat = async (req: AuthRequest , res: Response, next: NextFunction) => {
    try {
        const userId = req.userId
        const { participantId } = req.params

        if(!participantId) {
            return res.status(400).json({ message: "Participant ID is required"})
        }

        if(!Types.ObjectId.isValid(participantId as string)) {
            return res.status(400).json({ message: "Invalid participant ID"})
        }

        if(participantId === userId) {
            return res.status(400).json({ message: "Can not create chat with yourself"})
        }
        let chat = await Chat.findOne({ participants: { $all: [userId, participantId] } })
            .populate("participants", "name email avatar")
            .populate("lastMessage")

        if (!chat) {
            const newChat = new Chat({ participants: [userId, participantId] })
            await newChat.save()
            chat = await newChat.populate("participants", "name email avatar")
        }

        const otherParticipant = chat.participants.find(p => p._id.toString() !== userId)
        res.json({
            _id: chat._id,
            participant: otherParticipant ?? null,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
            createdAt: chat.createdAt
        })
    } catch (error) {
        res.status(500)
        next(error)
    }
}