import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
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

export type SalesDashboardState = {
  startDate: number;
  endDate: number;
  loading: boolean;
  dashboardData: DashboardData;
};

export const SLICE_NAME = "salesDashboard";

export const getSalesDashboardData = createAsyncThunk(
  SLICE_NAME + "/getSalesDashboardData",
  async () => {
    handleHttpReq(async () => {
      const response = await apiGetSalesDashboardData<DashboardDataResponse>();
      return response;
    });
  }
);

const initialState: SalesDashboardState = {
  startDate: dayjs(
    dayjs().subtract(3, "month").format("DD-MMM-YYYY, hh:mm A")
  ).unix(),
  endDate: dayjs(new Date()).unix(),
  loading: true,
  dashboardData: {},
};

const salesDashboardSlice = createSlice({
  name: `${SLICE_NAME}/state`,
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<number>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<number>) => {
      state.endDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSalesDashboardData.fulfilled, (state, action) => {
        state.dashboardData = action.payload;
        state.loading = false;
      })
      .addCase(getSalesDashboardData.pending, (state) => {
        state.loading = true;
      });
  },
});

export const { setStartDate, setEndDate } = salesDashboardSlice.actions;

export default salesDashboardSlice.reducer;
