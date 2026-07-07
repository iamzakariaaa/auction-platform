import {
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { getAuctions } from "../api/auctionApi";
import type {
  AuctionSummary,
} from "../types/auction";
import "./AuctionsPage.css";

function AuctionsPage() {
  const [auctions, setAuctions] = useState<
    AuctionSummary[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadAuctions() {
      try {
        const page = await getAuctions();
        setAuctions(page.content);
      } catch {
        setErrorMessage(
          "Unable to load auctions.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuctions();
  }, []);

  if (loading) {
    return <p>Loading auctions...</p>;
  }

  if (errorMessage) {
    return (
      <p className="error-message">
        {errorMessage}
      </p>
    );
  }

  return (
    <section className="auctions-page">
      <h1>Auctions</h1>

      {auctions.length === 0 ? (
        <p>No auctions are currently available.</p>
      ) : (
        <div className="auction-grid">
          {auctions.map((auction) => (
            <article
              className="auction-card"
              key={auction.id}
            >
              <h2>{auction.title}</h2>

              <p>
                Status:{" "}
                <strong>{auction.status}</strong>
              </p>

              <p>
                Current price:{" "}
                <strong>
                  {auction.currentPrice} MAD
                </strong>
              </p>

              <Link
                to={`/auctions/${auction.id}`}
              >
                View auction
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AuctionsPage;