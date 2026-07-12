import {
  useQuery,
} from "@tanstack/react-query";

import {
  getMyBids,
} from "../../api/bidApi";

import {
  bidKeys,
} from "../../query/bidKeys";

function useMyBidsQuery(
  limit = 20,
) {
  return useQuery({
    queryKey:
      bidKeys.mine(limit),

    queryFn: () =>
      getMyBids(limit),
  });
}

export default useMyBidsQuery;