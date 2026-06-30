import React from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import NotInListIcon from "@/components/common/NotInListIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select as SelectShadcn,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";

const DesktopSalesForm = ({
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
              <CardTitle>{title}</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            id="sales-form"
            onSubmit={handleFormSubmit}
            className="space-y-2"
          >
            {/* Customer Information */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-blue-50 p-3 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="sales_no">
                  JFC Bill No <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="sales_no"
                  {...form.register("sales_no")}
                  className="bg-gray-100 uppercase placeholder:normal-case font-medium"
                  placeholder="Auto-generated"
                  maxLength={50}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales_date">
                  Date <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="sales_date"
                  type="date"
                  {...form.register("sales_date")}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales_customer">
                  Customer Name <span className="text-xs text-red-400 ">*</span>
                </Label>
                <Input
                  id="sales_customer"
                  {...form.register("sales_customer")}
                  className="bg-white uppercase placeholder:normal-case"
                  placeholder="Enter Customer Name"
                  maxLength={50}
                  onChange={(e) => {
                    form.setValue("sales_customer", e.target.value.toUpperCase());
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sales_mobile">Mobile No</Label>
                <Input
                  id="sales_mobile"
                  {...form.register("sales_mobile")}
                  className="bg-white uppercase placeholder:normal-case"
                  placeholder="Enter Mobile Number"
                  maxLength={10}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => {
                    form.setValue("sales_mobile", e.target.value.toUpperCase());
                  }}
                />
              </div>
              <div className="space-y-2 col-span-full">
                <Label htmlFor="sales_address">Address</Label>
                <Textarea
                  id="sales_address"
                  {...form.register("sales_address")}
                  className="bg-white uppercase placeholder:normal-case"
                  placeholder="Enter Address"
                  maxLength={200}
                  onChange={(e) => {
                    form.setValue("sales_address", e.target.value.toUpperCase());
                  }}
                  rows={2}
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
                      <th className="text-left p-2 font-medium text-sm w-[200px] min-w-[160px]">
                        Item <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Qnty (pcs/box)
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Qnty (sqft) <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[90px] min-w-[80px]">
                        Rate <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[110px] min-w-[90px]">
                        Amount <span className="text-xs text-red-400 ">*</span>
                      </th>
                      <th className="text-left p-2 font-medium text-sm w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemEntries.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          <div className="flex gap-2 items-start">
                            {isCustomItem[index] ? (
                              <div className="flex-1 min-w-0 flex gap-2">
                                <Input
                                  type="text"
                                  className="h-9 uppercase placeholder:normal-case bg-white"
                                  placeholder="Enter Item Name"
                                  value={customItems[index] || ""}
                                  onChange={(e) =>
                                    handleCustomItemChange(
                                      index,
                                      e.target.value.toUpperCase()
                                    )
                                  }
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 whitespace-nowrap shrink-0"
                                  onClick={() => handleToggleCustomItem(index)}
                                >
                                  Select
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 min-w-0">
                                  <MemoizedProductSelect
                                    value={entry.sales_sub_item}
                                    onChange={(value) =>
                                      handleItemChange(index, "sales_sub_item", value)
                                    }
                                    options={productOptions}
                                    placeholder="Select item"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9 whitespace-nowrap shrink-0"
                                  onClick={() => handleToggleCustomItem(index)}
                                >
                                  <NotInListIcon className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <Input
                            type="tel"
                            value={entry.sales_sub_qnty || entry.sales_sub_pcs || ""}
                            onChange={(e) =>
                              handleItemChange(index, "sales_sub_qnty", e.target.value)
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
                            value={entry.sales_sub_qnty_sqr || ""}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "sales_sub_qnty_sqr",
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
                            value={entry.sales_sub_rate || ""}
                            onChange={(e) =>
                              handleItemChange(index, "sales_sub_rate", e.target.value)
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
                            value={entry.sales_sub_amount || ""}
                            disabled
                            className="h-9 bg-gray-100 text-right"
                            placeholder="0"
                            onKeyDown={handleKeyDown}
                          />
                        </td>
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItemEntry(index, entry.id)}
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
              <div></div>
              <div className="border ml-20 rounded-lg p-3 bg-white space-y-2">
                {/* Tempo Charges */}
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sales_tempo">Tempo Charges</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    id="sales_tempo"
                    type="tel"
                    {...form.register("sales_tempo")}
                    onChange={(e) =>
                      handleChargeChange("sales_tempo", e.target.value)
                    }
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Labour Charges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Label className="font-medium shrink-0">Labour Charges</Label>
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
                      <SelectTrigger className="h-9 w-full min-w-[120px] bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Loading Only">Loading Only</SelectItem>
                        <SelectItem value="Loading & Unloading">
                          Loading & Unloading
                        </SelectItem>
                      </SelectContent>
                    </SelectShadcn>
                  </div>
                  <Input
                    className="w-[150px] h-9 text-right shrink-0 bg-white"
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
                    onChange={(e) => {
                      handleChargeChange(
                        loadingType === "Loading Only"
                          ? "sales_loading"
                          : "sales_unloading",
                        e.target.value
                      );
                    }}
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Other 1 */}
                <div className="flex items-center justify-between gap-2">
                  <Input
                    type="text"
                    placeholder="Other 1"
                    className="flex-1 h-9 bg-white"
                    {...form.register("sales_other_label")}
                  />
                  <Input
                    className="w-[150px] h-9 text-right shrink-0 bg-white"
                    id="sales_other"
                    type="tel"
                    {...form.register("sales_other")}
                    onChange={(e) =>
                      handleChargeChange("sales_other", e.target.value)
                    }
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Other 2 */}
                <div className="flex items-center justify-between gap-2">
                  <Input
                    type="text"
                    placeholder="Other 2"
                    className="flex-1 h-9 bg-white"
                    {...form.register("sales_other1_label")}
                  />
                  <Input
                    className="w-[150px] h-9 text-right shrink-0 bg-white"
                    id="sales_other1"
                    type="tel"
                    {...form.register("sales_other1")}
                    onChange={(e) =>
                      handleChargeChange("sales_other1", e.target.value)
                    }
                    maxLength={10}
                    onKeyDown={handleKeyDown}
                    placeholder="0"
                  />
                </div>

                {/* Gross Total */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium">Gross Total</Label>
                  <Input
                    className="w-[150px] bg-gray-100 font-medium text-right shrink-0"
                    type="text"
                    value={Number(displayGrandTotal).toFixed(0)}
                    disabled
                  />
                </div>

                {/* Tax Amount */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium">
                    Tax Amount{" "}
                    <Label className="font-medium text-xs text-gray-500">
                      (GST @ 18% = {Number(autoGst18).toFixed(2)})
                    </Label>
                  </Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    type="tel"
                    {...form.register("sales_tax")}
                    onChange={handleTaxChange}
                    placeholder="0"
                  />
                </div>

                {/* Net Total */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium">Net Total</Label>
                  <Input
                    className="w-[150px] text-right font-medium shrink-0 bg-gray-100"
                    type="tel"
                    {...form.register("sales_temp_amount")}
                    onKeyDown={handleKeyDown}
                    maxLength={10}
                    placeholder="0"
                    readOnly
                  />
                </div>

                {/* Round Off */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium">Round Off</Label>
                  <Input
                    className="w-[150px] text-right font-medium bg-gray-100 shrink-0"
                    type="text"
                    {...form.register("sales_amount_round")}
                    onChange={handleRoundOffChange}
                    placeholder="0"
                  />
                </div>

                {/* Amount to be Collected */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-semibold text-blue-900">
                    Amount to be Collected
                  </Label>
                  <Input
                    className="w-[150px] bg-gradient-to-r from-blue-700 to-blue-900 font-bold border-blue-800 text-white text-right rounded-md shrink-0"
                    type="text"
                    value={Number(amountToBeCollected).toFixed(0)}
                    disabled
                  />
                </div>

                {/* Final Amount Received */}
                <div className="flex items-center justify-between gap-2">
                  <Label className="font-medium">Final Amount Received</Label>
                  <Input
                    className="w-[150px] text-right shrink-0 bg-white"
                    type="tel"
                    {...form.register("sales_amount_received")}
                    onKeyDown={handleKeyDown}
                    maxLength={10}
                    placeholder="0"
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
                  const formElement = document.getElementById("sales-form");
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

export default DesktopSalesForm;
