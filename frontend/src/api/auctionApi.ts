import apiClient from "./apiClient";
import type {
  AdminDashboardResponse,
  AuctionDetails,
  AuctionFormRequest,
  AuctionImage,
  AuctionPage,
  AuctionResponse,
  AuctionStatus,
  WonAuctionPage,
} from "../types/auction";

export type AuctionSort =
  | "NEWEST"
  | "ENDING_SOON"
  | "PRICE_LOW_TO_HIGH"
  | "PRICE_HIGH_TO_LOW";

interface GetAuctionsParameters {
  page?: number;
  size?: number;
  search?: string;
  status?: AuctionStatus;
  minimumPrice?: number;
  maximumPrice?: number;
  sort?: AuctionSort;
}

function getSortParameter(
  sort: AuctionSort,
): string {
  switch (sort) {
    case "ENDING_SOON":
      return "endTime,asc";

    case "PRICE_LOW_TO_HIGH":
      return "currentPrice,asc";

    case "PRICE_HIGH_TO_LOW":
      return "currentPrice,desc";

    case "NEWEST":
    default:
      return "createdAt,desc";
  }
}

export async function getAuctions({
  page = 0,
  size = 12,
  search,
  status,
  minimumPrice,
  maximumPrice,
  sort = "NEWEST",
}: GetAuctionsParameters = {}): Promise<AuctionPage> {
  const normalizedSearch = search?.trim();

  const response =
    await apiClient.get<AuctionPage>(
      "/api/auctions",
      {
        params: {
          page,
          size,
          sort: getSortParameter(sort),

          ...(normalizedSearch
            ? { search: normalizedSearch }
            : {}),

          ...(status
            ? { status }
            : {}),

          ...(minimumPrice !== undefined
            ? { minimumPrice }
            : {}),

          ...(maximumPrice !== undefined
            ? { maximumPrice }
            : {}),
        },
      },
    );

  return response.data;
}

export async function getAuctionDetails(
  auctionId: string,
): Promise<AuctionDetails> {
  const response =
    await apiClient.get<AuctionDetails>(
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

export async function getAdminDashboard():
Promise<AdminDashboardResponse> {
  const response =
    await apiClient.get<AdminDashboardResponse>(
      "/api/admin/dashboard",
    );

  return response.data;
}

export async function getAuctionImages(
  auctionId: string,
): Promise<AuctionImage[]> {
  const response =
    await apiClient.get<AuctionImage[]>(
      `/api/admin/auctions/${auctionId}/images`,
    );

  return response.data;
}

export async function uploadAuctionImage(
  auctionId: string,
  file: File,
): Promise<AuctionImage> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await apiClient.post<AuctionImage>(
      `/api/admin/auctions/${auctionId}/images`,
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      },
    );

  return response.data;
}

export async function deleteAuctionImage(
  auctionId: string,
  imageId: string,
): Promise<void> {
  await apiClient.delete(
    `/api/admin/auctions/${auctionId}/images/${imageId}`,
  );
}

export async function setPrimaryAuctionImage(
  auctionId: string,
  imageId: string,
): Promise<AuctionImage> {
  const response =
    await apiClient.patch<AuctionImage>(
      `/api/admin/auctions/${auctionId}/images/${imageId}/primary`,
    );

  return response.data;
}

export function resolveAuctionImageUrl(
  imageUrl: string,
): string {
  const baseUrl =
    apiClient.defaults.baseURL ??
    window.location.origin;

  return new URL(
    imageUrl,
    baseUrl,
  ).toString();
}