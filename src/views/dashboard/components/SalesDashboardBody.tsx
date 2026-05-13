import { useEffect, useState } from "react";
import Loading from "@/components/shared/Loading";
import Statistic from "./Statistic";
import SalesReport from "./SalesReport";
import SalesByCategories from "./SalesByCategories";
import { apiGetSalesDashboardData } from "@/services/SalesService";
import { handleHttpReq } from "@/utils/HandleHttp";

type Statistic = {
  value: number;
};

export type DashboardData = {
  statisticData?: {
    revenue: Statistic;
    orders: Statistic;
    purchases: Statistic;
  };
  salesReportData?: {
    series: {
      name: string;
      data: number[];
    }[];
    categories: string[];
  };
  salesByCategoriesData?: {
    labels: string[];
    data: number[];
  };
};

type DashboardDataResponse = DashboardData;

const SalesDashboardBody = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});

  useEffect(() => {
    handleHttpReq(async()=>{
        fetchData();
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    handleHttpReq(async () => {
      const response = await apiGetSalesDashboardData<DashboardDataResponse>();
      console.log("kia aya", response.data);
      setDashboardData(response.data);
    });
  };

  return (
    <>
    
      <Statistic data={dashboardData?.statisticData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesReport
          data={dashboardData?.salesReportData}
          className="col-span-2"
        />
        {/* <SalesByCategories data={dashboardData?.salesByCategoriesData} /> */}
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <LatestOrder
                    data={dashboardData?.latestOrderData}
                    className="lg:col-span-2"
                />
                <TopProduct data={dashboardData?.topProductsData} />
            </div> */}
    </>
  );
};

export default SalesDashboardBody;
