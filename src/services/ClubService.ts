import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";

export async function listAllClubs<T>(
  currentPage: number,
  limit: number,
  searchQuery: string
) {
  return ApiService.fetchData<T>({
    url: `/adminClub/list-of-club?currentPage=${currentPage}&limit=${limit}&search=${searchQuery}`,
    method: "get",
  });
}

export async function ClubsDetails<T>(id: any) {
  return ApiService.fetchData<T>({
    url: `/adminClub/club-details/${id}`,
    method: "get",
  });
}

export function ClubsMembers(id: any) {
  return `/adminClub/clubMember-list/${id}`;
}

export function ClubsGames(id: any) {
  return `/adminClub/list-of-active-games/${id}`;
}

export async function deleteClub<T>(id: number) {
  return ApiService.fetchData<T>({
    url: `/adminClub/deleteClub/${id}`,
    method: "delete",
  });
}

// export function ClubsMembers<T>(id: any) {
//   return ApiService.fetchData<T>({
//     url: `/adminClub/clubMember-list/${id}`,
//     method: "get",
//   });
// }

// export function ClubsGames<T>(id: any) {
//   return ApiService.fetchData<T>({
//     url: `/adminClub/list-of-active-games/${id}`,
//     method: "get",
//   });
// }
