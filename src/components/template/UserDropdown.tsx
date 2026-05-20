import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";
import withHeaderItem from "@/utils/hoc/withHeaderItem";
import useAuth from "@/utils/hooks/useAuth";
import classNames from "classnames";
import { HiOutlineLogout, HiOutlineUser } from "react-icons/hi";
import type { CommonProps } from "@/@types/common";
import { useAppSelector } from "@/store";

const _UserDropdown = ({ className }: CommonProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const displayName = user?.userName || user?.email || "User";

  const { signOut } = useAuth();

  const UserAvatar = (
    <div className={classNames(className, "flex items-center gap-2")}>
      <Avatar size={32} shape="circle" icon={<HiOutlineUser />} />
      <div className="hidden md:block text-left">
        <div className="font-semibold capitalize leading-4">{displayName}</div>
        {user?.email && (
          <div className="hidden lg:block text-xs text-gray-500 leading-4">
            {user.email}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <Dropdown
        menuStyle={{ minWidth: 240 }}
        renderTitle={UserAvatar}
        placement="bottom-end"
      >
        <Dropdown.Item variant="header">
          <div className="py-2 px-3 flex items-center gap-2">
            <Avatar shape="circle" icon={<HiOutlineUser />} />
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100">
                {displayName}
              </div>
              {user?.email && <div className="text-xs">{user.email}</div>}
            </div>
          </div>
        </Dropdown.Item>
        <Dropdown.Item variant="divider" />
        <Dropdown.Item eventKey="Sign Out" className="gap-2" onClick={signOut}>
          <span className="text-xl opacity-50">
            <HiOutlineLogout />
          </span>
          <span>Sign Out</span>
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};

const UserDropdown = withHeaderItem(_UserDropdown);

export default UserDropdown;
