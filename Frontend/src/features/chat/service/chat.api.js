import axiosInstance from "../../../lib/AxiosInstance"

export const sendMessage = async ({ message, chatId }) => {
    const response = await axiosInstance.post("/chats/message", { message, chatId })
    return response.data
}

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