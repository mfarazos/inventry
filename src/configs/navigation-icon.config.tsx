import {
    HiOutlineColorSwatch,
    HiOutlineDesktopComputer,
    HiOutlineTemplate,
    HiOutlineViewGridAdd,
    HiOutlineHome,
    HiUser,
} from 'react-icons/hi'
import {
    
    MdCircleNotifications,
    MdLeaderboard,
    MdOutlineDashboard,
    MdPayment,
    MdReport,
    MdSettingsSuggest,
    MdStore,
    MdSupport
} from "react-icons/md"
import{LiaProductHunt} from "react-icons/lia"

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    singleMenu: <HiOutlineViewGridAdd />,
    collapseMenu: <HiOutlineTemplate />,
    groupSingleMenu: <HiOutlineDesktopComputer />,
    groupCollapseMenu: <HiOutlineColorSwatch />,
    dashboard:<MdOutlineDashboard/>,
    items:<MdStore/>,
    report:<MdReport/>,
    notification:<MdCircleNotifications/>,
    leaderboard:<MdLeaderboard/>,
    user:<HiUser/>,
    settings:<MdSettingsSuggest/>,
    payemnt:<MdPayment/>,
}

export default navigationIcon
