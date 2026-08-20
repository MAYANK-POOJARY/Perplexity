import { useDispatch } from "react-redux";
import { getMe, login, register } from "../service/auth.api";
import { setError, setLoading, setUser } from "../auth.slice";


export function useAuth(){

    const dispatch = useDispatch()

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

    return{
        handleLogin,
        handleRegister,
        handleGetMe
    }
}