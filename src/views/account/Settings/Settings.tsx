import { useState, useEffect, Suspense, lazy } from "react";
import Tabs from "@/components/ui/Tabs";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Container from "@/components/shared/Container";
import { useNavigate, useLocation } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import { apiGetAccountSettingData } from "@/services/AccountServices";
import { handleHttpReq } from "@/utils/HandleHttp";

const Profile = lazy(() => import("./components/Profile"));
const Billing = lazy(() => import("./components/Billing"));

const { TabNav, TabList } = Tabs;

const settingsMenu: Record<
  string,
  {
    label: string;
    path: string;
  }
> = {
  profile: { label: "Profile", path: "/profile" },
  billing: { label: "Billing", path: "/billing" },
};

const Settings = () => {
  const [currentTab, setCurrentTab] = useState("profile");
  const [data, setData] = useState<any>({});

  const navigate = useNavigate();

  const location = useLocation();

  const path = location.pathname.substring(
    location.pathname.lastIndexOf("/") + 1
  );

  const onTabChange = (val: string) => {
    setCurrentTab(val);
    //navigate(`/account/settings/${val}`)
  };

  const fetchData = async (id: string) => {
    handleHttpReq(async () => {
      const response = await apiGetAccountSettingData<any>(id);
      console.log("testuser", response.data.data);
      let res = {
        email: response.data.data?.email || "",
        userName: response.data.data?.userName || "",
        userCode: response.data.data?.userCode || "",
        profilePic: response.data.data?.profilePic || "",
        winPercentage: response.data.data?.winPercentage || 0,
        handsPlayed: response.data.data?.handsPlayed || 0,
        handsWin: response.data.data?.handsWin || 0,
        biggestPotWin: response.data.data?.biggestPotWin || 0,
        tournamentWin: response.data.data?.tournamentWin || 0,
        highestStakesPlayed: response.data.data?.highestStakesPlayed || 0,
        bestWinningHand: response.data.data?.bestWinningHand || "",

        // email: response.data.data.email,
        // coins: response.data.data.user.coins,
        // img: response.data.data?.user?.profileImage,
        // userType: response.data.data.user.userType || 0,
        // totalMatches: response.data.data.games[0]?.totalMatches || 0,
        // totalWins: response.data.data.games[0]?.totalWins || 0,
        // totalAbandons: response.data.data.games[0]?.totalAbandons || 0,
        // totalLoss: response.data.data.games[0]?.totalLoss || 0,
        // TwoPlayersWins: response.data.data.games[0]?.TwoPlayersWins || 0,
        // SixPlayersWins: response.data.data.games[0]?.SixPlayersWins || 0,
        // TenPlayersWins: response.data.data.games[0]?.TenPlayersWins || 0,
        // Winrate: response.data.data.games[0]?.Winrate || 0,
      };
      setData(res);
    });
  };

  useEffect(() => {
    const rquestParam = { id: path };
    console.log("getparams", rquestParam);
    if (isEmpty(data)) {
      handleHttpReq(async () => {
        fetchData(rquestParam.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <AdaptableCard>
        <Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
          <TabList>
            {Object.keys(settingsMenu).map((key) => (
              <TabNav key={key} value={key}>
                {settingsMenu[key].label}
              </TabNav>
            ))}
          </TabList>
        </Tabs>
        <div className="px-4 py-6">
          <Suspense fallback={<></>}>
            {currentTab === "profile" && <Profile data={data} />}
            {currentTab === "billing" && <Billing id={path} />}
          </Suspense>
        </div>
      </AdaptableCard>
    </Container>
  );
};

export default Settings;
