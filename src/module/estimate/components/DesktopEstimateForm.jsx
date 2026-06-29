import React from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DesktopEstimateForm = ({
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
    <div className="hidden sm:block">
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <CardTitle>Add Estimate</CardTitle>
            </div>
            <div className="text-sm font-medium">
              Estimate Ref: <span className="font-bold">{estimateRef}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-2">
            {/* Customer Information */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="estimate_date">
                  Date <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="estimate_date"
                  type="date"
                  {...form.register("estimate_date")}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate_customer">
                  Customer Name <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="estimate_customer"
                  {...form.register("estimate_customer")}
                  className="bg-white"
                  placeholder="Enter customer name"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimate_mobile">Mobile No</Label>
                <Input
                  id="estimate_mobile"
                  {...form.register("estimate_mobile")}
                  className="bg-white"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimate_item_type">
                  Item Type <span className="text-xs text-red-400 ">*</span>
                </Label>
                <SelectShadcn
                  id="estimate_item_type"
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
              <div className="space-y-2 col-span-2 lg:col-span-4">
                <Label htmlFor="estimate_address">Address</Label>
                <Input
                  id="estimate_address"
                  {...form.register("estimate_address")}
                  className="bg-white"
                  placeholder="Enter address"
                  maxLength={200}
                />
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Items</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-sm">
                        Type <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm">
                        Item <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm">
                        Qnty (pcs) <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm">
                        Qnty (sqr) <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm">
                        Rate <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm">
                        Amount
                      </th>
                      <th className="text-left p-2 font-medium text-sm"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemEntries.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <SelectShadcn
                            value={entry.estimate_sub_type}
                            onValueChange={(value) =>
                              handleItemChange(index, "estimate_sub_type", value)
                            }
                          >
                            <SelectTrigger className="w-[8rem] bg-white">
                              <SelectValue placeholder="Select type" />
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
                        </td>
                        <td className="p-2">
                          <Input
                            value={entry.estimate_sub_item}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "estimate_sub_item",
                                e.target.value
                              )
                            }
                            className="h-9"
                            placeholder="Item Name"
                            maxLength={20}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_qnty}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "estimate_sub_qnty",
                                e.target.value
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="h-9"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td>
                        <td className="p-2">
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
                            className="h-9"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_rate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "estimate_sub_rate",
                                e.target.value
                              )
                            }
                            onKeyDown={handleKeyDown}
                            className="h-9"
                            placeholder="0"
                            maxLength={10}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_amount}
                            disabled
                            className="h-9 bg-gray-100"
                            placeholder="0"
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItemEntry(index)}
                            disabled={itemEntries.length <= 1}
                            className="h-9 w-9 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addItemEntry}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            {/* Charges and Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spacer container to match layout */}
              <div className="border-none rounded-lg p-3 bg-white"></div>

              {/* Totals and Charges */}
              <div className="border rounded-lg p-3 bg-white">
                <div className="grid grid-cols-1 gap-2">
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_tax">Tax</Label>
                    <Input
                      className="w-50"
                      id="estimate_tax"
                      type="tel"
                      {...form.register("estimate_tax")}
                      onChange={(e) =>
                        handleChargeChange("estimate_tax", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_tempo">Tempo Charges</Label>
                    <Input
                      className="w-50"
                      id="estimate_tempo"
                      type="tel"
                      {...form.register("estimate_tempo")}
                      onChange={(e) =>
                        handleChargeChange("estimate_tempo", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_loading">
                      Load/Unload Charges
                    </Label>
                    <Input
                      className="w-50"
                      id="estimate_loading"
                      type="tel"
                      {...form.register("estimate_loading")}
                      onChange={(e) =>
                        handleChargeChange("estimate_loading", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_other">Other Charges 1</Label>
                    <Input
                      className="w-50"
                      id="estimate_other"
                      type="tel"
                      {...form.register("estimate_other")}
                      onChange={(e) =>
                        handleChargeChange("estimate_other", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_other1">Other Charges 2</Label>
                    <Input
                      className="w-50"
                      id="estimate_other1"
                      type="tel"
                      {...form.register("estimate_other1")}
                      onChange={(e) =>
                        handleChargeChange("estimate_other1", e.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_gross">Gross Total</Label>
                    <Input
                      className="w-50 bg-gray-100"
                      id="estimate_gross"
                      type="tel"
                      {...form.register("estimate_gross")}
                      disabled
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_advance">Advance</Label>
                    <Input
                      className="w-50"
                      id="estimate_advance"
                      type="tel"
                      {...form.register("estimate_advance")}
                      onChange={(e) => handleAdvanceChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      maxLength={10}
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_balance">Balance</Label>
                    <Input
                      className="w-50 bg-gray-100"
                      id="estimate_balance"
                      type="tel"
                      {...form.register("estimate_balance")}
                      disabled
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-x-2 flex items-center justify-between gap-2">
                    <Label htmlFor="estimate_temp_amount">Amount</Label>
                    <Input
                      className="w-50"
                      id="estimate_temp_amount"
                      type="tel"
                      {...form.register("estimate_temp_amount")}
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white"
              >
                {isSubmitting ? "Saving..." : "Save Estimate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopEstimateForm;
