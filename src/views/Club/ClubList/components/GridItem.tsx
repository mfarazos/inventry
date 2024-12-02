import Card from "@/components/ui/Card";
import ItemDropdown from "./ItemDropdown";
import Members from "./Members";
import ProgressionBar from "./ProgressionBar";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useEffect } from "react";

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
    clubName: number;
    clubDescription: string;
    clubCode: string;
    clubUser: {
      userCode: string;
      userId: string;
      userName: string;
      role: string;
      isStatus: boolean;
      isOwnerN: boolean;
      isManagerN: boolean;
      isMemberN: boolean;
    }[];
    tooltip: number;
    image: string;
    maxPlayer: number;
    isDelete: number;
    announcement: number;
    totalUsers: number;
    gameHoistingPermission: {
      OWNER: string;
      MANAGER: string;
      MEMBER: string;
    }[];
    progression: number;
  };
  onDelete: (id: number) => void; // Add this prop
  key: number;
};

const GridItem = ({ data, onDelete }: GridItemProps) => {
  const {
    _id,
    clubName,
    clubDescription,
    clubCode,
    clubUser,
    image,
    maxPlayer,
    isDelete,
    gameHoistingPermission,
    progression,
    totalUsers,
  } = data;

  useEffect(() => {
    console.log("clubdata", data);
  }, []);

  return (
    <Card bodyClass="h-full bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
  <div className="flex flex-col justify-between h-full">
    <div className="flex justify-between items-center">
      <Link to={`/clubDetails/${_id}`} className="text-lg font-bold text-blue-600 hover:underline">
        {clubName}
      </Link>
      {/* Add an icon or dropdown here if needed */}
      {/* <ItemDropdown /> */}
    </div>
    <p className="mt-2 text-gray-600 text-sm">{clubDescription}</p>
    <div className="mt-4">
      <ProgressionBar progression={clubUser?.length || 0}  className="h-2 bg-gray-200 rounded-full">
        <div className="bg-green-500 h-full rounded-full" style={{ width: `${(clubUser?.length || 0)}%` }}></div>
      </ProgressionBar>
      <div className="flex items-center justify-between mt-2">
        {/* <Members members={clubUser} /> */}
        <div className="flex items-center rounded-full font-semibold text-xs bg-blue-100 text-blue-800 px-3 py-1">
          {/* <HiOutlineClipboardCheck className="text-base" /> */}
          <span className="ml-1 rtl:mr-1 whitespace-nowrap">
            Total Users: {clubUser?.length || 0}
          </span>
        </div>
      </div>
    </div>
  </div>
</Card>

  );
};

export default GridItem;
