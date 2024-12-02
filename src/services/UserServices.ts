import { ApiResponse } from '@/@types/apiResponse'
import ApiService from './ApiService'


export function deleteUser() {
    return '/admin/delete-store-item'
}

export function listUsers() {
    return '/adminUser/get-all-users'
}

export async function getUserById() {
    return 'api/users/664b10fd9e5d353556266a69'
}

export async function toggleBan(data:object){
    return ApiService.fetchData<ApiResponse<any>>({
        url:"/admin/toggle-user-ban",
        method:"post",
        
    })
}


