export const bidKeys = {
  all: ["bids"] as const,

  mine: (limit: number) =>
    [
      ...bidKeys.all,
      "mine",
      { limit },
    ] as const,

  auctionHistory: (
    auctionId: string,
    limit: number,
  ) =>
    [
      ...bidKeys.all,
      "auction",
      auctionId,
      { limit },
    ] as const,
};