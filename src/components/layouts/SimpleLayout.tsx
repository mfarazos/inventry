import Header from '@/components/template/Header'
import UserDropdown from '@/components/template/UserDropdown'
import HeaderLogo from '@/components/template/HeaderLogo'
import MobileNav from '@/components/template/MobileNav'
import HorizontalNav from '@/components/template/HorizontalNav'
import View from '@/views'
import { useNavigate } from 'react-router-dom'
import { HiArrowLeft } from 'react-icons/hi'

const HeaderActionsStart = () => {
    const navigate = useNavigate()

    return (
        <>
            <HeaderLogo />
            <MobileNav />
            <button
                type="button"
                className="header-action-item header-action-item-hoverable text-2xl"
                aria-label="Go back"
                onClick={() => navigate(-1)}
            >
                <HiArrowLeft />
            </button>
        </>
    )
}

const HeaderActionsEnd = () => {
    return (
        <>
            <UserDropdown hoverable={false} />
        </>
    )
}

const SimpleLayout = () => {
    return (
        <div className="app-layout-simple flex flex-auto flex-col min-h-screen">
            <div className="flex flex-auto min-w-0">
                <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                    <Header
                        container
                        className="shadow dark:shadow-2xl"
                        headerStart={<HeaderActionsStart />}
                        headerMiddle={<HorizontalNav />}
                        headerEnd={<HeaderActionsEnd />}
                    />
                    <View pageContainerType="contained" />
                </div>
            </div>
        </div>
    )
}

export default SimpleLayout
