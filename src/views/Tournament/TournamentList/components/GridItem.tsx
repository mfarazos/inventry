import Card from "@/components/ui/Card";
import ItemDropdown from "./ItemDropdown";
import Members from "./Members";
import ProgressionBar from "./ProgressionBar";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// export type GridItemProps = {
//     data: {
//         id: number
//         name: string
//         category: string
//         desc: string
//         attachmentCount: number
//         totalTask: number
//         completedTask: number
//         progression: number
//         dayleft: number
//         status: string
//         member: {
//             name: string
//             img: string
//         }[]
//     }
// }
export type GridItemProps = {
  data: {
    _id: string;
    name: number;
    description: string;
    winnerPrize: Array<number>;
    registeredUsers: Array<object>;
    entryChips: number;
    image: string;
    registrationStartDate: number;
    isDelete: number;
    registrationEndDate: number;
    tournamentStartDate: number;
    tournamentEndDate: number;
    maxUserInTournament: number;
    minUserInTournament: number;
    progression: number;
  };
  onDelete: (id: number) => void; // Add this prop
  onEdit: (id: number) => void; // Add this prop
  key: number;
};

const GridItem = ({ data, onDelete, onEdit }: GridItemProps) => {
  const {
    _id,
    name,
    description,
    winnerPrize,
    entryChips,
    image,
    registrationStartDate,
    isDelete,
    registrationEndDate,
    tournamentStartDate,
    tournamentEndDate,
    maxUserInTournament,
    minUserInTournament,
    registeredUsers,
    progression,
  } = data;
  useEffect(() => {
    console.log("clubdata", data);
  }, []);
  console.log("ID IS HERE", _id);
  return (
    <Card bodyClass="h-full">
      <div className="flex flex-col justify-between h-full">
        <div className="flex justify-between">
          <Link to={`/tournamentDetails/${data._id}`}>
            <h6>{name}</h6>
          </Link>
          <ItemDropdown
            onDelete={() => onDelete(data._id)}
            onEdit={() => onEdit(data._id)}
          />
        </div>
        <p className="mt-4">{description}</p>
        <div className="mt-3">
          <ProgressionBar progression={registeredUsers?.length || 0} />
          <div className="flex items-center justify-between mt-2">
            {/* <Members members={clubUser} /> */}
            <div className="flex items-center rounded-full font-semibold text-xs">
              <div className="flex items-center px-2 py-1 border border-gray-300 rounded-full">
                {/* <HiOutlineClipboardCheck className="text-base" /> */}
                <span className="ml-1 rtl:mr-1 whitespace-nowrap">
                  Entry Chips : {entryChips}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GridItem;
