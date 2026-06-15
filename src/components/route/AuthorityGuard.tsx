import { PropsWithChildren, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthority from '@/utils/hooks/useAuthority'

type AuthorityGuardProps = PropsWithChildren<{
    userAuthority?: string[]
    authority?: string[]
}>

const AuthorityGuard = (props: AuthorityGuardProps) => {
    const { userAuthority = [], authority = [], children } = props
    const navigate = useNavigate()

    const roleMatched = useAuthority(userAuthority, authority)

    useEffect(() => {
        if (roleMatched) return

        const canGoBack = Number(window.history.state?.idx || 0) > 0

        if (canGoBack) {
            navigate(-1)
            return
        }

        navigate('/inventrylist', { replace: true })
    }, [navigate, roleMatched])

    return <>{roleMatched ? children : null}</>
}

export default AuthorityGuard
