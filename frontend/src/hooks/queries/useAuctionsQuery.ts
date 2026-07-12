import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  getAuctions,
} from "../../api/auctionApi";

import {
  auctionKeys,
  type AuctionListQueryParameters,
} from "../../query/auctionKeys";

function useAuctionsQuery(
  parameters:
    AuctionListQueryParameters,
) {
  return useQuery({
    queryKey:
      auctionKeys.list(
        parameters,
      ),

    queryFn: () =>
      getAuctions({
        page: parameters.page,
        size: parameters.size,
        search: parameters.search,

        status:
          parameters.status === "ALL"
            ? undefined
            : parameters.status,

        minimumPrice:
          parameters.minimumPrice,

        maximumPrice:
          parameters.maximumPrice,

        sort: parameters.sort,
      }),

    placeholderData:
      keepPreviousData,
  });
}

export default useAuctionsQuery;