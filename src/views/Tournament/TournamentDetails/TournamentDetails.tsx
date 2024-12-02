import { useState, useEffect, Suspense, lazy } from "react";
import Tabs from "@/components/ui/Tabs";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Container from "@/components/shared/Container";
import { useNavigate, useLocation } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import { ClubsDetails } from "@/services/ClubService";
import { handleHttpReq } from "@/utils/HandleHttp";
import { tournamentDetails } from "@/services/TournamentService";

const Profile = lazy(() => import("./components/Profile"));
const TournamentResut = lazy(() => import("./components/WinnerUsers"));
const RegisteredUsers = lazy(() => import("./components/RegisteredUsers"));

const { TabNav, TabList } = Tabs;

const settingsMenu: Record<
  string,
  {
    label: string;
    path: string;
  }
> = {
  TournamentDetails: { label: "TournamentDetails", path: "/Profile" },
  RegisteredUsers: { label: "RegisteredUsers", path: "/RegisteredUsers" },
  WinnerUsers: { label: "WinnerUsers", path: "/TournamentResut" },
};

const TournamentDetails = () => {
  const [currentTab, setCurrentTab] = useState("TournamentDetails");
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
      const response = await tournamentDetails<any>(id);
      console.log("testuser", response);
      let res = {
        tournamentName: response.data.data.name,
        tournamentDescripton: response.data.data.description,
        entryChips: response.data.data?.entryChips,
        startingChips: response.data.data?.startingChips,
        image: response.data.data?.image,
        totalUsers: response.data.data?.totalUserInTournament || 0,
        maxPlayer: response.data.data?.MaxUserInTournament || 0,
        registeredUsers: response.data.data?.registeredUsers || 0,
      };
      console.log("THIS IS USER???", res);
      setData(res);
      //console.log("DATA IS HERE", data);
    });
  };

  useEffect(() => {
    console.log("DATA IS HERE", data);
  }, [data]);

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
            {currentTab === "TournamentDetails" && <Profile data={data} />}
            {currentTab === "RegisteredUsers" && (
              <RegisteredUsers id={path} data={data} />
            )}
            {currentTab === "WinnerUsers" && (
              <TournamentResut id={path} data={data} />
            )}
          </Suspense>
        </div>
      </AdaptableCard>
    </Container>
  );
};

export default TournamentDetails;
