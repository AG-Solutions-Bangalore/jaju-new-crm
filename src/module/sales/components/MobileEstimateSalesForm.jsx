import React from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const MobileEstimateSalesForm = ({
  form,
  itemEntries,
  handleItemChange,
  addItemEntry,
  removeItemEntry,
  handleChargeChange,
  handleAdvanceChange,
  handleCancel,
  handleFormSubmit,
  productTypeGroup,
  productOptions,
  typeOptions,
  handleKeyDown,
  refetchProducts,
  isLoadingItems,
  isSubmitting,
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
            <h1 className="text-base font-bold">Add Estimate Sales</h1>
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
                <Label htmlFor="mob_est_sales_date">Date</Label>
                <Input
                  id="mob_est_sales_date"
                  type="date"
                  {...form.register("sales_date")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_customer">Customer Name</Label>
                <Input
                  id="mob_est_sales_customer"
                  {...form.register("sales_customer")}
                  className="mt-1 bg-white"
                  placeholder="Enter customer name"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_mobile">Mobile No</Label>
                <Input
                  id="mob_est_sales_mobile"
                  {...form.register("sales_mobile")}
                  className="mt-1 bg-white"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_address">Address</Label>
                <Input
                  id="mob_est_sales_address"
                  {...form.register("sales_address")}
                  className="mt-1 bg-white"
                  placeholder="Enter address"
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_item_type">Item Type</Label>
                <SelectShadcn
                  id="mob_est_sales_item_type"
                  value={form.watch("sales_item_type")}
                  onValueChange={(value) => {
                    form.setValue("sales_item_type", value);
                    refetchProducts();
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select item type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Item Types</SelectLabel>
                      {productTypeGroup.map((type) => (
                        <SelectItem
                          key={type.product_type_group}
                          value={type.product_type_group}
                        >
                          {type.product_type_group}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </SelectShadcn>
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
                    <div className="grid grid-cols-2 gap-1 mb-1">
                      <div className="col-span-1">
                        <SelectShadcn
                          value={entry.estimate_sub_type}
                          onValueChange={(value) =>
                            handleItemChange(index, "estimate_sub_type", value)
                          }
                        >
                          <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Item Types</SelectLabel>
                              {typeOptions.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </SelectShadcn>
                      </div>
                      <div className="col-span-1">
                        <Input
                          value={entry.estimate_sub_item}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_item", e.target.value)
                          }
                          className="h-9 text-sm bg-white"
                          placeholder="Item Name"
                          maxLength={20}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <div className="col-span-2">
                        {isLoadingItems ? (
                          <div className="h-9 bg-gray-200 rounded animate-pulse w-full"></div>
                        ) : (
                          <MemoizedProductSelect
                            value={entry.sales_sub_item_original}
                            onChange={(value) =>
                              handleItemChange(index, "sales_sub_item_original", value)
                            }
                            options={productOptions}
                            placeholder="Select original item"
                          />
                        )}
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_qnty || ""}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_qnty", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          className="h-9 text-sm text-right bg-white"
                          placeholder="Qty (pcs)"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 mt-1">
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_qnty_sqr || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "estimate_sub_qnty_sqr",
                              e.target.value
                            )
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          className="h-9 text-sm text-right bg-white"
                          placeholder="Qty (sqft)"
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_rate || ""}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_rate", e.target.value)
                          }
                          maxLength={10}
                          onKeyDown={handleKeyDown}
                          className="h-9 text-sm text-right bg-white"
                          placeholder="Rate"
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_amount || ""}
                          disabled
                          className="h-9 bg-gray-100 text-right text-sm"
                          placeholder="Amount"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItemEntry(index)}
                      disabled={itemEntries.length <= 1}
                      className="h-7 w-7 hover:bg-gray-200 text-red-500"
                    >
                      <Minus className="h-3 w-3" />
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
                <Label htmlFor="mob_est_sales_tax">Tax</Label>
                <Input
                  id="mob_est_sales_tax"
                  type="tel"
                  {...form.register("sales_tax")}
                  onChange={(e) => handleChargeChange("sales_tax", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_tempo">Tempo Charges</Label>
                <Input
                  id="mob_est_sales_tempo"
                  type="tel"
                  {...form.register("sales_tempo")}
                  onChange={(e) => handleChargeChange("sales_tempo", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_loading">Loading Charges</Label>
                <Input
                  id="mob_est_sales_loading"
                  type="tel"
                  {...form.register("sales_loading")}
                  onChange={(e) => handleChargeChange("sales_loading", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_unloading">Unloading Charges</Label>
                <Input
                  id="mob_est_sales_unloading"
                  type="tel"
                  {...form.register("sales_unloading")}
                  onChange={(e) => handleChargeChange("sales_unloading", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_other">Other Charges</Label>
                <Input
                  id="mob_est_sales_other"
                  type="tel"
                  {...form.register("sales_other")}
                  onChange={(e) => handleChargeChange("sales_other", e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="mob_est_sales_advance">Advance Received</Label>
                <Input
                  id="mob_est_sales_advance"
                  type="tel"
                  value={form.watch("sales_advance") || ""}
                  onChange={(e) => handleAdvanceChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mt-1 text-right bg-white"
                  placeholder="0"
                />
              </div>
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

export default MobileEstimateSalesForm;
