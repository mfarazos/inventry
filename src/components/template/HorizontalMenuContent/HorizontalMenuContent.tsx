import navigationConfig from '@/configs/navigation.config'
import Dropdown from '@/components/ui/Dropdown'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import HorizontalMenuItem from './HorizontalMenuItem'
import HorizontalMenuDropdownItem from './HorizontalMenuDropdownItem'
import { useAppSelector } from '@/store'
import { useLocation } from 'react-router-dom'
import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_COLLAPSE,
    NAV_ITEM_TYPE_ITEM,
} from '@/constants/navigation.constant'
import { useTranslation } from 'react-i18next'
import type { NavMode } from '@/@types/theme'

type HorizontalMenuContentProps = {
    manuVariant: NavMode
    userAuthority?: string[]
}

const HorizontalMenuContent = ({
    manuVariant,
    userAuthority = [],
}: HorizontalMenuContentProps) => {
    const { t } = useTranslation()
    const location = useLocation()
    const currentRouteKey = useAppSelector(
        (state) => state.base.common.currentRouteKey
    )

    const relatedActivePaths: Record<string, string[]> = {
        billing: ['/billing', '/showbilling'],
        inventrylist: ['/inventrylist', '/createDanarecipt'],
        'create-sales-payment': ['/create-sales-payment'],
        'ledger-summary': ['/ledger-summary'],
        extrudingAccount: ['/extrudingAccount'],
    }

    const isNavActive = (nav: { key: string; path: string }) => {
        const relatedPaths = relatedActivePaths[nav.key] || []

        return (
            currentRouteKey === nav.key ||
            location.pathname === nav.path ||
            relatedPaths.includes(location.pathname)
        )
    }

    return (
        <span className="flex items-center">
            {navigationConfig.map((nav) => {
                if (
                    nav.type === NAV_ITEM_TYPE_TITLE ||
                    nav.type === NAV_ITEM_TYPE_COLLAPSE
                ) {
                    return (
                        <AuthorityCheck
                            key={nav.key}
                            authority={nav.authority}
                            userAuthority={userAuthority}
                        >
                            <Dropdown
                                trigger="hover"
                                renderTitle={
                                    <HorizontalMenuItem
                                        manuVariant={manuVariant}
                                        nav={nav}
                                        isActive={isNavActive(nav)}
                                    />
                                }
                            >
                                {nav.subMenu.map((secondarySubNav) => (
                                    <AuthorityCheck
                                        key={secondarySubNav.key}
                                        authority={secondarySubNav.authority}
                                        userAuthority={userAuthority}
                                    >
                                        {secondarySubNav.subMenu.length > 0 ? (
                                            <Dropdown.Menu
                                                title={t(
                                                    secondarySubNav.translateKey,
                                                    secondarySubNav.title
                                                )}
                                            >
                                                {secondarySubNav.subMenu.map(
                                                    (tertiarySubNav) => (
                                                        <AuthorityCheck
                                                            key={
                                                                tertiarySubNav.key
                                                            }
                                                            authority={
                                                                tertiarySubNav.authority
                                                            }
                                                            userAuthority={
                                                                userAuthority
                                                            }
                                                        >
                                                            <HorizontalMenuDropdownItem
                                                                nav={
                                                                    tertiarySubNav
                                                                }
                                                            />
                                                        </AuthorityCheck>
                                                    )
                                                )}
                                            </Dropdown.Menu>
                                        ) : (
                                            <HorizontalMenuDropdownItem
                                                key={secondarySubNav.key}
                                                nav={secondarySubNav}
                                            />
                                        )}
                                    </AuthorityCheck>
                                ))}
                            </Dropdown>
                        </AuthorityCheck>
                    )
                }
                if (nav.type === NAV_ITEM_TYPE_ITEM) {
                    return (
                        <AuthorityCheck
                            key={nav.key}
                            authority={nav.authority}
                            userAuthority={userAuthority}
                        >
                            <HorizontalMenuItem
                                isLink
                                nav={nav}
                                manuVariant={manuVariant}
                                isActive={isNavActive(nav)}
                            />
                        </AuthorityCheck>
                    )
                }
                return <></>
            })}
        </span>
    )
}

export default HorizontalMenuContent
