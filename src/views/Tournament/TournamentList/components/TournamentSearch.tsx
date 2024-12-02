import { useRef } from "react";
import Input from "@/components/ui/Input";
import { HiOutlineSearch } from "react-icons/hi";

import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import type { TableQueries } from "@/@types/common";
import type { ChangeEvent } from "react";

interface TournamentSearchProps {
  onSearch: (query: string) => void;
}

const TournamentSearch = ({ onSearch }: TournamentSearchProps) => {
  const searchInput = useRef<HTMLInputElement>(null);

  const debounceFn = debounce((val: string) => {
    onSearch(val);
  }, 500);

  const onEdit = (e: ChangeEvent<HTMLInputElement>) => {
    debounceFn(e.target.value);
  };
  return (
    <Input
      ref={searchInput}
      className="max-w-md md:w-52 md:mb-0 mb-4"
      size="sm"
      placeholder="Search product"
      prefix={<HiOutlineSearch className="text-lg" />}
      onChange={onEdit}
    />
  );
};

export default TournamentSearch;
