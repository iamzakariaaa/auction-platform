import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  placeBid,
} from "../../api/bidApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

import type {
  AuctionDetails,
} from "../../types/auction";

function usePlaceBidMutation(
  auctionId: string | undefined,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: async (
      amount: number,
    ) => {
      if (!auctionId) {
        throw new Error(
          "Auction ID is missing.",
        );
      }

      return placeBid(
        auctionId,
        { amount },
      );
    },

    onSuccess: (bid) => {
      if (!auctionId) {
        return;
      }

      queryClient.setQueryData<
        AuctionDetails
      >(
        auctionKeys.detail(
          auctionId,
        ),

        (currentAuction) => {
          if (!currentAuction) {
            return currentAuction;
          }

          return {
            ...currentAuction,

            currentPrice:
              bid.amount,

            highestBid:
              bid.amount,

            leadingBidderName:
              bid.bidderName,
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey:
          auctionKeys.detail(
            auctionId,
          ),
      });

      void queryClient.invalidateQueries({
        queryKey:
          auctionKeys.lists(),
      });
    },
  });
}

export default usePlaceBidMutation;