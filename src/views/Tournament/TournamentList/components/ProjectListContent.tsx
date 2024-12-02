import { SetStateAction, useEffect, useState } from "react";
import classNames from "classnames";
import GridItem from "./GridItem";
import Spinner from "@/components/ui/Spinner";
import { listAllClubs } from "@/services/ClubService";
import useListApi from "@/utils/hooks/useListApi";
import { StoreItem } from "@/@types/store";
import { handleHttpReq } from "@/utils/HandleHttp";
import {
  deleteTournament,
  listAllTournaments,
} from "@/services/TournamentService";
import HeaderContent from "@/components/shared/HeaderContent";

import { tournamentOption } from "@/configs/dropdown.config";
import Pagination from "./Pagination";
import TournamentSearch from "./TournamentSearch";
import { useNavigate } from "react-router-dom";
const ProjectListContent = () => {
  const navigate = useNavigate();

  
  const listUrl = "/adminTournamnet/allTournaments";

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

  

  
  
  const onChangeDropDown = (itemSelected: string) => {
    setFilter({ itemType: itemSelected });
  };
  
  

  
  const handleDeleteItem = async (id: number) => {
    const response = await deleteTournament<any>(id);
  };

  const handleEdit = async (id: number) => {
    console.log("HANDLE EDIT", id);
    navigate(`/editTournament/${id}`);
  };

  

  return (
    <div className={classNames("mt-6 h-full flex flex-col")}>
  <HeaderContent
    text="Tournament List"
    addButtonText="Create Tournament"
    addLink="/createTournament"
    dropDownOptions={tournamentOption}
    dropDownSelectedValue={filter?.itemType ?? ""}
    onChangeDropDown={onChangeDropDown}
  />
  <div className="flex-grow">
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((project, index) => (
        <GridItem
          key={index}
          data={project}
          onDelete={handleDeleteItem}
          onEdit={handleEdit}
        />
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
