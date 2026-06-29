import { useState } from "react";
import {
  useLedgerAccountNames,
  useChangeLedgerName,
} from "../hooks/useChangeLedger";
import { useToast } from "@/hooks/use-toast";
import Page from "@/app/dashboard/page";
import NotesCard from "../components/NotesCard";
import ChangeLedgerForm from "../components/ChangeLedgerForm";

const ChangeLedgerPage = () => {
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newName, setNewName] = useState("");

  const {
    data: accountNames = [],
    isLoading: isAccountNamesLoading,
    refetch: refetchAccounts,
  } = useLedgerAccountNames();

  const changeMutation = useChangeLedgerName();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedAccount) {
      toast({
        title: "Error",
        description: "Please select an account to change",
        variant: "destructive",
      });
      return;
    }

    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new name for the account",
        variant: "destructive",
      });
      return;
    }

    changeMutation.mutate(
      { old_name: selectedAccount.value, new_name: newName.trim() },
      {
        onSuccess: () => {
          setSelectedAccount(null);
          setNewName("");
        },
      },
    );
  };

  const handleRefresh = () => {
    refetchAccounts();
    toast({
      title: "Refreshing",
      description: "Account list is being refreshed",
    });
  };

  const clearForm = () => {
    setSelectedAccount(null);
    setNewName("");
  };

  return (
    <Page>
      <div className="w-full mx-auto ">
        <div className="flex flex-col gap-2  justify-center">
          <NotesCard />
          <ChangeLedgerForm
            accountNames={accountNames}
            isAccountNamesLoading={isAccountNamesLoading}
            selectedAccount={selectedAccount}
            setSelectedAccount={setSelectedAccount}
            newName={newName}
            setNewName={setNewName}
            isSubmitting={changeMutation.isPending}
            handleSubmit={handleSubmit}
            handleRefresh={handleRefresh}
            clearForm={clearForm}
          />
        </div>
      </div>
    </Page>
  );
};

export default ChangeLedgerPage;
