import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useParams,
} from "react-router-dom";

import {
  getApiErrorMessage,
} from "../../api/getApiErrorMessage";

import AuctionGallery from
  "../../components/AuctionGallery";
import AuctionStatusBadge from
  "../../components/AuctionStatusBadge";
import BidSection from
  "../../components/BidSection";
import ErrorMessage from
  "../../components/ErrorMessage";
import LoadingState from
  "../../components/LoadingState";

import useAuctionBidUpdates from
  "../../hooks/useAuctionBidUpdates";
import usePlaceBidMutation from
  "../../hooks/mutations/usePlaceBidMutation";
import useAuctionDetailsQuery from
  "../../hooks/queries/useAuctionDetailsQuery";

import type {
  BidPlacedMessage,
} from "../../types/bid";

import {
  formatMoney,
  formatRemainingTime,
} from "../../utils/formats";

import "./AuctionDetailsPage.css";
import useAuth from "../../hooks/useAuth";

function AuctionDetailsPage() {
  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const [bidAmount, setBidAmount] =
    useState("");

  const [
    bidErrorMessage,
    setBidErrorMessage,
  ] = useState("");

  const [
    bidMessage,
    setBidMessage,
  ] = useState("");

  const [
    selectedImageId,
    setSelectedImageId,
  ] = useState<string | null>(null);

  const { authenticated } = useAuth();

  const auctionQuery =
    useAuctionDetailsQuery(
      auctionId,
    );

  const placeBidMutation =
    usePlaceBidMutation(
      auctionId,
    );

  const auction =
    auctionQuery.data;

  useEffect(() => {
    if (!auction) {
      setSelectedImageId(null);
      return;
    }

    setSelectedImageId(
      (currentImageId) => {
        const currentImageStillExists =
          currentImageId !== null &&
          auction.images.some(
            (image) =>
              image.id ===
              currentImageId,
          );

        if (
          currentImageStillExists
        ) {
          return currentImageId;
        }

        const primaryImage =
          auction.images.find(
            (image) =>
              image.primaryImage,
          ) ?? auction.images[0];

        return (
          primaryImage?.id ?? null
        );
      },
    );
  }, [auction]);

  const handleBidUpdate =
    useCallback(
      (
        bidUpdate:
          BidPlacedMessage,
      ) => {
        setBidErrorMessage("");

        setBidMessage(
          `New bid: ${formatMoney(
            bidUpdate.amount,
          )} by ${bidUpdate.bidderName}`,
        );
      },
      [],
    );

  useAuctionBidUpdates({
    auctionId,
    onBidPlaced:
      handleBidUpdate,
  });

  async function handleBidSubmit(
    event: SyntheticEvent<
      HTMLFormElement,
      SubmitEvent
    >,
  ) {
    event.preventDefault();

    if (
      !auctionId ||
      !auction
    ) {
      return;
    }

    const amount =
      Number(bidAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setBidErrorMessage(
        "Enter a valid bid amount.",
      );
      return;
    }

    setBidErrorMessage("");
    setBidMessage("");

    try {
      const response =
        await placeBidMutation.mutateAsync(
          amount,
        );

      setBidAmount("");

      setBidMessage(
        `Your bid of ${formatMoney(
          response.amount,
        )} was accepted.`,
      );
    } catch (error) {
      setBidErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to place the bid.",
        ),
      );
    }
  }

  if (!auctionId) {
    return (
      <ErrorMessage message="Auction ID is missing." />
    );
  }

  if (auctionQuery.isPending) {
    return (
      <LoadingState message="Loading auction..." />
    );
  }

  if (
    auctionQuery.isError &&
    !auction
  ) {
    return (
      <ErrorMessage
        message={getApiErrorMessage(
          auctionQuery.error,
          "Unable to load the auction.",
        )}
      />
    );
  }

  if (!auction) {
    return (
      <ErrorMessage message="Auction not found." />
    );
  }

  const minimumNextBid =
    auction.bidCount === 0
      ? auction.startingPrice
      : auction.currentPrice +
        auction.minimumBidIncrement;

  const canBid =
    authenticated &&
    auction.status === "ACTIVE" &&
    auction.timeRemainingSeconds > 0;

  return (
    <article className="auction-details">
      <AuctionGallery
        title={auction.title}
        images={auction.images}
        selectedImageId={
          selectedImageId
        }
        onSelectImage={
          setSelectedImageId
        }
      />

      <h1>{auction.title}</h1>

      <p>
        {auction.description}
      </p>

      <dl>
        <dt>Status</dt>

        <dd>
          <AuctionStatusBadge
            status={auction.status}
          />
        </dd>

        <dt>Starting price</dt>

        <dd>
          {formatMoney(
            auction.startingPrice,
          )}
        </dd>

        <dt>Current price</dt>

        <dd>
          {formatMoney(
            auction.currentPrice,
          )}
        </dd>

        <dt>
          Minimum increment
        </dt>

        <dd>
          {formatMoney(
            auction.minimumBidIncrement,
          )}
        </dd>

        <dt>Bid count</dt>

        <dd>
          {auction.bidCount}
        </dd>

        <dt>Leading bidder</dt>

        <dd>
          {auction.leadingBidderName ??
            "No bids yet"}
        </dd>

        <dt>Time remaining</dt>

        <dd>
          {formatRemainingTime(
            auction.timeRemainingSeconds,
          )}
        </dd>

        {auction.status ===
          "ENDED" && (
          <>
            <dt>Winner</dt>

            <dd>
              {auction.winnerName ??
                "No winning bidder"}
            </dd>
          </>
        )}
      </dl>

      <BidSection
        authenticated={
          authenticated
        }
        canBid={canBid}
        bidAmount={bidAmount}
        minimumNextBid={
          minimumNextBid
        }
        submittingBid={
          placeBidMutation.isPending
        }
        errorMessage={
          bidErrorMessage
        }
        successMessage={
          bidMessage
        }
        onBidAmountChange={
          setBidAmount
        }
        onSubmit={
          handleBidSubmit
        }
      />
    </article>
  );
}

export default AuctionDetailsPage;