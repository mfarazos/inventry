import ApiService from './ApiService'

export async function apiGetSalesDashboardData<
    T extends Record<string, unknown>
>() {
     return ApiService.fetchData<T>({
        url: 'adminDashboard/admin-Dashboard-Data',
        method: 'get',
        
    }) 
}
//     {
//         statisticData: {
//             revenue: {
//                 value: 21827.13
                
//             },
//             orders: {
//                 value: 1758
                
//             },
//             purchases: {
//                 value: 7249.31
//             },
//         },
//         salesReportData: {
//             series: [
                
//                 {
//                     name: 'Sales',
//                     data: [20, 26, 23, 24, 22, 29, 27, 36, 32, 35, 32, 38],
//                 },
//             ],
//             categories: [
//                 '01 Jan',
//                 '02 Jan',
//                 '03 Jan',
//                 '04 Jan',
//                 '05 Jan',
//                 '06 Jan',
//                 '07 Jan',
//                 '08 Jan',
//                 '09 Jan',
//                 '10 Jan',
//                 '11 Jan',
//                 '12 Jan',
//             ],
//         },
//         salesByCategoriesData: {
//             labels: ['Cards', 'Tables'],
//             data: [351, 246],
//         },
//     }
// }

export async function apiGetSalesProducts<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/sales/products',
        method: 'post',
        data,
    })
}

export async function apiDeleteSalesProducts<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/sales/products/delete',
        method: 'delete',
        data,
    })
}

export async function apiGetSalesProduct<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: '/sales/product',
        method: 'get',
        params,
    })
}

export async function apiPutSalesProduct<T, U extends Record<string, unknown>>(
    data: U
) {
    return ApiService.fetchData<T>({
        url: '/sales/products/update',
        method: 'put',
        data,
    })
}

export async function apiCreateSalesProduct<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/sales/products/create',
        method: 'post',
        data,
    })
}

export async function apiGetSalesOrders<T, U extends Record<string, unknown>>(
    params: U
) {
    return ApiService.fetchData<T>({
        url: '/sales/orders',
        method: 'get',
        params,
    })
}

export async function apiDeleteSalesOrders<
    T,
    U extends Record<string, unknown>
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/sales/orders/delete',
        method: 'delete',
        data,
    })
}

export async function apiGetSalesOrderDetails<
    T,
    U extends Record<string, unknown>
>(params: U) {
    return ApiService.fetchData<T>({
        url: '/sales/orders-details',
        method: 'get',
        params,
    })
}
