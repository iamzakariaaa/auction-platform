import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAuctionDetails,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useAuctionDetailsQuery(
  auctionId: string | undefined,
) {
  const selectedAuctionId =
    auctionId ?? "";

  return useQuery({
    queryKey:
      auctionKeys.detail(
        selectedAuctionId,
      ),

    queryFn: () =>
      getAuctionDetails(
        selectedAuctionId,
      ),

    enabled:
      selectedAuctionId.length > 0,
  });
}

export default useAuctionDetailsQuery;