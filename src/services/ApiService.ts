import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { showNotificationMessage } from '@/utils/Helper'
import BaseService from './BaseService'

const ApiService = {
    fetchData<Response = unknown, Request = Record<string, unknown>>(
        param: AxiosRequestConfig<Request>,
    ) {
        return new Promise<AxiosResponse<Response>>((resolve, reject) => {
            BaseService(param)
                .then((response: AxiosResponse<Response>) => {
                    resolve(response)
                })
                .catch((errors: AxiosError) => {
                    // set error message
                    const errorMessageInResponse =
                        errors?.response?.data?.msg ??
                        errors?.response?.data?.message ??
                        ''
                    const errorInValidation =
                        errors?.response?.data?.errors?.[0] ?? ''

                    const errorMessage = errorInValidation
                        ? errorInValidation
                        : errorMessageInResponse
                          ? errorMessageInResponse
                          : errors?.message
                            ? errors?.message
                            : 'Something Went Wrong'

                    // show failure alert
                    showNotificationMessage('Failure', errorMessage, 'danger')

                    // reject
                    console.log(`errors`, errors)
                    reject(errors)
                })
        })
    },
}

export default ApiService
