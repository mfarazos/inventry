import { ApiResponse } from '@/@types/apiResponse'
import ApiService from './ApiService'
import type { SignInCredential, SignInResponse } from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchData<SignInResponse>({
        url: '/adminAuth/sign-in',
        method: 'post',
        data,
    })
}

export async function apiSignOut() {
    return ApiService.fetchData({
        url: '/users/signout',
        method: 'post',
    })
}
export async function changePassword(data:any){
    return ApiService.fetchData<ApiResponse<any>>({
        url:"/auth/changePassword",
        method:"post",
        data
    })
}
