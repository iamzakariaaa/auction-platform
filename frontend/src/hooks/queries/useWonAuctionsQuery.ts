import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  getWonAuctions,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useWonAuctionsQuery(
  page: number,
  size: number,
) {
  return useQuery({
    queryKey:
      auctionKeys.won(
        page,
        size,
      ),

    queryFn: () =>
      getWonAuctions(
        page,
        size,
      ),

    placeholderData:
      keepPreviousData,
  });
}

export default useWonAuctionsQuery;