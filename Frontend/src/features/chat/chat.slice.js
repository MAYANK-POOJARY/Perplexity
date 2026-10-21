import { createSlice } from '@reduxjs/toolkit';


const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        isThinking: false,
        isStreaming: false,
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

        // new 
        setStreaming: (state, action) => {
            state.isStreaming = action.payload
        },
        // a new piece of the answer arrived: glue it to the message that is still streaming
        appendToken: (state, action) => {
            const { chatId, token } = action.payload
            const target = state.chats[chatId]?.messages.findLast((m) => m.isStreaming)
            if (target) target.content += token
        },
        // answer finished: stop the cursor and use the final saved text
        finishStreaming: (state, action) => {
            const { chatId, content } = action.payload
            const target = state.chats[chatId]?.messages.findLast((m) => m.isStreaming)
            if (!target) return
            target.content = content
            target.isStreaming = false
        },
        // something broke: keep the partial answer, or remove the empty bubble
        failStreaming: (state, action) => {
            const chat = state.chats[action.payload.chatId]
            if (!chat) return
            const index = chat.messages.findLastIndex((m) => m.isStreaming)
            if (index === -1) return
            if (chat.messages[index].content) {
                chat.messages[index].isStreaming = false
            } else {
                chat.messages.splice(index, 1)
            }
        },
        // the generated title arrived
        updateChatTitle: (state, action) => {
            const { chatId, title } = action.payload
            if (state.chats[chatId]) state.chats[chatId].title = title
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

    setStreaming,          // <-- new
    appendToken,           // <-- new
    finishStreaming,       // <-- new
    failStreaming,         // <-- new
    updateChatTitle, 
} = chatSlice.actions
export default chatSlice.reducer