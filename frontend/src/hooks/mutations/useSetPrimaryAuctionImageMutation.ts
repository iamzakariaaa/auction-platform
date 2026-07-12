import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  setPrimaryAuctionImage,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

interface SetPrimaryImageVariables {
  auctionId: string;
  imageId: string;
}

function useSetPrimaryAuctionImageMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      imageId,
    }: SetPrimaryImageVariables) =>
      setPrimaryAuctionImage(
        auctionId,
        imageId,
      ),

    onSuccess: async (
      _updatedImage,
      variables,
    ) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            auctionKeys.images(
              variables.auctionId,
            ),
        }),

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

export default useSetPrimaryAuctionImageMutation;