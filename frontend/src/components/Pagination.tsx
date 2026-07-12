interface PaginationProps {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

function Pagination({
  page,
  totalPages,
  loading = false,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="pagination"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() =>
          onPageChange(
            Math.max(page - 1, 0),
          )
        }
        disabled={loading || page === 0}
      >
        Previous
      </button>

      <span>
        Page {page + 1} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() =>
          onPageChange(
            Math.min(
              page + 1,
              totalPages - 1,
            ),
          )
        }
        disabled={
          loading ||
          page >= totalPages - 1
        }
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;