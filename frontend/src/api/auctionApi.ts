import apiClient from "./apiClient";
import type {
  AuctionDetails,
  AuctionPage,
} from "../types/auction";

export async function getAuctions(): Promise<AuctionPage> {
  const response = await apiClient.get<AuctionPage>(
    "/api/auctions",
  );

  return response.data;
}

export async function getAuctionDetails(
  auctionId: string,
): Promise<AuctionDetails> {
  const response = await apiClient.get<AuctionDetails>(
    `/api/auctions/${auctionId}`,
  );

  return response.data;
}