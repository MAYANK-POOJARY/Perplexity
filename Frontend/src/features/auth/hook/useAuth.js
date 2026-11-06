import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { resetChat } from "../../chat/chat.slice";
import { disconnectSocket } from "../../chat/service/chat.socket";
import { getMe, login, register, logout } from "../service/auth.api";
import { setError, setLoading, setUser } from "../auth.slice";

// Turns a failed request into text for the page.
//  - the server answered with a message  -> show that message
//  - the server never answered (offline, wrong URL, server down) -> say so
function getErrorText(error, fallback) {
    if (error.response) return error.response.data?.message || fallback;
    return "Cannot reach the server. Please check your connection and try again.";
}

export function useAuth(){

    const dispatch = useDispatch();

    // handleRegister / handleLogin return true or false, so the PAGE can decide what to do next
    // (show a message, stay on the form, ...) instead of always moving to another page.
    async function handleRegister({username, email, password}){
        dispatch(setError(null))
        try {
            dispatch(setLoading(true))
            await register({username, email, password})
            return true
        } catch (error) {
            dispatch(setError(getErrorText(error, "Registration failed")))
            return false
        }finally{
            dispatch(setLoading(false))
        }
    }


    async function handleLogin({email, password}){
        dispatch(setError(null))
        try {
            dispatch(setLoading(true));
            const data = await login({email, password});
            dispatch(setUser(data.user))
            return true
        } catch (error) {
            dispatch(setError(getErrorText(error, "Login Failed")))
            return false
        }finally{
            dispatch(setLoading(false))
        }
    }

    // Runs on every page load to find out "is someone already logged in?".
    // Being logged out (401) is a NORMAL answer here, not an error to show on the login page.
    async function handleGetMe(){
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user))
        } catch {
            dispatch(setUser(null))
        }finally{
            dispatch(setLoading(false))
        }
    }


    async function handleLogout() {
        try {
            await logout()
        } catch (error) {
            console.error("Logout request failed", error)
        } finally {
            // the socket remembers who logged in, so close it. The next login opens a fresh one.
            disconnectSocket()
            dispatch(resetChat())
            dispatch(setUser(null));
        }
    }


    // useCallback keeps the SAME function between renders, so it is safe inside a useEffect dependency list
    const clearError = useCallback(() => {
        dispatch(setError(null))
    }, [dispatch])

    return {
        handleLogin,
        handleRegister,
        handleGetMe,
        handleLogout,
        clearError
    }
}