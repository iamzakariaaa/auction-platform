import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminDashboard,
} from "../../api/auctionApi";

import {
  auctionKeys,
} from "../../query/auctionKeys";

function useAdminDashboardQuery() {
  return useQuery({
    queryKey:
      auctionKeys.adminDashboard(),

    queryFn:
      getAdminDashboard,
  });
}

export default useAdminDashboardQuery;