import type {
  AuctionStatus,
} from "../types/auction";

interface AuctionStatusBadgeProps {
  status: AuctionStatus;
  className?: string;
}

function AuctionStatusBadge({
  status,
  className = "",
}: AuctionStatusBadgeProps) {
  return (
    <span
      className={[
        "auction-status",
        `auction-status-${status.toLowerCase()}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {status}
    </span>
  );
}

export default AuctionStatusBadge;