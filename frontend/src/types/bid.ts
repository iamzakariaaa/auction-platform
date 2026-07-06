export interface PlaceBidRequest {
  amount: number;
}

export interface BidResponse {
  id: string;
  auctionId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  createdAt: string;
}

export interface BidPlacedMessage {
  bidId: string;
  auctionId: string;
  amount: number;
  bidderName: string;
  bidCount: number;
  placedAt: string;
}