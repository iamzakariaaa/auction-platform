import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteAuctionImage,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

interface DeleteAuctionImageVariables {
  auctionId: string;
  imageId: string;
}

function useDeleteAuctionImageMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      auctionId,
      imageId,
    }: DeleteAuctionImageVariables) =>
      deleteAuctionImage(
        auctionId,
        imageId,
      ),

    onSuccess: async (
      _response,
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

export default useDeleteAuctionImageMutation;