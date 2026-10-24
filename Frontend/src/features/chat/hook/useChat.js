import { useCallback, useEffect, useMemo, useRef } from "react";
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
    setThinking,
    setStreaming,
    appendToken,
    finishStreaming,
    failStreaming,
    updateChatTitle,
    setSources,
    startRegeneration  } from "../chat.slice";
import { deleteChat, getChats, getMessages } from "../service/chat.api";
import { getSocket, initializeSocketConnection } from "../service/chat.socket";



const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.message || fallback;

export const useChat = () => {

    const dispatch = useDispatch();

    const { chats, currentChatId, isLoading, isThinking, isStreaming, error } = useSelector((state) => state.chat);

    // remembers each message that is in flight: tempId -> its details
    const pendingRef = useRef({});

    const chatItems = useMemo(
        () => Object.values(chats).sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)),
        [chats]
    );
    
    const currentChat = currentChatId ? chats[currentChatId] : null;

        // ---- listen to everything the server streams back (registered once) ----
    useEffect(() => {
        const socket = initializeSocketConnection();

        // Tokens arrive many times per second. Re-drawing the answer for every single one is wasteful,
        // so they wait here and are sent to Redux together, at most every 50 ms (20 times per second).
        const FLUSH_EVERY_MS = 50;
        let waiting = {};      // chatId -> text that arrived but is not on screen yet
        let timer = null;

        const flushTokens = () => {
            if (timer !== null) {
                clearTimeout(timer);
                timer = null;
            }
            const batch = waiting;
            waiting = {};

            for (const chatId in batch) {
                dispatch(appendToken({ chatId, token: batch[chatId] }));
            }
            dispatch(setThinking(false));   // the first words are on screen: hide the bouncing dots
        };

        const finish = () => {
            dispatch(setThinking(false));
            dispatch(setStreaming(false));
        };

        // undo a failed message and show the error
        const abandon = (tempId, text) => {
            const pending = pendingRef.current[tempId];
            if (!pending) return;

            flushTokens();   // whatever was already written must be on screen before we decide what to keep

            if (pending.created) {
                dispatch(failStreaming({ chatId: pending.chatId }));
            } else {
                dispatch(removePendingMessage({
                    chatId: pending.previousChatId,
                    messageId: pending.pendingMessageId,
                    removeChat: pending.isNewChat,
                }));
            }
            delete pendingRef.current[tempId];
            dispatch(setError(text));
            finish();
        };

        // server saved our message: swap temporary ids for real ones and add an empty AI bubble
        const onCreated = ({ tempId, chat, userMessage }) => {
            const pending = pendingRef.current[tempId];
            if (!pending) return;

            pending.created = true;
            pending.chatId = chat._id;

            dispatch(resolvePendingMessage({
                previousChatId: pending.previousChatId,
                chatId: chat._id,
                title: chat.title || "New chat",
                lastUpdated: chat.updatedAt,
                pendingMessageId: pending.pendingMessageId,
                userMessage: {
                    id: userMessage._id,
                    content: userMessage.content,
                    role: userMessage.role,
                    attachments: userMessage.attachments,
                },
                aiMessage: {
                    id: `streaming-${tempId}`,
                    content: "",
                    role: "ai",
                    isStreaming: true,
                },
            }));
            dispatch(setCurrentChatId(chat._id));
        };

        // one small piece of the answer: park it, and make sure a flush is coming soon
        const onToken = ({ chatId, token }) => {
            waiting[chatId] = (waiting[chatId] ?? "") + token;
            if (timer === null) timer = setTimeout(flushTokens, FLUSH_EVERY_MS);
        };

        const onDone = ({ tempId, chatId, aiMessage }) => {
            flushTokens();
            dispatch(finishStreaming({ chatId, content: aiMessage.content }));
            delete pendingRef.current[tempId];
            finish();
        };

        const onTitle = ({ chatId, title }) => dispatch(updateChatTitle({ chatId, title }));

        const onSources = ({ chatId, sources }) => dispatch(setSources({ chatId, sources }));

        // the user pressed Stop: keep the partial answer (or remove the empty bubble) and unlock the input
        const onStopped = ({ tempId }) => {
            flushTokens();
            const pending = pendingRef.current[tempId];
            if (!pending) return;
            if (pending.created) dispatch(failStreaming({ chatId: pending.chatId }));
            delete pendingRef.current[tempId];
            finish();
        };

        const onError = ({ tempId, message }) => abandon(tempId, message || "Something went wrong.");

        const onDisconnect = () => {
            Object.keys(pendingRef.current).forEach((tempId) =>
                abandon(tempId, "Connection lost. Please try again."));
        };

        socket.on("chat:created", onCreated);
        socket.on("chat:token", onToken);
        socket.on("chat:done", onDone);
        socket.on("chat:title", onTitle);
        socket.on("chat:sources", onSources);
        socket.on("chat:stopped", onStopped);
        socket.on("chat:error", onError);
        socket.on("disconnect", onDisconnect);

        // cleanup: remove our listeners so they never get registered twice, and drop anything still waiting
        return () => {
            clearTimeout(timer);
            waiting = {};
            socket.off("chat:created", onCreated);
            socket.off("chat:token", onToken);
            socket.off("chat:done", onDone);
            socket.off("chat:title", onTitle);
            socket.off("chat:sources", onSources);
            socket.off("chat:stopped", onStopped);
            socket.off("chat:error", onError);
            socket.off("disconnect", onDisconnect);
        };
    }, [dispatch]);

    // ---- sending: just emit the message; the answer comes back through the listeners above ----
    const handleSendMessage = useCallback((message, attachments = []) => {
        const socket = getSocket();
        if (!socket?.connected) {
            dispatch(setError("Not connected to the server. Please refresh the page and try again."));
            return false;
        }

        const isNewChat = !currentChatId;
        const previousChatId = currentChatId || `draft-${crypto.randomUUID()}`;
        const pendingMessageId = `pending-${crypto.randomUUID()}`;
        const tempId = crypto.randomUUID();

        pendingRef.current[tempId] = { previousChatId, pendingMessageId, isNewChat, created: false, chatId: null };

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
            messages: [{ id: pendingMessageId, content: message, role: "user", attachments }],
        }));
        dispatch(setThinking(true));
        dispatch(setStreaming(true));
        dispatch(setError(null));

        socket.emit("chat:send", {
            message,
            chatId: isNewChat ? null : currentChatId,
            tempId,
            attachmentIds: attachments.map((attachment) => attachment.id),
        });
        return true;
    }, [currentChatId, dispatch]);

    const handleStopGeneration = useCallback(() => {
        getSocket()?.emit("chat:stop");
    }, []);

        const handleRegenerate = useCallback(() => {
        const socket = getSocket();
        if (!socket?.connected) {
            dispatch(setError("Not connected to the server. Please refresh the page and try again."));
            return;
        }
        if (!currentChatId || isStreaming) return;

        const tempId = crypto.randomUUID();
        // no "chat:created" event comes back for a regenerate, so mark it as already created
        pendingRef.current[tempId] = {
            previousChatId: currentChatId,
            pendingMessageId: null,
            isNewChat: false,
            created: true,
            chatId: currentChatId,
        };

        dispatch(startRegeneration({
            chatId: currentChatId,
            aiMessage: { id: `streaming-${tempId}`, content: "", role: "ai", isStreaming: true },
        }));
        dispatch(setThinking(true));
        dispatch(setStreaming(true));
        dispatch(setError(null));

        socket.emit("chat:send", { chatId: currentChatId, tempId, regenerate: true });
    }, [currentChatId, isStreaming, dispatch]);

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
                    sources: message.sources,
                    attachments: message.attachments,
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
        isStreaming,
        error,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleSelectThread: handleOpenChat,
        handleNewThread: handleNewChat,
        handleDeleteChat,
        handleStopGeneration,
        handleRegenerate
    };
};
