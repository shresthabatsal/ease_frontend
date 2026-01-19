import { LoginInput, RegisterInput } from "@/app/(auth)/schema"
import axios from "./axios";
import { API } from "./endpoints"


export const register = async (registerData: RegisterInput) => {
    try {
        const response = await axios.post(API.AUTH.REGISTER, registerData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Registration Failed.')
    }
}

export const login = async (loginData: LoginInput) => {
    try {
        const response = await axios.post(API.AUTH.LOGIN, loginData)
        return response.data
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message || error.message || 'Login Failed.')
    }
}