import {
  useEffect,
} from "react";
import {
  Client,
} from "@stomp/stompjs";
import {
  useQueryClient,
} from "@tanstack/react-query";

import {
  auctionKeys,
} from "../query/auctionKeys";

import type {
  AuctionDetails,
} from "../types/auction";

import type {
  BidPlacedMessage,
} from "../types/bid";

interface UseAuctionBidUpdatesOptions {
  auctionId: string | undefined;

  onBidPlaced?: (
    bid: BidPlacedMessage,
  ) => void;
}

function useAuctionBidUpdates({
  auctionId,
  onBidPlaced,
}: UseAuctionBidUpdatesOptions) {
  const queryClient =
    useQueryClient();

  useEffect(() => {
    if (!auctionId) {
      return;
    }

    const selectedAuctionId =
      auctionId;

    const client = new Client({
      brokerURL:
        import.meta.env.VITE_WS_URL,

      reconnectDelay: 5000,

      onConnect: () => {
        client.subscribe(
          `/topic/auctions/${selectedAuctionId}/bids`,

          (message) => {
            try {
              const bidUpdate =
                JSON.parse(
                  message.body,
                ) as BidPlacedMessage;

              queryClient.setQueryData<
                AuctionDetails
              >(
                auctionKeys.detail(
                  selectedAuctionId,
                ),

                (currentAuction) => {
                  if (!currentAuction) {
                    return currentAuction;
                  }

                  return {
                    ...currentAuction,

                    currentPrice:
                      bidUpdate.amount,

                    highestBid:
                      bidUpdate.amount,

                    bidCount:
                      bidUpdate.bidCount,

                    leadingBidderName:
                      bidUpdate.bidderName,
                  };
                },
              );

              void queryClient.invalidateQueries({
                queryKey:
                  auctionKeys.lists(),
              });

              onBidPlaced?.(
                bidUpdate,
              );
            } catch (error) {
              console.error(
                "Unable to process the bid update.",
                error,
              );
            }
          },
        );
      },

      onStompError: (frame) => {
        console.error(
          "The WebSocket broker reported an error.",
          frame,
        );
      },

      onWebSocketError: (event) => {
        console.error(
          "The WebSocket connection failed.",
          event,
        );
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [
    auctionId,
    onBidPlaced,
    queryClient,
  ]);
}

export default useAuctionBidUpdates;