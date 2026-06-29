import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Trash2, UserPlus } from "lucide-react";
import Select from "react-select";
import { selectStyles } from "../utils/selectStyles";

const PaymentEntryRow = ({
  entry,
  index,
  accountNames,
  inputMode,
  onChange,
  onRemove,
  onToggleInputMode,
  onKeyDown,
  amountRef,
  canRemove,
  variant = "desktop",
}) => {
  const isMobile = variant === "mobile";

  return (
    <div
      className={
        isMobile
          ? "bg-white p-2 rounded-md border border-red-100"
          : "grid grid-cols-1 md:grid-cols-12 gap-1 items-end bg-white p-1 rounded-md border border-red-100"
      }
    >
      {isMobile ? (
        <div className="grid grid-cols-12 gap-1 items-center">
          <div className="col-span-11">
            <div className="grid grid-cols-2 gap-1">
              <div className="col-span-1">
                <Input
                  type="text"
                  onKeyDown={onKeyDown}
                  ref={amountRef}
                  value={entry.payment_amount}
                  onChange={(e) => onChange(index, "payment_amount", e.target.value)}
                  className="border-red-200 focus-visible:ring-red-300 h-8 text-sm"
                  placeholder="Amount"
                />
              </div>
              <div className="col-span-1">
                <EntrySelect
                  entry={entry}
                  field="payment_about"
                  index={index}
                  accountNames={accountNames}
                  inputMode={inputMode}
                  onChange={onChange}
                  onToggleInputMode={onToggleInputMode}
                  variant="mobile"
                />
              </div>
            </div>
          </div>
          <div className="col-span-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              tabIndex={-1}
              size="icon"
              onClick={() => onRemove(index)}
              disabled={!canRemove}
              className="h-7 w-7 hover:bg-red-100 text-red-500"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="md:col-span-5">
            <Input
              ref={amountRef}
              type="text"
              onKeyDown={onKeyDown}
              value={entry.payment_amount}
              onChange={(e) => onChange(index, "payment_amount", e.target.value)}
              className="border-red-200 focus-visible:ring-red-300"
            />
          </div>
          <div className="md:col-span-6">
            <EntrySelect
              entry={entry}
              field="payment_about"
              index={index}
              accountNames={accountNames}
              inputMode={inputMode}
              onChange={onChange}
              onToggleInputMode={onToggleInputMode}
              variant="desktop"
            />
          </div>
          <div className="md:col-span-1 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              tabIndex={-1}
              onClick={() => onRemove(index)}
              disabled={!canRemove}
              className="hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const EntrySelect = ({
  entry,
  field,
  index,
  accountNames,
  inputMode,
  onChange,
  onToggleInputMode,
  variant,
}) => {
  const inputClass =
    variant === "mobile"
      ? "border-red-200 focus-visible:ring-red-300 h-8 text-sm"
      : "border-red-200 focus-visible:ring-red-300 flex-1";
  const selectClass =
    variant === "mobile"
      ? "text-xs flex-1"
      : "react-select-container text-sm flex-1";

  const mobileOverrideStyles =
    variant === "mobile"
      ? {
          control: (base) => ({ ...base, minHeight: "32px", height: "32px" }),
          valueContainer: (base) => ({ ...base, height: "32px", padding: "0 6px" }),
          dropdownIndicator: (base) => ({ ...base, padding: "4px" }),
        }
      : {};

  return (
    <div className="flex">
      {inputMode[index] ? (
        <Input
          value={entry[field]}
          onChange={(e) => onChange(index, field, e.target.value)}
          className={inputClass}
          placeholder="Account name"
        />
      ) : (
        <Select
          options={accountNames.map((account) => ({
            value: account.account_name,
            label: account.account_name,
          }))}
          value={
            accountNames.find((account) => account.account_name === entry[field])
              ? { value: entry[field], label: entry[field] }
              : null
          }
          onChange={(selected) => onChange(index, field, selected?.value || "")}
          styles={{ ...selectStyles, ...mobileOverrideStyles }}
          className={selectClass}
          classNamePrefix="react-select"
          placeholder={variant === "mobile" ? "Account" : "Select account..."}
          isClearable
        />
      )}
      <button
        type="button"
        title="Add New Account"
        tabIndex={-1}
        onClick={() => onToggleInputMode(index)}
        className={variant === "mobile" ? "hover:bg-green-100 text-blue-500" : "hover:bg-red-100 text-blue-500"}
      >
        {variant === "mobile" ? (
          <UserPlus className="h-3 w-5" />
        ) : (
          <UserPlus className="h-4 w-6" />
        )}
      </button>
    </div>
  );
};

export default PaymentEntryRow;
