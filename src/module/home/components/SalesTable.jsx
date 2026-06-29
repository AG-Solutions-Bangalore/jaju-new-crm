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
import { ShoppingCart } from "lucide-react";

const SalesTable = ({ sales = [] }) => {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b pb-4">
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          Sales Records
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={ButtonConfig.tableHeader}>
                <TableHead className={`font-semibold ${ButtonConfig.tableLabel}`}>Date</TableHead>
                <TableHead className={`font-semibold ${ButtonConfig.tableLabel}`}>JFC Bill No</TableHead>
                <TableHead className={`font-semibold ${ButtonConfig.tableLabel}`}>Customer</TableHead>
                <TableHead className={`text-right font-semibold ${ButtonConfig.tableLabel}`}>Gross Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} className="hover:bg-gray-50/50">
                  <TableCell className="py-3">{moment(sale.sales_date).format("DD-MMM-YYYY")}</TableCell>
                  <TableCell className="py-3 font-semibold text-gray-700">{sale.sales_no || "N/A"}</TableCell>
                  <TableCell className="py-3 font-medium text-gray-900">{sale.sales_customer || "N/A"}</TableCell>
                  <TableCell className="py-3 text-right font-semibold text-blue-600">
                    {formatCurrency(parseFloat(sale.sales_gross) || 0)}
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-28 text-center text-gray-500">
                    No sales records found.
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

export default SalesTable;
