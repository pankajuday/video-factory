
import api from "./api"
import type { ILoginBody, LoginResponse, RegisterResponse, UserRegister } from "../Types";


const userLogin = async (data:ILoginBody): Promise<LoginResponse> =>{
    const response  = await api.post("/users/login",data);
    return response.data;

}

const userRegister = async (data: UserRegister): Promise<RegisterResponse> =>{
    const response = await api.post("/users/register",data);
    return response.data;
}

export {
    userLogin,

    userRegister
}