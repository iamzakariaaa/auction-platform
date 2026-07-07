import {
  type SyntheticEvent,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createAuction,
  getAuctionDetails,
  updateAuction,
} from "../api/auctionApi";
import type {
  AuctionFormRequest,
} from "../types/auction";
import "./AuctionFormPage.css";

interface AuctionFormState {
  title: string;
  description: string;
  startingPrice: string;
  minimumBidIncrement: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: AuctionFormState = {
  title: "",
  description: "",
  startingPrice: "",
  minimumBidIncrement: "",
  startTime: "",
  endTime: "",
};

function toLocalDateTimeInput(
  value: string,
): string {
  const date = new Date(value);

  const timezoneOffsetMilliseconds =
    date.getTimezoneOffset() * 60_000;

  return new Date(
    date.getTime() - timezoneOffsetMilliseconds,
  )
    .toISOString()
    .slice(0, 16);
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      error.response?.data?.message;

    if (typeof responseMessage === "string") {
      return responseMessage;
    }

    if (typeof error.response?.data === "string") {
      return error.response.data;
    }
  }

  return fallback;
}

function AuctionFormPage() {
  const navigate = useNavigate();

  const { auctionId } = useParams<{
    auctionId: string;
  }>();

  const editing = auctionId !== undefined;

  const [form, setForm] =
    useState<AuctionFormState>(EMPTY_FORM);

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (!auctionId) {
      setLoading(false);
      return;
    }

    const selectedAuctionId = auctionId;

    async function loadAuction() {
      try {
        setLoading(true);
        setErrorMessage("");

        const auction =
          await getAuctionDetails(
            selectedAuctionId,
          );

        const editable =
          auction.status === "DRAFT" ||
          (
            auction.status === "SCHEDULED" &&
            new Date(
              auction.startTime,
            ).getTime() > Date.now()
          );

        if (!editable) {
          setErrorMessage(
            "This auction can no longer be edited.",
          );
          return;
        }

        setForm({
          title: auction.title,
          description: auction.description,
          startingPrice:
            auction.startingPrice.toString(),
          minimumBidIncrement:
            auction.minimumBidIncrement.toString(),
          startTime: toLocalDateTimeInput(
            auction.startTime,
          ),
          endTime: toLocalDateTimeInput(
            auction.endTime,
          ),
        });
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            "Unable to load this auction.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadAuction();
  }, [auctionId]);

  function updateField(
    field: keyof AuctionFormState,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    const title = form.title.trim();
    const description =
      form.description.trim();

    const startingPrice =
      Number(form.startingPrice);

    const minimumBidIncrement =
      Number(form.minimumBidIncrement);

    if (
      !title ||
      !description ||
      !form.startTime ||
      !form.endTime
    ) {
      setErrorMessage(
        "Please complete all fields.",
      );
      return;
    }

    if (
      !Number.isFinite(startingPrice) ||
      startingPrice <= 0
    ) {
      setErrorMessage(
        "Starting price must be greater than zero.",
      );
      return;
    }

    if (
      !Number.isFinite(
        minimumBidIncrement,
      ) ||
      minimumBidIncrement <= 0
    ) {
      setErrorMessage(
        "Minimum bid increment must be greater than zero.",
      );
      return;
    }

    const startDate =
      new Date(form.startTime);

    const endDate =
      new Date(form.endTime);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setErrorMessage(
        "Please enter valid auction dates.",
      );
      return;
    }

    if (endDate <= startDate) {
      setErrorMessage(
        "End time must be after start time.",
      );
      return;
    }

    if (
      !editing &&
      endDate.getTime() <= Date.now()
    ) {
      setErrorMessage(
        "The auction end time must be in the future.",
      );
      return;
    }

    const request: AuctionFormRequest = {
      title,
      description,
      startingPrice,
      minimumBidIncrement,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    try {
      setSaving(true);

      if (auctionId) {
        await updateAuction(
          auctionId,
          request,
        );
      } else {
        await createAuction(request);
      }

      navigate("/admin/auctions", {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          editing
            ? "Unable to update the auction."
            : "Unable to create the auction.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="auction-form-page">
        <p>Loading auction...</p>
      </section>
    );
  }

  return (
    <section className="auction-form-page">
      <header className="auction-form-page-header">
        <div>
          <p className="admin-eyebrow">
            Administration
          </p>

          <h1>
            {editing
              ? "Edit Auction"
              : "Create Auction"}
          </h1>

          <p>
            Times are entered using your
            computer&apos;s local timezone.
          </p>
        </div>

        <Link
          className="secondary-button"
          to="/admin/auctions"
        >
          Back to Auctions
        </Link>
      </header>

      <section className="auction-editor">
        <form
          className="auction-form"
          onSubmit={handleSubmit}
        >
          <div className="auction-form-field auction-form-full">
            <label htmlFor="auction-title">
              Title
            </label>

            <input
              id="auction-title"
              name="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value,
                )
              }
              maxLength={200}
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field auction-form-full">
            <label htmlFor="auction-description">
              Description
            </label>

            <textarea
              id="auction-description"
              name="description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              rows={6}
              maxLength={5000}
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="starting-price">
              Starting price
            </label>

            <input
              id="starting-price"
              name="startingPrice"
              type="number"
              min="0.01"
              step="0.01"
              value={form.startingPrice}
              onChange={(event) =>
                updateField(
                  "startingPrice",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="minimum-increment">
              Minimum increment
            </label>

            <input
              id="minimum-increment"
              name="minimumBidIncrement"
              type="number"
              min="0.01"
              step="0.01"
              value={
                form.minimumBidIncrement
              }
              onChange={(event) =>
                updateField(
                  "minimumBidIncrement",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="start-time">
              Start time
            </label>

            <input
              id="start-time"
              name="startTime"
              type="datetime-local"
              value={form.startTime}
              onChange={(event) =>
                updateField(
                  "startTime",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          <div className="auction-form-field">
            <label htmlFor="end-time">
              End time
            </label>

            <input
              id="end-time"
              name="endTime"
              type="datetime-local"
              value={form.endTime}
              onChange={(event) =>
                updateField(
                  "endTime",
                  event.target.value,
                )
              }
              disabled={saving}
              required
            />
          </div>

          {errorMessage && (
            <p
              className="admin-message admin-error auction-form-full"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <div className="auction-form-actions auction-form-full">
            <Link
              className="secondary-button"
              to="/admin/auctions"
            >
              Cancel
            </Link>

            <button
              className="primary-button"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing
                  ? "Save Changes"
                  : "Create Auction"}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}

export default AuctionFormPage;