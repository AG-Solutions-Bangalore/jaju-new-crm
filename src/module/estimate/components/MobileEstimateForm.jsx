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

const MobileEstimateForm = ({
  form,
  itemEntries,
  handleItemChange,
  addItemEntry,
  removeItemEntry,
  handleChargeChange,
  handleAdvanceChange,
  handleCancel,
  handleFormSubmit,
  estimateRef,
  productTypeGroup,
  handleKeyDown,
  typeOptions,
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
            <h1 className="text-base font-bold">Add Estimate</h1>
          </button>
          <div className="text-sm font-medium">
            Ref: <span className="font-bold">{estimateRef}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 border border-green-100 rounded-md p-2">
            <p className="text-xs text-green-800 font-medium">Gross</p>
            <p className="text-sm font-bold">
              {form.watch("estimate_gross") || 0}
            </p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-md p-2">
            <p className="text-xs text-red-800 font-medium">Balance</p>
            <p className="text-sm font-bold">
              {form.watch("estimate_balance") || 0}
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
                <Label htmlFor="mob_estimate_date">Date</Label>
                <Input
                  id="mob_estimate_date"
                  type="date"
                  {...form.register("estimate_date")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_customer">Customer Name</Label>
                <Input
                  id="mob_estimate_customer"
                  {...form.register("estimate_customer")}
                  className="mt-1"
                  placeholder="Enter customer name"
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_mobile">Mobile No</Label>
                <Input
                  id="mob_estimate_mobile"
                  {...form.register("estimate_mobile")}
                  className="mt-1"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_address">Address</Label>
                <Input
                  id="mob_estimate_address"
                  {...form.register("estimate_address")}
                  className="mt-1"
                  placeholder="Enter address"
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_item_type">Item Type</Label>
                <SelectShadcn
                  id="mob_estimate_item_type"
                  value={form.watch("estimate_item_type")}
                  onValueChange={(value) =>
                    form.setValue("estimate_item_type", value)
                  }
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
                          className="h-8 text-sm bg-white"
                          placeholder="Item Name"
                          maxLength={20}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_qnty}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_qnty", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white"
                          placeholder="Qnty (pcs)"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_qnty_sqr}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "estimate_sub_qnty_sqr",
                              e.target.value
                            )
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white"
                          placeholder="Qnty (sqr)"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <Input
                          type="tel"
                          value={entry.estimate_sub_rate}
                          onChange={(e) =>
                            handleItemChange(index, "estimate_sub_rate", e.target.value)
                          }
                          onKeyDown={handleKeyDown}
                          className="h-8 text-sm bg-white"
                          placeholder="Rate"
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div className="mt-1">
                      <Input
                        type="tel"
                        value={entry.estimate_sub_amount}
                        disabled
                        onKeyDown={handleKeyDown}
                        className="h-8 text-sm bg-gray-100"
                        placeholder="Amount"
                      />
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
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Charges</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="mob_estimate_tax">Tax</Label>
                <Input
                  id="mob_estimate_tax"
                  type="tel"
                  {...form.register("estimate_tax")}
                  onChange={(e) =>
                    handleChargeChange("estimate_tax", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_tempo">Tempo Charges</Label>
                <Input
                  id="mob_estimate_tempo"
                  type="tel"
                  {...form.register("estimate_tempo")}
                  onChange={(e) =>
                    handleChargeChange("estimate_tempo", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_loading">Loading Charges</Label>
                <Input
                  id="mob_estimate_loading"
                  type="tel"
                  {...form.register("estimate_loading")}
                  onChange={(e) =>
                    handleChargeChange("estimate_loading", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_other">Other Charges 1</Label>
                <Input
                  id="mob_estimate_other"
                  type="tel"
                  {...form.register("estimate_other")}
                  onChange={(e) =>
                    handleChargeChange("estimate_other", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_other1">Other Charges 2</Label>
                <Input
                  id="mob_estimate_other1"
                  type="tel"
                  {...form.register("estimate_other1")}
                  onChange={(e) =>
                    handleChargeChange("estimate_other1", e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="font-medium mb-3">Totals</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="mob_estimate_gross">Gross Total</Label>
                <Input
                  id="mob_estimate_gross"
                  type="tel"
                  {...form.register("estimate_gross")}
                  disabled
                  onKeyDown={handleKeyDown}
                  className="mt-1 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_advance">Advance</Label>
                <Input
                  id="mob_estimate_advance"
                  type="tel"
                  onKeyDown={handleKeyDown}
                  {...form.register("estimate_advance")}
                  onChange={(e) => handleAdvanceChange(e.target.value)}
                  className="mt-1"
                  maxLength={10}
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_balance">Balance</Label>
                <Input
                  id="mob_estimate_balance"
                  type="tel"
                  {...form.register("estimate_balance")}
                  disabled
                  onKeyDown={handleKeyDown}
                  className="mt-1 bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="mob_estimate_temp_amount">Amount</Label>
                <Input
                  id="mob_estimate_temp_amount"
                  type="tel"
                  {...form.register("estimate_temp_amount")}
                  onKeyDown={handleKeyDown}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Mobile bottom buttons */}
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

export default MobileEstimateForm;
