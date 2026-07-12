import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  uploadAuctionImage,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

interface UploadAuctionImagesVariables {
  auctionId: string;
  files: File[];
}

function useUploadAuctionImagesMutation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async ({
      auctionId,
      files,
    }: UploadAuctionImagesVariables) => {
      const uploadedImages = [];

      for (const file of files) {
        const uploadedImage =
          await uploadAuctionImage(
            auctionId,
            file,
          );

        uploadedImages.push(
          uploadedImage,
        );
      }

      return uploadedImages;
    },

    onSuccess: async (
      _uploadedImages,
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

export default useUploadAuctionImagesMutation;