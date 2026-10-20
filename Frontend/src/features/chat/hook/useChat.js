import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessages,
    appendMessages,
    createNewChat,
    removeChat,
    removePendingMessage,
    resolvePendingMessage,
    setChats,
    setCurrentChatId,
    setError,
    setLoading,
    setThinking } from "../chat.slice";
import { deleteChat, getChats, getMessages, sendMessage } from "../service/chat.api";
import { initializeSocketConnection } from "../service/chat.socket";



const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback;

export const useChat = () => {
    const dispatch = useDispatch();


    const { chats, currentChatId, isLoading, isThinking, error } = useSelector((state) => state.chat);

    const chatItems = useMemo(
        () => Object.values(chats).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)),
        [chats]
    );
    const currentChat = currentChatId ? chats[currentChatId] : null;

     const handleSendMessage = useCallback(async (message) => {
        const isNewChat = !currentChatId;
        const previousChatId = currentChatId || `draft-${crypto.randomUUID()}`;
        const pendingMessageId = `pending-${crypto.randomUUID()}`;
        const userMessage = {
            id: pendingMessageId,
            content: message,
            role: "user",
        };

        if (isNewChat) {
            dispatch(createNewChat({
                chatId: previousChatId,
                title: "New chat",
                lastUpdated: new Date().toISOString(),
            }));
            dispatch(setCurrentChatId(previousChatId));
        }
        dispatch(appendMessages({
            chatId: previousChatId,
            messages: [userMessage],
        }));
        dispatch(setThinking(true));
        dispatch(setError(null));

        try {
            const data = await sendMessage({ message, chatId: isNewChat ? null : currentChatId });
            if (!data.chat?._id || !data.userMessage || !data.aiMessage) {
                throw new Error("The chat API returned an invalid message response.");
            }

            const chatId = data.chat._id;
            dispatch(resolvePendingMessage({
                previousChatId,
                chatId,
                title: data.chat.title || data.title || "New chat",
                lastUpdated: data.chat.updatedAt,
                pendingMessageId,
                userMessage: {
                    id: data.userMessage._id,
                    content: data.userMessage.content,
                    role: data.userMessage.role,
                },
                aiMessage: {
                    id: data.aiMessage._id,
                    content: data.aiMessage.content,
                    role: data.aiMessage.role,
                },
            }));
            dispatch(setCurrentChatId(chatId));
            return true;
        } catch (requestError) {
            dispatch(removePendingMessage({
                chatId: previousChatId,
                messageId: pendingMessageId,
                removeChat: isNewChat,
            }));
            dispatch(setError(getErrorMessage(requestError, "Failed to send your message.")));
            return false;
        } finally {
            dispatch(setThinking(false));
        }
    }, [currentChatId, dispatch]);

    const handleGetChats = useCallback(async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await getChats();
            if (!Array.isArray(data.chats)) {
                throw new Error("The chat API returned an invalid chat list.");
            }

            dispatch(setChats(data.chats.reduce((chatMap, chat) => {
                chatMap[chat._id] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    messagesLoaded: false,
                    lastUpdated: chat.updatedAt,
                };
                return chatMap;
            }, {})));
        } catch (requestError) {
            dispatch(setError(getErrorMessage(requestError, "Failed to load your chats.")));
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const handleOpenChat = useCallback(async (chatId) => {
        dispatch(setCurrentChatId(chatId));
        dispatch(setError(null));

        if (chats[chatId]?.messagesLoaded) return;

        dispatch(setLoading(true));
        try {
            const data = await getMessages(chatId);
            if (!Array.isArray(data.messages)) {
                throw new Error("The chat API returned an invalid message list.");
            }

            dispatch(addMessages({
                chatId,
                messages: data.messages.map((message) => ({
                    id: message._id,
                    content: message.content,
                    role: message.role,
                })),
            }));
        } catch (requestError) {
            dispatch(setError(getErrorMessage(requestError, "Failed to load this chat.")));
        } finally {
            dispatch(setLoading(false));
        }
    }, [chats, dispatch]);

    const handleDeleteChat = useCallback(async (chatId) => {
        dispatch(setError(null));
        try {
            await deleteChat(chatId);
            dispatch(removeChat(chatId));
        } catch (requestError) {
            dispatch(setError(getErrorMessage(requestError, "Failed to delete this chat.")));
        }
    }, [dispatch]);

    const handleNewChat = useCallback(() => {
        dispatch(setCurrentChatId(null));
        dispatch(setError(null));
    }, [dispatch]);

    return {
        threads: chatItems.length ? [{ category: "Recent chats", items: chatItems }] : [],
        activeThreadId: currentChatId,
        messages: currentChat?.messages || [],
        isLoading,
        isThinking,
        error,
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleSelectThread: handleOpenChat,
        handleNewThread: handleNewChat,
        handleDeleteChat,
    };
};
