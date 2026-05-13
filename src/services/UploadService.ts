import { ApiResponse } from '@/@types/apiResponse'
import ApiService from './ApiService'
import { UploadImage } from '@/@types/upload'

export async function uploadImage(data: any) {
    return ApiService.fetchData<ApiResponse<UploadImage>>({
        url: '/upload/image',
        method: 'post',
        data,
    })
}
