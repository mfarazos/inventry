import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";

export async function getSpinSettings() {
    return ApiService.fetchData<ApiResponse<any>>({
        url:"/adminSpin/list-all-spin",
        method:"get"
    })
}
export async function updateSpinSettings(data:any) {
    return ApiService.fetchData<ApiResponse<any>>({
        url:"/adminSpin/editSpin",
        method:"put",
        data
    })
    
}