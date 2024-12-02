import Dropdown from "@/components/ui/Dropdown";
import {
  HiOutlineSwitchHorizontal,
  HiOutlineFlag,
  HiOutlineCog,
  HiOutlineTrash,
} from "react-icons/hi";
import EllipsisButton from "@/components/shared/EllipsisButton";

const dropdownList = [
  { label: "Delete", value: "delete", icon: <HiOutlineTrash /> },
  //   { label: "Move", value: "move", icon: <HiOutlineSwitchHorizontal /> },
  //   { label: "Setting", value: "projectSetting", icon: <HiOutlineCog /> },
];

type ItemDropdownProps = {
  onDelete: () => void;
};

const ItemDropdown = ({ onDelete }: ItemDropdownProps) => {
  return (
    <Dropdown placement="bottom-end" renderTitle={<EllipsisButton />}>
      {dropdownList.map((item) => (
        <Dropdown.Item
          key={item.value}
          eventKey={item.value}
          onClick={() => {
            if (item.value === "delete") {
              onDelete();
            }
          }}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="ml-2 rtl:mr-2">{item.label}</span>
        </Dropdown.Item>
      ))}
    </Dropdown>
  );
};

export default ItemDropdown;
