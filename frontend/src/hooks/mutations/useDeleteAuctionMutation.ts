import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteAuction,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useDeleteAuctionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      auctionId: string,
    ) =>
      deleteAuction(
        auctionId,
      ),

    onSuccess: async (
      _response,
      auctionId,
    ) => {
      queryClient.removeQueries({
        queryKey:
          auctionKeys.detail(
            auctionId,
          ),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.adminDashboard(),
        }),
      ]);
    },
  });
}

export default useDeleteAuctionMutation;