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

export interface WonAuction {
  auctionId: string;
  title: string;
  winningAmount: number | null;
  winningBidId: string | null;
  endedAt: string;
}

export interface WonAuctionPage {
  content: WonAuction[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface AuctionResponse {
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
}

export interface AuctionFormRequest {
  title: string;
  description: string;
  startingPrice: number;
  minimumBidIncrement: number;
  startTime: string;
  endTime: string;
}