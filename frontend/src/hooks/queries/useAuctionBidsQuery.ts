import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAuctionBids,
} from "../../api/bidApi";

import {
  bidKeys,
} from "../../query/bidKeys";

function useAuctionBidsQuery(
  auctionId: string | undefined,
  limit = 100,
) {
  const selectedAuctionId =
    auctionId ?? "";

  return useQuery({
    queryKey:
      bidKeys.auctionHistory(
        selectedAuctionId,
        limit,
      ),

    queryFn: () =>
      getAuctionBids(
        selectedAuctionId,
        limit,
      ),

    enabled:
      selectedAuctionId.length > 0,
  });
}

export default useAuctionBidsQuery;