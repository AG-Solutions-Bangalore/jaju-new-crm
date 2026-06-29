import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import { formatCurrency } from "../utils/formatCurrency";
import { ShoppingBag } from "lucide-react";

const PurchaseTable = ({ purchases = [] }) => {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b pb-4">
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-orange-500" />
          Purchase Records
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={ButtonConfig.tableHeader}>
                <TableHead className={`font-semibold ${ButtonConfig.tableLabel}`}>Date</TableHead>
                <TableHead className={`font-semibold ${ButtonConfig.tableLabel}`}>JFC Bill No</TableHead>
                <TableHead className={`font-semibold ${ButtonConfig.tableLabel}`}>Supplier</TableHead>
                <TableHead className={`text-right font-semibold ${ButtonConfig.tableLabel}`}>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id} className="hover:bg-gray-50/50">
                  <TableCell className="py-3">{moment(purchase.purchase_date).format("DD-MMM-YYYY")}</TableCell>
                  <TableCell className="py-3 font-semibold text-gray-700">{purchase.purchase_bill_no || "N/A"}</TableCell>
                  <TableCell className="py-3 font-medium text-gray-900">{purchase.purchase_supplier || "N/A"}</TableCell>
                  <TableCell className="py-3 text-right font-semibold text-orange-600">
                    {formatCurrency(parseFloat(purchase.purchase_amount) || 0)}
                  </TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-gray-500">
                    No purchase records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PurchaseTable;
