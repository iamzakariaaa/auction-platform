import apiClient from "./apiClient";
import type {
  AuctionDetails,
  AuctionFormRequest,
  AuctionPage,
  AuctionResponse,
  AuctionStatus,
  WonAuctionPage,
} from "../types/auction";

interface GetAuctionsParameters {
  page?: number;
  size?: number;
  status?: AuctionStatus;
}

export async function getAuctions({
  page = 0,
  size = 12,
  status,
}: GetAuctionsParameters = {}): Promise<AuctionPage> {
  const response = await apiClient.get<AuctionPage>(
    "/api/auctions",
    {
      params: {
        page,
        size,
        sort: "createdAt,desc",
        ...(status ? { status } : {}),
      },
    },
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

export async function createAuction(
  request: AuctionFormRequest,
): Promise<AuctionResponse> {
  const response =
    await apiClient.post<AuctionResponse>(
      "/api/admin/auctions",
      request,
    );

  return response.data;
}

export async function updateAuction(
  auctionId: string,
  request: AuctionFormRequest,
): Promise<AuctionResponse> {
  const response =
    await apiClient.put<AuctionResponse>(
      `/api/admin/auctions/${auctionId}`,
      request,
    );

  return response.data;
}

export async function cancelAuction(
  auctionId: string,
): Promise<AuctionResponse> {
  const response =
    await apiClient.patch<AuctionResponse>(
      `/api/admin/auctions/${auctionId}/cancel`,
    );

  return response.data;
}

export async function deleteAuction(
  auctionId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/admin/auctions/${auctionId}`,
  );
}