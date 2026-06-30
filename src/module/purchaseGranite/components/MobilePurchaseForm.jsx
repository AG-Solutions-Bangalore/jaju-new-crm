import React from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import NotInListIcon from "@/components/common/NotInListIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const MobilePurchaseForm = ({
  form,
  itemEntries,
  handleItemChange,
  addItemEntry,
  removeItemEntry,
  handleChargeChange,
  handleTaxChange,
  handleRoundOffChange,
  handleCancel,
  handleFormSubmit,
  productOptions,
  handleKeyDown,
  loadingType,
  setLoadingType,
  calculateAndSetTotals,
  amountToBePaid,
  displayGrandTotal,
  customItems,
  isCustomItem,
  handleCustomItemChange,
  handleToggleCustomItem,
  isSubmitting,
  title = "Add Purchases",
}) => {
  return (
    <div className="sm:hidden">
      {/* Mobile Sticky Header */}
      <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-2 mb-2">
        <div className="flex justify-between items-center mb-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center text-blue-800"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <h1 className="text-base font-bold">{title}</h1>
          </button>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-md p-2">
          <p className="text-xs text-green-800 font-medium">Amount to be Paid</p>
          <p className="text-sm font-bold text-green-900">
            {Number(amountToBePaid).toFixed(0) || 0}
          </p>
        </div>
      </div>

      <div className="mb-14">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Purchase Info */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Purchase Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="mob_purchase_date">Date</Label>
                <Input
                  id="mob_purchase_date"
                  type="date"
                  {...form.register("purchase_date")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mob_purchase_supplier">
                  Supplier <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="mob_purchase_supplier"
                  {...form.register("purchase_supplier")}
                  className="mt-1 bg-white"
                  placeholder="Enter Supplier Name"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="mob_purchase_bill_no">
                  JFC Bill No <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="mob_purchase_bill_no"
                  {...form.register("purchase_bill_no")}
                  className="mt-1 bg-white"
                  placeholder="Enter Bill Number"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Items</h3>
            </div>
            {itemEntries.map((entry, index) => (
              <div
                key={index}
                className="bg-gray-50 p-2 rounded-md border border-gray-200 mb-2"
              >
                <div className="grid grid-cols-12 gap-1 items-center">
                  <div className="col-span-11">
                    <div className="flex gap-1 mb-1">
                      {isCustomItem[index] ? (
                        <>
                          <div className="flex-1">
                            <Input
                              type="text"
                              className="h-8 text-sm uppercase placeholder:normal-case bg-white"
                              placeholder="Enter Item Name"
                              value={customItems[index] || ""}
                              onChange={(e) =>
                                handleCustomItemChange(
                                  index,
                                  e.target.value.toUpperCase()
                                )
                              }
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs whitespace-nowrap shrink-0"
                            onClick={() => handleToggleCustomItem(index)}
                          >
                            Select
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <MemoizedProductSelect
                              value={entry.purchase_sub_item}
                              onChange={(value) =>
                                handleItemChange(index, "purchase_sub_item", value)
                              }
                              options={productOptions}
                              placeholder="Select item..."
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs whitespace-nowrap shrink-0"
                            onClick={() => handleToggleCustomItem(index)}
                          >
                            <NotInListIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <Input
                          type="tel"
                          value={entry.purchase_sub_qnty || entry.purchase_sub_pcs || ""}
                          onChange={(e) =>
                            handleItemChange(index, "purchase_sub_qnty", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm text-right bg-white"
                          placeholder="Qnty (pcs)"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.purchase_sub_qnty_sqr || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "purchase_sub_qnty_sqr",
                              e.target.value
                            )
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm text-right bg-white"
                          placeholder="Qnty (sqft)"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.purchase_sub_rate || ""}
                          onChange={(e) =>
                            handleItemChange(index, "purchase_sub_rate", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm text-right bg-white"
                          placeholder="Rate"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="mt-1">
                      <Input
                        type="tel"
                        value={entry.purchase_sub_amount || ""}
                        disabled
                        onKeyDown={handleKeyDown}
                        className="h-8 text-sm bg-gray-100 text-right"
                        placeholder="Amount"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemEntry(index, entry.id)}
                      disabled={itemEntries.length <= 1}
                      className="h-7 w-7 hover:bg-gray-200 text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItemEntry}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-xs h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Charges */}
          <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
            <div>
              <Label>Labour Charges</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <SelectShadcn
                  value={loadingType}
                  onValueChange={(val) => {
                    setLoadingType(val);
                    if (val === "Loading Only") {
                      form.setValue("purchase_unloading", "");
                    } else {
                      form.setValue("purchase_loading", "");
                    }
                    calculateAndSetTotals(itemEntries);
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Loading Only">Loading Only</SelectItem>
                    <SelectItem value="Loading & Unloading">
                      Loading & Unloading
                    </SelectItem>
                  </SelectContent>
                </SelectShadcn>
                <Input
                  id={
                    loadingType === "Loading Only"
                      ? "purchase_loading"
                      : "purchase_unloading"
                  }
                  type="tel"
                  value={
                    form.watch(
                      loadingType === "Loading Only"
                        ? "purchase_loading"
                        : "purchase_unloading"
                    ) || ""
                  }
                  onChange={(e) =>
                    handleChargeChange(
                      loadingType === "Loading Only"
                        ? "purchase_loading"
                        : "purchase_unloading",
                      e.target.value
                    )
                  }
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                  className="text-right bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mob_purchase_tempo">Tempo Charges</Label>
              <Input
                id="mob_purchase_tempo"
                type="tel"
                {...form.register("purchase_tempo")}
                onChange={(e) =>
                  handleChargeChange("purchase_tempo", e.target.value)
                }
                onKeyDown={handleKeyDown}
                className="mt-1 text-right bg-white"
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <Label>Other Charges 1</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Other Label 1"
                  {...form.register("purchase_other_label")}
                  className="bg-white"
                />
                <Input
                  id="mob_purchase_other"
                  type="tel"
                  {...form.register("purchase_other")}
                  onChange={(e) =>
                    handleChargeChange("purchase_other", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="text-right bg-white"
                  placeholder="0"
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Other Charges 2</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Other Label 2"
                  {...form.register("purchase_other1_label")}
                  className="bg-white"
                />
                <Input
                  id="mob_purchase_other1"
                  type="tel"
                  {...form.register("purchase_other1")}
                  onChange={(e) =>
                    handleChargeChange("purchase_other1", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="text-right bg-white"
                  placeholder="0"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <Label>Gross Total</Label>
              <Input
                type="text"
                value={Number(displayGrandTotal).toFixed(0)}
                disabled
                className="mt-1 bg-gray-100 font-medium text-right"
              />
            </div>

            <div>
              <Label>Tax Amount</Label>
              <Input
                type="tel"
                {...form.register("purchase_tax")}
                onChange={handleTaxChange}
                className="mt-1 text-right bg-white"
                maxLength={10}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Net Total</Label>
              <Input
                type="tel"
                {...form.register("purchase_temp_amount")}
                onKeyDown={handleKeyDown}
                className="mt-1 text-right font-medium bg-gray-100"
                maxLength={10}
                placeholder="0"
                readOnly
              />
            </div>

            <div>
              <Label>Round Off</Label>
              <Input
                type="text"
                {...form.register("purchase_amount_round")}
                onChange={handleRoundOffChange}
                className="mt-1 text-right font-medium bg-white"
                maxLength={10}
                placeholder="0"
              />
            </div>

            <div>
              <Label className="font-semibold text-blue-900">Amount to be Paid</Label>
              <Input
                type="text"
                value={Number(amountToBePaid).toFixed(0)}
                disabled
                className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md"
              />
            </div>

            <div>
              <Label>Final Amount Paid</Label>
              <Input
                type="tel"
                {...form.register("purchase_amount_received")}
                onKeyDown={handleKeyDown}
                className="mt-1 text-right bg-white"
                maxLength={10}
                placeholder="0"
              />
            </div>
          </div>

          {/* Bottom buttons */}
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
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-xs h-9 text-white"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobilePurchaseForm;
