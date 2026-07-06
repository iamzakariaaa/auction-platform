export type AuctionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "ENDED"
  | "CANCELLED";

export interface AuctionSummary {
  id: string;
  title: string;
  currentPrice: number;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
}

export interface AuctionPage {
  content: AuctionSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuctionDetails {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  minimumBidIncrement: number;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string | null;
  bidCount: number;
  highestBid: number | null;
  leadingBidderName: string | null;
  timeRemainingSeconds: number;
  winningBidId: string | null;
  winnerName: string | null;
}