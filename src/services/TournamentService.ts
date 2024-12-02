import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";
export async function createtournament<T>(data: any) {
  return ApiService.fetchData<T>({
    url: `/adminTournamnet/create-tournament`,
    method: "post",
    data,
  });
}

export async function listAllTournaments<T>(
  currentPage: number,
  limit: number,
  searchQuery: string
) {
  return ApiService.fetchData<T>({
    url: `/adminTournamnet/allTournaments?currentPage=${currentPage}&limit=${limit}&search=${searchQuery}`,
    method: "get",
  });
}

export async function updateTournament<T>(data: any) {
  return ApiService.fetchData<T>({
    url: `/adminTournamnet/updateTournament`,
    method: "put",
    data,
  });
}

export async function getTournament<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/adminTournamnet/getTournament/${id}`,
    method: "get",
  });
}

export async function deleteTournament<T>(id: number) {
  return ApiService.fetchData<T>({
    url: `/adminTournamnet/deleteTournament/${id}`,
    method: "delete",
  });
}

export async function tournamentDetails<T>(id: any) {
  return ApiService.fetchData<T>({
    url: `/adminTournamnet/getTournament/${id}`,
    method: "get",
  });
}
