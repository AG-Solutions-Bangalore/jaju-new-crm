import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MinusCircle, PlusCircle, SquarePlus, Trash2 } from "lucide-react";
import CreateItem from "../../app/master/item/CreateItem";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
const SalesTable = ({
  invoiceData,
  setInvoiceData,
  addRow,
  itemsData,
  removeRow,
  handleDeleteRow,
  userType,
}) => {
  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="border border-gray-300 rounded-lg shadow-sm">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
              <div className="flex items-center">
                <SquarePlus className="h-3 w-3 mr-1 text-red-600" />
                <CreateItem />
              </div>
            </TableHead>

            <TableHead className="text-sm font-semibold text-gray-600 py-2 px-4">
              Box
            </TableHead>
            <TableHead className="text-sm font-semibold py-3 px-4 w-1/6 text-center">
              Action
              <PlusCircle
                onClick={addRow}
                className="inline-block ml-2 cursor-pointer text-blue-500 hover:text-gray-800 h-4 w-4"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoiceData.map((row, rowIndex) => {
            const handlePaymentChange = (
              selectedValue,
              rowIndex,
              fieldName
            ) => {
              let value;

              if (selectedValue && selectedValue.target) {
                value = selectedValue.target.value;
              } else {
                value = selectedValue;
              }

              console.log("Selected Value:", value);

              const updatedData = [...invoiceData];

              if (fieldName === "sales_sub_item") {
                updatedData[rowIndex][fieldName] = value;

                const selectedItem = itemsData?.items?.find(
                  (item) => item.item_name === value
                );

                if (selectedItem) {
                  updatedData[rowIndex]["sales_sub_category"] =
                    selectedItem.item_category;
                  updatedData[rowIndex]["sales_sub_size"] =
                    selectedItem.item_size;
                  updatedData[rowIndex]["sales_sub_brand"] =
                    selectedItem.item_brand;
                  updatedData[rowIndex]["sales_sub_weight"] =
                    selectedItem.item_weight;
                }

                setInvoiceData(updatedData);
              } else {
                if (["sales_sub_weight", "sales_sub_box"].includes(fieldName)) {
                  if (!/^\d*$/.test(value)) {
                    console.log("Invalid input. Only digits are allowed.");
                    return;
                  }
                }

                updatedData[rowIndex][fieldName] = value;
                setInvoiceData(updatedData);
              }
            };
            return (
              <TableRow
                key={rowIndex}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <TableCell className="px-4 py-2">
                  <div>
                    <MemoizedProductSelect
                      // key={row.purchase_sub_item}
                      value={row.sales_sub_item}
                      onChange={(e) =>
                        handlePaymentChange(e, rowIndex, "sales_sub_item")
                      }
                      options={
                        itemsData?.items?.map((product) => ({
                          value: product.item_name,
                          label: product.item_name,
                        })) || []
                      }
                      placeholder="Select Item"
                    />
                  </div>
                  {row.sales_sub_item && (
                    <div className="text-sm text-black mt-1">
                      •{row.sales_sub_category} • {row.sales_sub_size}
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 min-w-28 ">
                  <Input
                    className="bg-white border border-gray-300"
                    value={row.sales_sub_box}
                    onChange={(e) =>
                      handlePaymentChange(e, rowIndex, "sales_sub_box")
                    }
                    placeholder="Enter Box"
                  />
                  {row.sales_sub_item && (
                    <div className="text-sm text-black mt-1">
                      • {row.sales_sub_brand}
                    </div>
                  )}
                </TableCell>
                <TableCell className="p-2 border">
                  <TableCell className="p-2 ">
                    {row.id ? (
                      userType == 2 && (
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-500"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      )
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => removeRow(rowIndex)}
                        disabled={invoiceData.length === 1}
                        className="text-red-500 "
                        type="button"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
