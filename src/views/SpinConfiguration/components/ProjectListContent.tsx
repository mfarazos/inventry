import { useEffect, useState } from "react";
import classNames from "classnames";
import ListItem from "./ListItem";
import Spinner from "@/components/ui/Spinner";
import { getSpinSettings, updateSpinSettings } from "@/services/SettingService";
import useListApi from "@/utils/hooks/useListApi";
import { StoreItem } from "@/@types/store";
import { handleHttpReq } from "@/utils/HandleHttp";
import Notification from '@/components/ui/Notification'
import toast from "@/components/ui/toast";



const ProjectListContent = () => {
  const [data, setData]= useState([]);

  const fetchData = async () => {
      const response = await getSpinSettings();
      console.log("testuser",response.data);
      setData(response.data.data)
  };

  const updateValueData = async (id: string, value: number) => {
    try {
      const response = await updateSpinSettings({id, value});
      if(response){
        toast.push(
          <Notification
              title={response.data.message}
              type="success"
              duration={2500}
          >
              {response.data.message}
          </Notification>,
          {
              placement: 'top-center',
          }
      )
      }  
    } catch (error) {
      console.log();
    }
    
    
};

  useEffect(() => {
     handleHttpReq(async () => {
        fetchData();
      });
  }, []);


  return (
    <div
      className={classNames(
        "mt-6 h-full flex flex-col"
        // loading && 'justify-center'
      )}
    >
      {/* {loading && (
                <div className="flex justify-center">
                    <Spinner size={40} />
                </div>
            )} */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.map((project, index) => (
          <ListItem key={index} data={project} onUpdate={updateValueData} />
        ))}
      </div>
    </div>
  );
};

export default ProjectListContent;
