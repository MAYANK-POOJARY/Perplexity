import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        isThinking: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title, lastUpdated } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: lastUpdated || new Date().toISOString(),
                messagesLoaded: false,
            }
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            if (state.chats[ chatId ]) {
                state.chats[ chatId ].messages = messages
                state.chats[ chatId ].messagesLoaded = true
            }
        },
        appendMessages: (state, action) => {
            const { chatId, messages } = action.payload
            if (state.chats[ chatId ]) {
                state.chats[ chatId ].messages.push(...messages)
                state.chats[ chatId ].messagesLoaded = true
            }
        },
        resolvePendingMessage: (state, action) => {
            const {
                previousChatId,
                chatId,
                title,
                lastUpdated,
                pendingMessageId,
                userMessage,
                aiMessage,
            } = action.payload
            const chat = state.chats[previousChatId] || {
                id: chatId,
                title,
                messages: [],
                messagesLoaded: true,
                lastUpdated,
            }

            if (previousChatId !== chatId) {
                delete state.chats[previousChatId]
            }

            chat.id = chatId
            chat.title = title
            chat.lastUpdated = lastUpdated || chat.lastUpdated
            chat.messagesLoaded = true
            const pendingIndex = chat.messages.findIndex((message) => message.id === pendingMessageId)
            if (pendingIndex >= 0) {
                chat.messages[pendingIndex] = userMessage
            } else {
                chat.messages.push(userMessage)
            }
            chat.messages.push(aiMessage)
            state.chats[chatId] = chat

            if (state.currentChatId === previousChatId) {
                state.currentChatId = chatId
            }
        },
        removePendingMessage: (state, action) => {
            const { chatId, messageId, removeChat } = action.payload
            if (removeChat) {
                delete state.chats[chatId]
                if (state.currentChatId === chatId) {
                    state.currentChatId = null
                }
                return
            }

            const chat = state.chats[chatId]
            if (chat) {
                chat.messages = chat.messages.filter((message) => message.id !== messageId)
            }
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        removeChat: (state, action) => {
            delete state.chats[action.payload]
            if (state.currentChatId === action.payload) {
                state.currentChatId = null
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setThinking: (state, action) => {
            state.isThinking = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setThinking,
    setError,
    createNewChat,
    addMessages,
    appendMessages,
    resolvePendingMessage,
    removePendingMessage,
    removeChat,
} = chatSlice.actions
export default chatSlice.reducer