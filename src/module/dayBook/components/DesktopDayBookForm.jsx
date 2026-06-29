import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import moment from "moment";
import ReceivedEntryRow from "./ReceivedEntryRow";
import PaymentEntryRow from "./PaymentEntryRow";
import DayBookHeader from "./DayBookHeader";
import BalanceAlert from "./BalanceAlert";

const DesktopDayBookForm = ({
  accountNames,
  form,
  selectedDate,
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
}) => {
  return (
    <div className="hidden sm:block">
      <DayBookHeader
        date={form.watch("payment_date")}
        lastSaveTime={lastSaveTime}
        refreshDraftsTrigger={refreshDraftsTrigger}
        onSaveDraft={onSaveDraft}
        onLoadDraft={onLoadDraft}
        variant="desktop"
      />

      <Card className="shadow-sm">
        <CardContent>
          <form className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-2 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="payment_date">Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  {...form.register("payment_date")}
                  disabled={!!selectedDate}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="received_total">Received Total</Label>
                <Input
                  id="received_total"
                  type="text"
                  disabled
                  value={receivedTotal}
                  className="bg-green-50 border-green-200"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="payment_total">Payment Total</Label>
                <Input
                  id="payment_total"
                  type="text"
                  disabled
                  value={paymentTotal}
                  className="bg-red-50 border-red-200"
                />
              </div>
            </div>

            <div className="lg:flex lg:space-x-4 space-y-6 lg:space-y-0">
              {/* Credit Section */}
              <div className="border rounded-lg p-4 flex-1 bg-green-50 border-green-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-green-800">Credit</h3>
                </div>
                <div className="grid grid-cols-12 gap-4 mb-2 px-3">
                  <div className="col-span-5 text-sm font-medium text-green-800">
                    Amount
                  </div>
                  <div className="col-span-6 text-sm font-medium text-green-800">
                    Account
                  </div>
                  <div className="col-span-1"></div>
                </div>
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
                    variant="desktop"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReceivedEntry}
                  className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 mt-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More
                </Button>
              </div>

              {/* Debit Section */}
              <div className="border rounded-lg p-4 flex-1 bg-red-50 border-red-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-red-800">Debit</h3>
                </div>
                <div className="grid grid-cols-12 gap-4 mb-2 px-3">
                  <div className="col-span-5 text-sm font-medium text-red-800">
                    Amount
                  </div>
                  <div className="col-span-6 text-sm font-medium text-red-800">
                    Account
                  </div>
                  <div className="col-span-1"></div>
                </div>
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
                    variant="desktop"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPaymentEntry}
                  className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300 mt-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More
                </Button>
              </div>
            </div>

            {balance !== 0 ? (
              <BalanceAlert
                balance={balance}
                receivedTotal={receivedTotal}
                paymentTotal={paymentTotal}
                variant="desktop"
              />
            ) : (
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopDayBookForm;
