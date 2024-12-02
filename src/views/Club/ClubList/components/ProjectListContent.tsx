import { SetStateAction, useEffect, useState } from "react";
import classNames from "classnames";
import GridItem from "./GridItem";
import Spinner from "@/components/ui/Spinner";
import { deleteClub, listAllClubs } from "@/services/ClubService";
import useListApi from "@/utils/hooks/useListApi";
import { StoreItem } from "@/@types/store";
import { handleHttpReq } from "@/utils/HandleHttp";
import Pagination from "./Pagination";
import ClubSearch from "./ClubSearch";
import HeaderContent from "@/components/shared/HeaderContent";

const ProjectListContent = () => {
  
  const listUrl = "/adminClub/list-of-club";

  const {
    pageIndex,
    pageSize,
    total,
    data,
    showDeleteDialog,
    loading,
    onPaginationChange,
    onPageSizeChange,
    onSort,
    onEditSearch,
    onDeleteDialogClose,
    onDeleteConfirm,
    handleDeleteClick,
    filter,
    setData,
    setFilter,
  } = useListApi<any>(listUrl, "", 8);

  

  
  
  const handleDeleteItem = async (id: number) => {
    
  };

  
  return (
    <div className={classNames("mt-6 h-full flex flex-col")}>
      {/* <div className="flex justify-between items-center"> */}
        <HeaderContent
          text="Club List"
          showSearch={true}
          onEditSearch={onEditSearch}
        />
        {/* <ClubSearch onSearch={handleSearch} /> */}
      {/* </div> */}
      
      <div className="flex-grow">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((project, index) => (
            <GridItem key={index} data={project} onDelete={handleDeleteItem} />
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={pageIndex}
          totalPages={Math.ceil(total / pageSize)}
          onPageChange={onPaginationChange}
        />
      </div>
    </div>
  );
  
};

export default ProjectListContent;
