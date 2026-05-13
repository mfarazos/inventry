import { ApiResponse } from "@/@types/apiResponse";
import ApiService from "./ApiService";

export function listTransactions() {
  return "/adminPayment/getAllTransactions";
}
export function listTransactionsuUserId(id: string) {
  return `/adminPayment/getTransactions/${id}`;
}
