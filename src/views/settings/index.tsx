import { AdaptableCard } from "@/components/shared";
import { Button, FormItem, Input } from "@/components/ui";
import { ErrorMessage, Field, Formik, Form } from "formik";
import * as Yup from "yup";
import PrizeForm from "./PriceForm";
import WinningStreakForm from "./WinningStreak";
import { useEffect, useState } from "react";
import { handleHttpReq } from "@/utils/HandleHttp";
import { getSettings } from "@/services/SettingService";
import UnlockItemForm from "./ItemStreak";

const Settings = () => {
  const [data, setData] = useState();
  useEffect(() => {
    const fetchData = async () => {
      handleHttpReq(async () => {
        const response = await getSettings();
        console.log(response.data);
        setData(response.data.data);
      });
    };
    fetchData();
  },[]);

  return (
    <>
      <PrizeForm winnerPrize={data?.winnerPrize} />
      <WinningStreakForm minDailyGames={data?.minDailyGames} />
      {/* <UnlockItemForm UnlockItem={data?.UnlockItemStreak}/> */}
    </>
  );
};

export default Settings;
