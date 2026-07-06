import apiClient from "./apiClient";
import type {
  BidResponse,
  PlaceBidRequest,
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