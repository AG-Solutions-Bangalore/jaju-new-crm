import React from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import NotInListIcon from "@/components/common/NotInListIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const MobileSalesForm = ({
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
  amountToBeCollected,
  displayGrandTotal,
  autoGst18,
  customItems,
  isCustomItem,
  handleCustomItemChange,
  handleToggleCustomItem,
  isSubmitting,
  title = "Add Sales",
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
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 border border-green-100 rounded-md p-2">
            <p className="text-xs text-green-800 font-medium">Gross</p>
            <p className="text-sm font-bold">
              {form.watch("sales_gross") || 0}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-md p-2">
            <p className="text-xs text-red-800 font-medium">Balance</p>
            <p className="text-sm font-bold">
              {form.watch("sales_balance") || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-14">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Customer Info */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="mob_sales_no">JFC Bill No</Label>
                <Input
                  id="mob_sales_no"
                  {...form.register("sales_no")}
                  className="mt-1 uppercase placeholder:normal-case bg-gray-100"
                  placeholder="Auto-generated"
                  maxLength={50}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="mob_sales_date">Date</Label>
                <Input
                  id="mob_sales_date"
                  type="date"
                  {...form.register("sales_date")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mob_sales_customer">Customer Name</Label>
                <Input
                  id="mob_sales_customer"
                  {...form.register("sales_customer")}
                  className="mt-1 uppercase placeholder:normal-case bg-white"
                  placeholder="Enter Customer Name"
                  maxLength={50}
                  onChange={(e) => {
                    form.setValue("sales_customer", e.target.value.toUpperCase());
                  }}
                />
              </div>
              <div>
                <Label htmlFor="mob_sales_mobile">Mobile No</Label>
                <Input
                  id="mob_sales_mobile"
                  {...form.register("sales_mobile")}
                  className="mt-1 uppercase placeholder:normal-case bg-white"
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    form.setValue("sales_mobile", e.target.value.toUpperCase());
                  }}
                />
              </div>
              <div>
                <Label htmlFor="mob_sales_address">Address</Label>
                <Textarea
                  id="mob_sales_address"
                  {...form.register("sales_address")}
                  className="mt-1 uppercase placeholder:normal-case bg-white"
                  placeholder="Enter Address"
                  maxLength={200}
                  onChange={(e) => {
                    form.setValue("sales_address", e.target.value.toUpperCase());
                  }}
                  rows={2}
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
                              value={entry.sales_sub_item}
                              onChange={(value) =>
                                handleItemChange(index, "sales_sub_item", value)
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
                    <div className="grid grid-cols-2 mt-1 gap-1">
                      <div>
                        <Input
                          type="tel"
                          value={entry.sales_sub_qnty || entry.sales_sub_pcs || ""}
                          onChange={(e) =>
                            handleItemChange(index, "sales_sub_qnty", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm text-right bg-white"
                          placeholder="Qnty (pcs/box)"
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.sales_sub_qnty_sqr || ""}
                          onChange={(e) =>
                            handleItemChange(index, "sales_sub_qnty_sqr", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm text-right bg-white"
                          placeholder="Qnty (sqft)"
                        />
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-1 mt-1">
                        <div>
                          <Input
                            type="tel"
                            value={entry.sales_sub_rate || ""}
                            onChange={(e) =>
                              handleItemChange(index, "sales_sub_rate", e.target.value)
                            }
                            maxLength={10}
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm text-right bg-white"
                            placeholder="Rate"
                          />
                        </div>
                        <div>
                          <Input
                            type="tel"
                            value={entry.sales_sub_amount || ""}
                            disabled
                            onKeyDown={handleKeyDown}
                            className="h-8 text-sm bg-gray-100 text-right"
                            placeholder="Amount"
                          />
                        </div>
                      </div>
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
          <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-4">
            <h3 className="font-medium">Charges & Totals</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="mob_sales_tempo">Tempo Charges</Label>
                <Input
                  id="mob_sales_tempo"
                  type="tel"
                  {...form.register("sales_tempo")}
                  onChange={(e) =>
                    handleChargeChange("sales_tempo", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Labour Charges</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <SelectShadcn
                    value={loadingType}
                    onValueChange={(val) => {
                      setLoadingType(val);
                      if (val === "Loading Only") {
                        form.setValue("sales_unloading", "");
                      } else {
                        form.setValue("sales_loading", "");
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
                        ? "sales_loading"
                        : "sales_unloading"
                    }
                    type="tel"
                    value={
                      form.watch(
                        loadingType === "Loading Only"
                          ? "sales_loading"
                          : "sales_unloading"
                      ) || ""
                    }
                    onChange={(e) =>
                      handleChargeChange(
                        loadingType === "Loading Only"
                          ? "sales_loading"
                          : "sales_unloading",
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
            </div>

            <div className="space-y-1">
              <Label>Other Charges 1</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Custom Label 1"
                  {...form.register("sales_other_label")}
                  className="bg-white"
                />
                <Input
                  id="mob_sales_other"
                  type="tel"
                  {...form.register("sales_other")}
                  onChange={(e) =>
                    handleChargeChange("sales_other", e.target.value)
                  }
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                  className="text-right bg-white"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Other Charges 2</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="text"
                  placeholder="Custom Label 2"
                  {...form.register("sales_other1_label")}
                  className="bg-white"
                />
                <Input
                  id="mob_sales_other1"
                  type="tel"
                  {...form.register("sales_other1")}
                  onChange={(e) =>
                    handleChargeChange("sales_other1", e.target.value)
                  }
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                  className="text-right bg-white"
                  placeholder="0"
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
                {...form.register("sales_tax")}
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
                {...form.register("sales_temp_amount")}
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
                {...form.register("sales_amount_round")}
                onChange={handleRoundOffChange}
                className="mt-1 text-right font-medium bg-white"
                maxLength={10}
                placeholder="0"
              />
            </div>

            <div>
              <Label className="font-semibold text-blue-900">
                Amount to be Collected
              </Label>
              <Input
                type="text"
                value={Number(amountToBeCollected).toFixed(0)}
                disabled
                className="mt-1 bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md"
              />
            </div>

            <div>
              <Label>Final Amount Received</Label>
              <Input
                type="tel"
                {...form.register("sales_amount_received")}
                onKeyDown={handleKeyDown}
                className="mt-1 text-right bg-white"
                maxLength={10}
                placeholder="0"
              />
            </div>
          </div>

          {/* Action Buttons */}
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

export default MobileSalesForm;
