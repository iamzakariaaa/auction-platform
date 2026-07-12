import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  cancelAuction,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useCancelAuctionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      auctionId: string,
    ) =>
      cancelAuction(
        auctionId,
      ),

    onSuccess: async (
      _response,
      auctionId,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.detail(
              auctionId,
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.adminDashboard(),
        }),
      ]);
    },
  });
}

export default useCancelAuctionMutation;