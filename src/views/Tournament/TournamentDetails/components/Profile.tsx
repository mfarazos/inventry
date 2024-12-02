import { AdaptableCard } from "@/components/shared";
import { Avatar } from "@/components/ui";
import { HiOutlineUser } from "react-icons/hi";

export type ProfileFormModel = {
  data: {
    TournamentName: string;
    TournamentDescripton: string;
    entryChips: number;
    image: string;
    maxPlayer: number;
    totalUsers: number;
    registeredUsers: number;
    startingChips: number;
  };
};

const Profile = ({
  data = {
    TournamentName: "",
    TournamentDescripton: "",
    entryChips: 0,
    image: "",
    maxPlayer: 0,
    totalUsers: 0,
    registeredUsers: 0,
    startingChips: 0,
  },
}: ProfileFormModel) => {
  console.log("isme kia", data);

  return (
    <AdaptableCard
      style={{
        fontFamily: "monospace",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        color: "black",
      }}
      className="mx-8  sm:max-w-3xl body bg-slate-400"
    >
      <div className="sm:flex">
        <div
          style={{
            background: " linear-gradient(to top,  #390f29,#bb92f5)",
          }}
          className="left  sm:w-[30%]  sm:min-h-[30rem]   flex flex-col justify-evenly items-center sm:flex-wrap  bg-slate-950"
        >
          <Avatar
            src={
              data.image ||
              "https://dominoes-images-preprod.s3.ap-southeast-1.amazonaws.com/prcuxueo0yld8vz0ja1674483047542.jpg"
            }
            alt=""
            size={120}
            // className="h-28 w-40 sm:h-40 sm:w-40 rounded-full my-2"
          />
          <h2 className="mb-2 text-white">{data.TournamentName}</h2>

          <h2 className="mb-2 text-white">{data.TournamentDescripton}</h2>
          {/* 
          <div className="user-info">
            <p className="full-name mb-2">Full Name : {data.name}</p>
            <p className="user-name mb-2">Win Rate : {data?.Winrate?.toFixed(2)}</p>
            <p className="user-name mb-2">Email : {data.email}</p>
          </div> */}
        </div>

        <div className="right w-full sm:w-[70%] h-[40rem]  flex justify-center items-center bg-slate-100">
          <div className="h-[25rem] w-[90%] sm:mt-20 ">
            <h2>Tournament Details </h2>
            <hr className="my-2" />
            <div className="flex flex-wrap p-4">
              <p className="w-full md:w-1/2 mb-2">
                Total Users : {data.totalUsers}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Starting Chips : {data.startingChips}
              </p>
              <p className="w-full md:w-1/2 mb-2 ">
                EntryChips : {data?.entryChips}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Max Player : {data.maxPlayer}
              </p>

              {/* <p className="w-full md:w-1/2 mb-2">isDelete:{data?.isDelete}</p> */}
            </div>
            {/* <h2>Game </h2> */}
            <hr className="my-2" />
            <div className="flex flex-wrap p-4">
              {/* <p className="w-full md:w-1/2 mb-2">
                gameHoistingPermission: {gameHoistingPermissionsString}
              </p> */}
              {/* <p className="w-full md:w-1/2 mb-2">
                Total Loss : {data.totalLoss}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Total Abandons : {data.totalAbandons}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Two Player Wins : {data.TwoPlayersWins}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Six Player Wins :{data.SixPlayersWins}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Ten Player Wins :{data.TenPlayersWins}
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </AdaptableCard>
  );
};

export default Profile;
