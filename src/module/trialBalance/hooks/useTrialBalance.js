import { useQuery } from "@tanstack/react-query";
import { fetchTrialBalanceReport } from "../api/trialBalance";

export const useTrialBalanceReport = (searchParams) => {
  return useQuery({
    queryKey: ["trialBalanceReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return { payment: [] };
      const response = await fetchTrialBalanceReport(searchParams);
      return response.data;
    },
    enabled: !!searchParams,
  });
};
