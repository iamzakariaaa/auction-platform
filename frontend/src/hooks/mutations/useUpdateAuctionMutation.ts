import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  updateAuction,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

import type {
  AuctionFormRequest,
} from "../../types/auction";

interface UpdateAuctionVariables {
  auctionId: string;
  request: AuctionFormRequest;
}

function useUpdateAuctionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      request,
    }: UpdateAuctionVariables) =>
      updateAuction(
        auctionId,
        request,
      ),

    onSuccess: async (
      _updatedAuction,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.detail(
              variables.auctionId,
            ),
        }),

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

export default useUpdateAuctionMutation;