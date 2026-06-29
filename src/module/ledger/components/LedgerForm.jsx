import React from "react";
import Select from "react-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";

const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "36px",
    height: "36px",
    borderRadius: "0.375rem",
    borderColor: "hsl(var(--input))",
    backgroundColor: "hsl(var(--background))",
    boxShadow: "none",
    "&:hover": {
      borderColor: "hsl(var(--input))",
    },
    "&:focus-within": {
      borderColor: "hsl(var(--ring))",
      boxShadow: "0 0 0 2px hsl(var(--ring))",
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: "0",
    padding: "0",
    color: "hsl(var(--foreground))",
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "36px",
    padding: "0 6px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    padding: "4px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    border: "1px solid hsl(var(--border))",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
      ? "hsl(var(--accent))"
      : "hsl(var(--background))",
    color: state.isSelected
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--foreground))",
    "&:hover": {
      backgroundColor: "hsl(var(--accent))",
      color: "hsl(var(--accent-foreground))",
    },
  }),
};

const LedgerForm = ({
  form,
  onSubmit,
  accountNames,
  isLoading,
  layout = "desktop",
}) => {
  const watchAccountName = form.watch("account_name");
  const watchFromDate = form.watch("from_date");
  const watchToDate = form.watch("to_date");

  const options = accountNames.map((account) => ({
    value: account.account_name,
    label: account.account_name,
  }));

  const selectedValue = options.find((opt) => opt.value === watchAccountName) || null;

  if (layout === "mobile") {
    return (
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-white p-2 rounded-md shadow-xs"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 col-span-2">
            <Label htmlFor="mobile_account_name" className="text-xs">
              Account Name
            </Label>
            <Select
              id="mobile_account_name"
              options={options}
              value={selectedValue}
              onChange={(selected) =>
                form.setValue("account_name", selected?.value || "")
              }
              styles={selectStyles}
              className="react-select-container text-xs"
              classNamePrefix="react-select"
              placeholder="Select account..."
              isClearable
              required
            />
            {form.formState.errors.account_name && (
              <p className="text-xs text-red-500">
                {form.formState.errors.account_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="mobile_from_date" className="text-xs">
              From Date
            </Label>
            <input
              id="mobile_from_date"
              type="date"
              {...form.register("from_date")}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={watchFromDate}
              onChange={(e) => form.setValue("from_date", e.target.value)}
            />
            {form.formState.errors.from_date && (
              <p className="text-xs text-red-500">
                {form.formState.errors.from_date.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="mobile_to_date" className="text-xs">
              To Date
            </Label>
            <input
              id="mobile_to_date"
              type="date"
              {...form.register("to_date")}
              className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={watchToDate}
              onChange={(e) => form.setValue("to_date", e.target.value)}
            />
            {form.formState.errors.to_date && (
              <p className="text-xs text-red-500">
                {form.formState.errors.to_date.message}
              </p>
            )}
          </div>

          <div className="col-span-2 pt-1">
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-8 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Generating...
                </>
              ) : (
                <>
                  <Search className="h-3 w-3 mr-1" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Desktop view
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full"
    >
      <div className="space-y-1">
        <Label
          htmlFor="desktop_account_name"
          className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
        >
          Account Name
        </Label>
        <Select
          id="desktop_account_name"
          options={options}
          value={selectedValue}
          onChange={(selected) =>
            form.setValue("account_name", selected?.value || "")
          }
          styles={selectStyles}
          className="react-select-container text-xs"
          classNamePrefix="react-select"
          placeholder="Select account..."
          isClearable
        />
        {form.formState.errors.account_name && (
          <p className="text-xs text-red-500">
            {form.formState.errors.account_name.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="desktop_from_date"
          className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
        >
          From Date
        </Label>
        <Input
          id="desktop_from_date"
          type="date"
          {...form.register("from_date")}
          className="h-8 text-xs bg-white"
        />
        {form.formState.errors.from_date && (
          <p className="text-xs text-red-500">
            {form.formState.errors.from_date.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label
          htmlFor="desktop_to_date"
          className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}
        >
          To Date
        </Label>
        <Input
          id="desktop_to_date"
          type="date"
          {...form.register("to_date")}
          className="h-8 text-xs bg-white"
        />
        {form.formState.errors.to_date && (
          <p className="text-xs text-red-500">
            {form.formState.errors.to_date.message}
          </p>
        )}
      </div>

      <div className="md:col-span-3 flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className={`h-8 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Generating...
            </>
          ) : (
            <>
              <Search className="h-3 w-3 mr-1" />
              Generate
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default LedgerForm;
