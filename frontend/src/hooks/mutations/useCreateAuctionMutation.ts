import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAuction,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useCreateAuctionMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: createAuction,

    onSuccess: async () => {
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

export default useCreateAuctionMutation;