import type {
  AuctionSort,
} from "../api/auctionApi";

import type {
  AuctionStatus,
} from "../types/auction";

export interface AuctionListQueryParameters {
  page: number;
  size: number;
  search: string;
  status: AuctionStatus | "ALL";
  minimumPrice?: number;
  maximumPrice?: number;
  sort: AuctionSort;
}

export const auctionKeys = {
  all: ["auctions"] as const,

  lists: () =>
    [
      ...auctionKeys.all,
      "list",
    ] as const,

  list: (
    parameters:
      AuctionListQueryParameters,
  ) =>
    [
      ...auctionKeys.lists(),
      parameters,
    ] as const,

  details: () =>
    [
      ...auctionKeys.all,
      "detail",
    ] as const,

  detail: (auctionId: string) =>
    [
      ...auctionKeys.details(),
      auctionId,
    ] as const,

  images: (auctionId: string) =>
    [
      ...auctionKeys.detail(
        auctionId,
      ),
      "images",
    ] as const,

  won: (
    page: number,
    size: number,
  ) =>
    [
      ...auctionKeys.all,
      "won",
      { page, size },
    ] as const,

  adminDashboard: () =>
    [
      ...auctionKeys.all,
      "admin-dashboard",
    ] as const,
};