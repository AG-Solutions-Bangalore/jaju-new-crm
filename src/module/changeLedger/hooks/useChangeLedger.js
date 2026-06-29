import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLedgerAccountNames, changeLedgerName } from "../api/changeLedger";
import { useToast } from "@/hooks/use-toast";

export const useLedgerAccountNames = () => {
  return useQuery({
    queryKey: ["ledgerAccountNames"],
    queryFn: async () => {
      const response = await fetchLedgerAccountNames();
      return response.data.mix || [];
    },
  });
};

export const useChangeLedgerName = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: changeLedgerName,
    onSuccess: (res) => {
      if (res.data.code === 200) {
        toast({
          title: "Success",
          description: "Account name changed successfully",
        });
        queryClient.invalidateQueries({ queryKey: ["ledgerAccountNames"] });
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to change account name",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change account name",
        variant: "destructive",
      });
    },
  });
};
