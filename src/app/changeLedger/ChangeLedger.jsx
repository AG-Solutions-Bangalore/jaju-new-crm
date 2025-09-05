import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Select from "react-select";
import { Loader2, RefreshCw } from "lucide-react";
import Page from '../dashboard/page';
import BASE_URL from '@/config/BaseUrl';
import Cookies from 'js-cookie';
import { ButtonConfig } from '@/config/ButtonConfig';

const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "42px",
    height: "42px",
    borderRadius: "0.375rem",
    borderColor: "hsl(var(--input))",
    backgroundColor: "hsl(var(--background))",
    boxShadow: "none",
    "&:hover": { borderColor: "hsl(var(--input))" },
    "&:focus-within": {
      borderColor: "hsl(var(--ring))",
      boxShadow: "0 0 0 2px hsl(var(--ring))",
    },
  }),
  input: (provided) => ({ ...provided, margin: "0", padding: "0", color: "hsl(var(--foreground))" }),
  valueContainer: (provided) => ({ ...provided, height: "42px", padding: "0 8px" }),
  singleValue: (provided) => ({ ...provided, color: "hsl(var(--foreground))" }),
  placeholder: (provided) => ({ ...provided, color: "hsl(var(--muted-foreground))" }),
  dropdownIndicator: (provided) => ({ ...provided, color: "hsl(var(--muted-foreground))", padding: "6px" }),
  indicatorSeparator: () => ({ display: "none" }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
      ? "hsl(var(--accent))"
      : "hsl(var(--background))",
    color: state.isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
    "&:hover": {
      backgroundColor: "hsl(var(--accent))",
      color: "hsl(var(--accent-foreground))",
    },
  }),
};

const ChangeLedger = () => {
  const { toast } = useToast();
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: accountNames = [], isLoading: isAccountNamesLoading, refetch: refetchAccounts } = useQuery({
    queryKey: ["ledgerAccountNames"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(`${BASE_URL}/api/web-fetch-ledger-accountname`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.mix || [];
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAccount) {
      toast({ title: "Error", description: "Please select an account to change", variant: "destructive" });
      return;
    }

    if (!newName.trim()) {
      toast({ title: "Error", description: "Please enter a new name for the account", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.post(
        `${BASE_URL}/api/web-change-ledger-name`,
        { old_name: selectedAccount.value, new_name: newName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.code === 200) {
        toast({ title: "Success", description: "Account name changed successfully" });
        setSelectedAccount(null);
        setNewName('');
        refetchAccounts();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to change account name",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to change account name",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    refetchAccounts();
    toast({ title: "Refreshing", description: "Account list is being refreshed" });
  };

  const clearForm = () => {
    setSelectedAccount(null);
    setNewName('');
  };

  return (
    <Page>
      <div className="w-full mx-auto ">
        <div className="flex flex-col gap-2  justify-center">
          {/* Important Notes Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-1">
              <CardTitle className="text-blue-800 text-lg">Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-1 text-blue-700">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">•</span>
                  Changing an account name will update it across all transactions
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">•</span>
                  This action cannot be undone
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">•</span>
                  Make sure the new name is unique and descriptive
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Change Ledger Form Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Change Account Name</CardTitle>
                <CardDescription>Update existing ledger account name</CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isAccountNamesLoading}
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${isAccountNamesLoading ? 'animate-spin' : ''}`} />
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
                      'Update Account'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default ChangeLedger;