import { HiOutlineSearch, HiPlusCircle } from "react-icons/hi";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import { Link } from "react-router-dom";
import { ChangeEvent } from "react";

type HeaderContentProps = {
  text: string;
  addButtonText?: string;
  addLink?: string;
  showSearch?: boolean;
  onEditSearch?: (e: ChangeEvent<HTMLInputElement>) => void;
  dropDownOptions?: { value: string; label: string }[];
  dropDownSelectedValue?: string;
  onChangeDropDown?: (item: string) => void;
};

const allOption = { value: "", label: "All" };

const HeaderContent = (props: HeaderContentProps) => {
  const {
    text,
    addButtonText,
    addLink,
    showSearch = false,
    onEditSearch,
    dropDownOptions,
    dropDownSelectedValue,
    onChangeDropDown,
    isLeaderBorad = false,
  } = props;

  return (
    <div className="lg:flex items-center justify-between mb-4">
      <h3 className="mb-4 lg:mb-0">{text}</h3>
      <div className="flex flex-col lg:flex-row lg:items-center space-x-3">
        {showSearch ? (
          <Input
            className="max-w-md md:w-52 md:mb-0 mb-4"
            size="sm"
            placeholder="Search"
            prefix={<HiOutlineSearch className="text-lg" />}
            onChange={onEditSearch}
          />
        ) : null}
        {dropDownOptions ? (
          <Select
            size="sm"
            options={
              isLeaderBorad
                ? [...dropDownOptions]
                : [allOption, ...dropDownOptions]
            }
            value={
              dropDownSelectedValue == ""
                ? allOption
                : dropDownOptions.find(
                    (item) => item.value == dropDownSelectedValue
                  )
            }
            onChange={(item) => {
              console.log(item);

              onChangeDropDown!(item?.value ?? "");
            }}
          ></Select>
        ) : null}

        {addButtonText && addLink && (
          <Link className="block lg:inline-block md:mb-0 mb-4" to={addLink}>
            <Button block variant="solid" size="sm" icon={<HiPlusCircle />}>
              {addButtonText}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default HeaderContent;
