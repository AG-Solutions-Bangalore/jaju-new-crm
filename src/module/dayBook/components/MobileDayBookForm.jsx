import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ReceivedEntryRow from "./ReceivedEntryRow";
import PaymentEntryRow from "./PaymentEntryRow";
import DayBookHeader from "./DayBookHeader";
import BalanceAlert from "./BalanceAlert";

const MobileDayBookForm = ({
  activeTab,
  setActiveTab,
  accountNames,
  form,
  receivedEntries,
  paymentEntries,
  receivedInputMode,
  paymentInputMode,
  handleReceivedChange,
  handlePaymentChange,
  toggleReceivedInputMode,
  togglePaymentInputMode,
  addReceivedEntry,
  addPaymentEntry,
  removeReceivedEntry,
  removePaymentEntry,
  receivedAmountRefs,
  paymentAmountRefs,
  keydown,
  balance,
  receivedTotal,
  paymentTotal,
  lastSaveTime,
  refreshDraftsTrigger,
  onSaveDraft,
  onLoadDraft,
  onSubmit,
  handleCancel,
  isSubmitting,
  headerTitle = "Add Day Book",
  buttonLabel = "Save",
  buttonLoadingLabel = "Saving...",
}) => {
  return (
    <div className="sm:hidden">
      <DayBookHeader
        date={form.watch("payment_date")}
        title={headerTitle}
        lastSaveTime={lastSaveTime}
        refreshDraftsTrigger={refreshDraftsTrigger}
        onSaveDraft={onSaveDraft}
        onLoadDraft={onLoadDraft}
        variant="mobile"
      />

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-green-50 border border-green-100 rounded-md p-2">
          <p className="text-xs text-green-800 font-medium">Received</p>
          <p className="text-sm font-bold">{receivedTotal || 0}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-md p-2">
          <p className="text-xs text-red-800 font-medium">Payment</p>
          <p className="text-sm font-bold">{paymentTotal || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === "credit"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("credit")}
          >
            Credit
            {balance < 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px]">
                !
              </span>
            )}
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium ${
              activeTab === "debit"
                ? "border-b-2 border-red-500 text-red-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("debit")}
          >
            Debit
            {balance > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px]">
                !
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Credit Tab */}
      {activeTab === "credit" && (
        <div className="mb-14">
          {receivedEntries.map((entry, index) => (
            <ReceivedEntryRow
              key={index}
              entry={entry}
              index={index}
              accountNames={accountNames}
              inputMode={receivedInputMode}
              onChange={handleReceivedChange}
              onRemove={removeReceivedEntry}
              onToggleInputMode={toggleReceivedInputMode}
              onKeyDown={keydown}
              amountRef={(el) => (receivedAmountRefs.current[index] = el)}
              canRemove={receivedEntries.length > 1}
              variant="mobile"
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addReceivedEntry}
            className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 text-xs h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      )}

      {/* Debit Tab */}
      {activeTab === "debit" && (
        <div className="mb-14">
          {paymentEntries.map((entry, index) => (
            <PaymentEntryRow
              key={index}
              entry={entry}
              index={index}
              accountNames={accountNames}
              inputMode={paymentInputMode}
              onChange={handlePaymentChange}
              onRemove={removePaymentEntry}
              onToggleInputMode={togglePaymentInputMode}
              onKeyDown={keydown}
              amountRef={(el) => (paymentAmountRefs.current[index] = el)}
              canRemove={paymentEntries.length > 1}
              variant="mobile"
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPaymentEntry}
            className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300 text-xs h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      )}

      {/* Balance / Actions */}
      {balance !== 0 ? (
        <BalanceAlert
          balance={balance}
          receivedTotal={receivedTotal}
          paymentTotal={paymentTotal}
          variant="mobile"
        />
      ) : (
        <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-gray-300 hover:bg-gray-100 text-xs h-9"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs h-9"
          >
            {isSubmitting ? buttonLoadingLabel : buttonLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileDayBookForm;
