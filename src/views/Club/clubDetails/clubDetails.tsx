import { useState, useEffect, Suspense, lazy } from "react";
import Tabs from "@/components/ui/Tabs";
import AdaptableCard from "@/components/shared/AdaptableCard";
import Container from "@/components/shared/Container";
import { useNavigate, useLocation } from "react-router-dom";
import isEmpty from "lodash/isEmpty";
import { ClubsDetails } from "@/services/ClubService";
import { handleHttpReq } from "@/utils/HandleHttp";

const Profile = lazy(() => import("./components/Profile"));
const ClubGames = lazy(() => import("./components/ClubGames"));
const ClubUsers = lazy(() => import("./components/ClubUsers"));

const { TabNav, TabList } = Tabs;

const settingsMenu: Record<
  string,
  {
    label: string;
    path: string;
  }
> = {
  clubdetails: { label: "Club Details", path: "/Profile" },
  clubmember: { label: "Club Members", path: "/ClubUsers" },
  clubgames: { label: "Club Games", path: "/ClubGames" },
};

const clubDetails = () => {
  const [currentTab, setCurrentTab] = useState("clubdetails");
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
      const response = await ClubsDetails<any>(id);
      console.log("testuser", response);
      let res = {
        clubName: response.data.data.clubName,
        clubDescription: response.data.data.clubDescription,
        clubCode: response.data.data?.clubCode,
        image: response.data.data?.image,
        maxPlayer: response.data.data?.maxPlayer || 0,
        isDelete: response.data.data?.isDelete || true,
        totalUsers: response.data.data?.totalUsers || 0,
        gameHoistingPermission: response.data.data?.gameHostingPermission || [],
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
            {currentTab === "clubdetails" && <Profile data={data} />}
            {currentTab === "clubmember" && <ClubUsers id={path} data={data} />}
            {currentTab === "clubgames" && <ClubGames id={path} />}
          </Suspense>
        </div>
      </AdaptableCard>
    </Container>
  );
};

export default clubDetails;
