import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";

export async function PushNostifcation(data:any) {

    return ApiService.fetchData<ApiResponse<any>>({
        url:"/notification/sendPushNotification",
        method:"post",
        data
    })
    
}