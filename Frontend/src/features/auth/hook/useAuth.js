import { useDispatch } from "react-redux";
import { resetChat } from "../../chat/chat.slice";
import { disconnectSocket } from "../../chat/service/chat.socket";
import { getMe, login, register, logout } from "../service/auth.api";
import { setError, setLoading, setUser } from "../auth.slice";

// handle the error issue part so that the error can be displayed on the page

export function useAuth(){

    const dispatch = useDispatch();
    

    async function handleRegister({username, email, password}){
        try {
            dispatch(setLoading(true))
            const data = await register({username, email, password})
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration failed"))
        }finally{
            dispatch(setLoading(false))
        }
    }


    async function handleLogin({email, password}){
        try {
            dispatch(setLoading(true));
            const data = await login({email, password});
            dispatch(setUser(data.user))
        } catch (error) {
            console.log(error)
            dispatch(setError(error.response?.data?.message || "Login Failed"))
        }finally{
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe(){
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to fetch user data"))
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


    function clearError() {
        dispatch(setError(null))
    }

    return {
        handleLogin,
        handleRegister,
        handleGetMe,
        handleLogout,
        clearError
    }
}