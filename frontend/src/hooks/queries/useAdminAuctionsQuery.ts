import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  getAuctions,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

import type {
  AuctionStatus,
} from "../../types/auction";

interface UseAdminAuctionsQueryParameters {
  page: number;
  size: number;
  status: AuctionStatus | "ALL";
}

function useAdminAuctionsQuery({
  page,
  size,
  status,
}: UseAdminAuctionsQueryParameters) {
  const queryParameters = {
    page,
    size,
    search: "",
    status,
    minimumPrice: undefined,
    maximumPrice: undefined,
    sort: "NEWEST" as const,
  };

  return useQuery({
    queryKey:
      auctionKeys.list(
        queryParameters,
      ),

    queryFn: () =>
      getAuctions({
        page,
        size,

        status:
          status === "ALL"
            ? undefined
            : status,

        sort: "NEWEST",
      }),

    placeholderData:
      keepPreviousData,
  });
}

export default useAdminAuctionsQuery;