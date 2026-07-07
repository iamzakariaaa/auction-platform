import apiClient from "./apiClient";
import type {
  AuctionDetails,
  AuctionPage,
  WonAuctionPage,
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

export async function getWonAuctions(
  page = 0,
  size = 20,
): Promise<WonAuctionPage> {
  const response =
    await apiClient.get<WonAuctionPage>(
      "/api/users/me/won-auctions",
      {
        params: {
          page,
          size,
        },
      },
    );

  return response.data;
}