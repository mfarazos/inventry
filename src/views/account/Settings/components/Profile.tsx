import { AdaptableCard } from "@/components/shared";
import { Avatar } from "@/components/ui";
import { HiOutlineUser } from "react-icons/hi";

export type ProfileFormModel = {
  userName: string;
  email: string;
  userCode: string;
  profilePic: string;
  winPercentage: number;
  handsPlayed: number;
  handsWin: number;
  biggestPotWin: number;
  tournamentWin: number;
  highestStakesPlayed: number;
  bestWinningHand: string;
};

type ProfileProps = {
  data?: ProfileFormModel;
};

const Profile = ({
  data = {
    userName: "",
    email: "",
    userCode: "",
    profilePic: "",
    winPercentage: 0,
    handsPlayed: 0,
    handsWin: 0,
    biggestPotWin: 0,
    tournamentWin: 0,
    highestStakesPlayed: 0,
    bestWinningHand: "",
  },
}: ProfileProps) => {
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
              data.profilePic ||
              "https://dominoes-images-preprod.s3.ap-southeast-1.amazonaws.com/prcuxueo0yld8vz0ja1674483047542.jpg"
            }
            alt=""
            size={120}
            // className="h-28 w-40 sm:h-40 sm:w-40 rounded-full my-2"
          />
          <h2
            className="mb-2 text-white"
            style={{
              wordWrap: "break-word",
              wordBreak: "break-all",
              whiteSpace: "normal",
            }}
          >
            {data.userName}
          </h2>
          <h2 className="mb-2 text-white">{data.userCode}</h2>
          {/* 
          <div className="user-info">
            <p className="full-name mb-2">Full Name : {data.name}</p>
            <p className="user-name mb-2">Win Rate : {data?.Winrate?.toFixed(2)}</p>
            <p className="user-name mb-2">Email : {data.email}</p>
          </div> */}
        </div>

        <div className="right w-full sm:w-[70%] h-[40rem]  flex justify-center items-center bg-slate-100">
          <div className="h-[25rem] w-[90%] sm:mt-20 ">
            <h2>Hands </h2>
            <hr className="my-2" />
            <div className="flex flex-wrap p-4">
              <p className="w-full md:w-1/2 mb-2">
                WinPercentage: {data?.winPercentage}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Hands Played : {data.handsPlayed}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Hands Won : {data.handsWin}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                {"Email : " + (data.email ?? "Email not found")}
              </p>
            </div>
            <h2>Achievements </h2>
            <hr className="my-2" />
            <div className="flex flex-wrap p-4">
              <p className="w-full md:w-1/2 mb-2">
                Best winning-hand : {data?.bestWinningHand}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Highest Stakes Played : {data.highestStakesPlayed}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Biggest Pot Won : {data.biggestPotWin}
              </p>
              <p className="w-full md:w-1/2 mb-2">
                Tournaments Win : {data.tournamentWin}
              </p>
              {/* <p className="w-full md:w-1/2 mb-2">
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
