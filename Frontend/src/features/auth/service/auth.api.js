import axiosInstance from "../../../lib/AxiosInstance";

export async function register({username, email, password }){
    const response = await axiosInstance.post("/auth/register", {username, email, password});
    return response.data;
}

export async function login({email, password}){
    const response = await axiosInstance.post('/auth/login', {email, password});
    return response.data;
}

export async function logout(){
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
}

export async function getMe(){
    const response = await axiosInstance.get("/auth/get-me")
    return response.data
}