import type { PageResponse } from "./PageResponse";

export type AuctionStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "ACTIVE"
  | "ENDED"
  | "CANCELLED";

export interface AuctionImage {
  id: string;
  auctionId: string;
  url: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  displayOrder: number;
  primaryImage: boolean;
  createdAt: string;
}

export interface AuctionSummary {
  id: string;
  title: string;
  currentPrice: number;
  status: AuctionStatus;
  startTime: string;
  endTime: string;
  primaryImageUrl: string | null;
}

export type AuctionPage =
  PageResponse<AuctionSummary>;

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
  images: AuctionImage[];
}

export interface WonAuction {
  auctionId: string;
  title: string;
  winningAmount: number | null;
  winningBidId: string | null;
  endedAt: string;
}

export type WonAuctionPage =
  PageResponse<WonAuction>;

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

export interface AdminDashboardResponse {
  totalAuctions: number;
  scheduledAuctions: number;
  activeAuctions: number;
  endedAuctions: number;
  cancelledAuctions: number;
  recentAuctions: AuctionSummary[];
}