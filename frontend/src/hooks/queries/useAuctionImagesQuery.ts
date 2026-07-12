import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAuctionImages,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useAuctionImagesQuery(
  auctionId: string | undefined,
) {
  const selectedAuctionId =
    auctionId ?? "";

  return useQuery({
    queryKey:
      auctionKeys.images(
        selectedAuctionId,
      ),

    queryFn: () =>
      getAuctionImages(
        selectedAuctionId,
      ),

    enabled:
      selectedAuctionId.length > 0,
  });
}

export default useAuctionImagesQuery;