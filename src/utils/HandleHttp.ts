import DataHandle from "@/DataHandle"

const handleHttpReq = async (fn: () => void) => {
    try {
        DataHandle.getTopLoaderRef()?.show()
        console.log(   DataHandle.getTopLoaderRef());
        

        console.log('jeelellel')
        await new Promise((resolve) => setTimeout(resolve, 300))

        fn()
    } catch (error) {
        console.log(error)

        // show error message
        // showNotificationMessage(
        //     'settings',
        //     createSettingsRes.data?.message,
        // )
    } finally {
        DataHandle.getTopLoaderRef()?.hide()
    }
}
export { handleHttpReq }
