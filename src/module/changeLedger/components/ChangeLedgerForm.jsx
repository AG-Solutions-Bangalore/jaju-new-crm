import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Select from "react-select";
import { Loader2, RefreshCw } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import { selectStyles } from "../utils/selectStyles";

const ChangeLedgerForm = ({
  accountNames,
  isAccountNamesLoading,
  selectedAccount,
  setSelectedAccount,
  newName,
  setNewName,
  isSubmitting,
  handleSubmit,
  handleRefresh,
  clearForm,
}) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle>Change Account Name</CardTitle>
          <CardDescription>
            Update existing ledger account name
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isAccountNamesLoading}
          className="h-8 w-8"
        >
          <RefreshCw
            className={`h-4 w-4 ${isAccountNamesLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="oldAccount">Select Account</Label>
              {isAccountNamesLoading ? (
                <div className="flex items-center justify-center h-10 border border-input rounded-md bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Loading accounts...</span>
                </div>
              ) : (
                <Select
                  id="oldAccount"
                  options={accountNames.map((account) => ({
                    value: account.account_name,
                    label: account.account_name,
                  }))}
                  value={selectedAccount}
                  onChange={setSelectedAccount}
                  styles={selectStyles}
                  placeholder="Select account..."
                  isClearable
                  isSearchable
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newName">New Account Name</Label>
              <Input
                id="newName"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="h-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={clearForm}
              disabled={isSubmitting}
              className="h-9"
            >
              Clear
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !selectedAccount || !newName.trim()}
              className={`h-9 min-w-[130px] ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating
                </>
              ) : (
                "Update Account"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangeLedgerForm;
