import apiClient from "./apiClient";
import type {
  BidResponse,
  PlaceBidRequest,
  UserBidResponse,
} from "../types/bid";

export async function placeBid(
  auctionId: string,
  request: PlaceBidRequest,
): Promise<BidResponse> {
  const response = await apiClient.post<BidResponse>(
    `/api/auctions/${auctionId}/bids`,
    request,
  );

  return response.data;
}

export async function getMyBids(
  limit = 20,
): Promise<UserBidResponse[]> {
  const response = await apiClient.get<
    UserBidResponse[]
  >("/api/users/me/bids", {
    params: {
      limit,
    },
  });

  return response.data;
}