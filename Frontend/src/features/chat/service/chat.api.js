import { API_URL } from "../../../lib/env"
import axiosInstance from "../../../lib/AxiosInstance"

export const getChats = async () => {
    const response = await axiosInstance.get("/chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await axiosInstance.get(`/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await axiosInstance.delete(`/chats/delete/${chatId}`)
    return response.data
}

export const uploadAttachments = async (files) => {
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))   // "files" must match the server's field name
    const response = await axiosInstance.post("/chats/attachments", formData)
    return response.data.attachments
}

// where a file can be opened (the server only lets its owner see it)
export const getAttachmentUrl = (id) => `${API_URL}/api/chats/attachments/${id}`