import { toast } from '@/components/ui'
import { TypeAttributes } from '@/components/ui/@types/common'
import Notification from '@/components/ui/Notification'

export function showNotificationMessage(
    title: string,
    message: string,
    notificationType: TypeAttributes.Status = 'success',
    duration: number = 2500,
) {
    toast.push(
        <Notification title={title} type={notificationType} duration={duration}>
            {message}
        </Notification>,
        {
            placement: 'top-center',
        },
    )
}
