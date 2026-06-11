import navigationIcon from '@/configs/navigation-icon.config'
import MenuItem from '@/components/ui/MenuItem'
import HorizontalMenuNavLink from './HorizontalMenuNavLink'
import { useTranslation } from 'react-i18next'
import type { NavMode } from '@/@types/theme'
import classNames from 'classnames'

export type HorizontalMenuItemProps = {
    nav: {
        key: string
        title: string
        translateKey: string
        icon: string
        path: string
        isExternalLink?: boolean
    }
    isLink?: boolean
    manuVariant: NavMode
    isActive?: boolean
}

const HorizontalMenuItem = ({
    nav,
    isLink,
    manuVariant,
    isActive,
}: HorizontalMenuItemProps) => {
    const { title, translateKey, icon, path, isExternalLink } = nav

    const { t } = useTranslation()

    const itemTitle = t(translateKey, title)

    const renderIcon = icon && <span className="text-2xl">{navigationIcon[icon]}</span>

    return (
        <>
            {path && isLink ? (
                <HorizontalMenuNavLink path={path} isExternalLink={isExternalLink}>
                    <MenuItem
                        variant={manuVariant}
                        isActive={isActive}
                        className={classNames(
                            isActive && 'inventory-horizontal-menu-active'
                        )}
                    >
                        <span className="flex items-center gap-2">
                            {renderIcon}
                            {itemTitle}
                        </span>
                    </MenuItem>
                </HorizontalMenuNavLink>
            ) : (
                <MenuItem
                    variant={manuVariant}
                    isActive={isActive}
                    className={classNames(
                        isActive && 'inventory-horizontal-menu-active'
                    )}
                >
                    {renderIcon}
                    <span>{itemTitle}</span>
                </MenuItem>
            )}
        </>
    )
}

export default HorizontalMenuItem
