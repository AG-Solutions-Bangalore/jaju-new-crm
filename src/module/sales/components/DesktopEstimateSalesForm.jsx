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
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const DesktopEstimateSalesForm = ({
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
}) => {
  return (
    <div className="hidden sm:block">
      <Card className="shadow-sm bg-white">
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
              <CardTitle>Add Estimate Sales</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            id="est-sales-form"
            onSubmit={handleFormSubmit}
            className="space-y-4"
          >
            {/* Customer Information */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2 bg-blue-50 p-3 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="est_sales_date">
                  Date <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="est_sales_date"
                  type="date"
                  {...form.register("sales_date")}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_sales_customer">
                  Customer Name <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="est_sales_customer"
                  {...form.register("sales_customer")}
                  className="bg-white"
                  placeholder="Enter customer name"
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_sales_mobile">Mobile No</Label>
                <Input
                  id="est_sales_mobile"
                  {...form.register("sales_mobile")}
                  className="bg-white"
                  placeholder="Enter mobile number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_sales_address">Address</Label>
                <Input
                  id="est_sales_address"
                  {...form.register("sales_address")}
                  className="bg-white"
                  placeholder="Enter address"
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="est_sales_item_type">
                  Item Type <span className="text-xs text-red-400 ">*</span>
                </Label>
                <SelectShadcn
                  id="est_sales_item_type"
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

            {/* Items Table */}
            <div className="border rounded-lg p-3 bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Items</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium text-sm w-[100px]">
                        Type <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[120px]">
                        Item Description <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[160px]">
                        Original Item <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[90px]">
                        Qnty (pcs/box) <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[90px]">
                        Qnty (sqft) <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[90px]">
                        Rate <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[110px]">
                        Amount
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[50px]"></th>
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
                        </td>
                        <td className="p-2">
                          <Input
                            value={entry.estimate_sub_item}
                            onChange={(e) =>
                              handleItemChange(index, "estimate_sub_item", e.target.value)
                            }
                            className="h-9 bg-white"
                            placeholder="Item Name"
                            maxLength={20}
                          />
                        </td>
                        <td className="p-2">
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
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_qnty || ""}
                            onChange={(e) =>
                              handleItemChange(index, "estimate_sub_qnty", e.target.value)
                            }
                            maxLength={10}
                            onKeyDown={handleKeyDown}
                            className="h-9 text-right bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
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
                            className="h-9 text-right bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_rate || ""}
                            onChange={(e) =>
                              handleItemChange(index, "estimate_sub_rate", e.target.value)
                            }
                            maxLength={10}
                            onKeyDown={handleKeyDown}
                            className="h-9 text-right bg-white"
                            placeholder="0"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.estimate_sub_amount || ""}
                            disabled
                            className="h-9 bg-gray-100 text-right font-medium"
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

            {/* Charges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div></div>
              <div className="border ml-20 rounded-lg p-3 bg-white space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_tax">Tax</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_tax"
                    type="tel"
                    {...form.register("sales_tax")}
                    onChange={(e) => handleChargeChange("sales_tax", e.target.value)}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_tempo">Tempo Charges</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_tempo"
                    type="tel"
                    {...form.register("sales_tempo")}
                    onChange={(e) => handleChargeChange("sales_tempo", e.target.value)}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_loading">Loading Charges</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_loading"
                    type="tel"
                    {...form.register("sales_loading")}
                    onChange={(e) => handleChargeChange("sales_loading", e.target.value)}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_unloading">Unloading Charges</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_unloading"
                    type="tel"
                    {...form.register("sales_unloading")}
                    onChange={(e) => handleChargeChange("sales_unloading", e.target.value)}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_other">Other Charges</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_other"
                    type="tel"
                    {...form.register("sales_other")}
                    onChange={(e) => handleChargeChange("sales_other", e.target.value)}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-semibold text-green-700">Gross Total</Label>
                  <Input
                    className="w-[150px] bg-green-50 font-bold border-green-200 text-green-900 text-right rounded-md shrink-0"
                    type="text"
                    value={form.watch("sales_gross") || 0}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_advance">Advance Received</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_advance"
                    type="tel"
                    value={form.watch("sales_advance") || ""}
                    onChange={(e) => handleAdvanceChange(e.target.value)}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-semibold text-red-700">Balance Amount</Label>
                  <Input
                    className="w-[150px] bg-red-50 font-bold border-red-200 text-red-900 text-right rounded-md shrink-0"
                    type="text"
                    value={form.watch("sales_balance") || 0}
                    disabled
                  />
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
                type="button"
                variant="outline"
                onClick={() => {
                  const formElement = document.getElementById("est-sales-form");
                  if (formElement) {
                    formElement.requestSubmit();
                  }
                }}
                className="border-gray-300 bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
              >
                Save and Close
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DesktopEstimateSalesForm;
