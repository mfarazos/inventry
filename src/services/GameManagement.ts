import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";
export function getGameModes() {
  return "/adminGame/get-all-game-modes";
}
export async function geteditGameMode<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/adminGame/geteditGameMode/${id}`,
    method: "get",
  });
}

export async function editGameMode<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/adminGame/editGameMode/${id}`,
    method: "patch",
  });
}

export async function createGameMode<T>(data: any) {
  return ApiService.fetchData<T>({
    url: `/adminGame/createGameMode`,
    method: "post",
    data,
  });
}

export async function delGameMode<T>(id: string) {
  return ApiService.fetchData<T>({
    url: `/adminGame/deleteGameMode/${id}`,
    method: "delete",
  });
}

export function deleteGameMode() {
  return "/adminGame/deleteGameMode";
}
