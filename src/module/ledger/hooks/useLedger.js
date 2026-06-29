import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchAccountNames,
  fetchLedgerReport,
  downloadLedgerReport,
} from "../api/ledger";
import { useToast } from "@/hooks/use-toast";

export const useAccountNames = () => {
  return useQuery({
    queryKey: ["ledgerAccountNames"],
    queryFn: async () => {
      const response = await fetchAccountNames();
      return response.data.mix || [];
    },
  });
};

export const useLedgerReport = (searchParams) => {
  return useQuery({
    queryKey: ["ledgerReport", searchParams],
    queryFn: async () => {
      if (!searchParams) {
        return {
          payment: [],
          received: [],
          opening_balance: 0,
          closing_balance: 0,
        };
      }
      const response = await fetchLedgerReport(searchParams);
      return response.data;
    },
    enabled: !!searchParams,
  });
};

export const useDownloadLedgerReport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: downloadLedgerReport,
    onSuccess: (response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ledger.csv");
      document.body.appendChild(link);
      link.click();
      toast({
        title: "Download Successful",
        description: "Ledger report downloaded as CSV",
      });
    },
    onError: () => {
      toast({
        title: "Download Failed",
        description: "Failed to download ledger report",
        variant: "destructive",
      });
    },
  });
};
