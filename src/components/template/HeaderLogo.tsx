import Logo from '@/components/template/Logo'
import { useAppSelector } from '@/store'

const HeaderLogo = () => {
    const mode = useAppSelector((state) => state.theme.mode)

    return (
        <Logo
            mode={mode}
            className="hidden md:block"
            logoWidth={120}
            imgClass="max-h-10 w-auto object-contain"
        />
    )
}

export default HeaderLogo
