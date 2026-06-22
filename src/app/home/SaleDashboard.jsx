import React from "react";
import Page from "../dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { SALES_LIST, PURCHASE_GRANITE_LIST } from "@/api";
import Loader from "@/components/loader/Loader";
import Cookies from "js-cookie";
import moment from "moment";
import { ButtonConfig } from "@/config/ButtonConfig";

const SaleDashboard = () => {
  // Fetch Sales Data
  const {
    data: sales = [],
    isLoading: isSalesLoading,
    isError: isSalesError,
    refetch: refetchSales,
  } = useQuery({
    queryKey: ["salesData"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(`${SALES_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.sales || [];
    },
  });

  // Fetch Purchase Data
  const {
    data: purchases = [],
    isLoading: isPurchasesLoading,
    isError: isPurchasesError,
    refetch: refetchPurchases,
  } = useQuery({
    queryKey: ["purchaseGraniteData"],
    queryFn: async () => {
      const token = Cookies.get("token");
      const response = await axios.get(`${PURCHASE_GRANITE_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.purchase || [];
    },
  });

  const isLoading = isSalesLoading || isPurchasesLoading;
  const isError = isSalesError || isPurchasesError;

  const handleRefreshAll = () => {
    refetchSales();
    refetchPurchases();
  };

  // Slice to last 1 for sales, last 2 for purchases
  const displayedSales = sales.slice(-1);
  const displayedPurchases = purchases.slice(-2);

  // Metric Computations (Total metrics based on all records)
  const totalSalesAmount = sales.reduce(
    (sum, item) => sum + (parseFloat(item.sales_gross) || 0),
    0,
  );
  const totalPurchaseAmount = purchases.reduce(
    (sum, item) => sum + (parseFloat(item.purchase_amount) || 0),
    0,
  );
  const netFlow = totalSalesAmount - totalPurchaseAmount;

  // Format currency in Indian format
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-[70vh]">
          <Loader />
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              Error Fetching Dashboard Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Could not load the sales or purchase records.
            </p>
            <Button
              onClick={handleRefreshAll}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <div className="w-full p-2 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Real-time overview of sales and purchases
            </p>
          </div>
          <Button
            onClick={handleRefreshAll}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4 " /> Refresh
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sales Card */}
          <Card className="relative overflow-hidden border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500">
                    Total Sales
                  </span>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(totalSalesAmount)}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500 gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{sales.length} Bills</span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            </CardContent>
          </Card>

          {/* Purchases Card */}
          <Card className="relative overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500">
                    Total Purchases
                  </span>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatCurrency(totalPurchaseAmount)}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500 gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{purchases.length} Records</span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-100/30 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            </CardContent>
          </Card>

          {/* Net Flow Card */}
          <Card className="relative overflow-hidden border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500">
                    Net Flow
                  </span>
                  <div
                    className={`text-2xl font-bold ${netFlow >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    {formatCurrency(netFlow)}
                  </div>
                </div>
                <div
                  className={`p-3 rounded-xl ${netFlow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                >
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500 gap-1">
                {netFlow >= 0 ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600 font-medium">
                      Positive Flow
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    <span className="text-rose-600 font-medium">
                      Negative Flow
                    </span>
                  </>
                )}
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/20 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            </CardContent>
          </Card>

          {/* Activity Summary Card */}
          <Card className="relative overflow-hidden border-violet-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-500">
                    Active Entities
                  </span>
                  <div className="text-2xl font-bold text-violet-900">
                    {
                      Array.from(
                        new Set(
                          [
                            ...sales.map((s) => s.sales_customer),
                            ...purchases.map((p) => p.purchase_supplier),
                          ].filter(Boolean),
                        ),
                      ).length
                    }
                  </div>
                </div>
                <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-gray-500 gap-1">
                <span>Total vendors & clients interacted</span>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-100/30 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            </CardContent>
          </Card>
        </div>

        {/* Side-by-side Tables Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Card Table */}
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
                      <TableHead
                        className={`font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        Date
                      </TableHead>
                      <TableHead
                        className={`font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        JFC Bill No
                      </TableHead>
                      <TableHead
                        className={`font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        Customer
                      </TableHead>
                      <TableHead
                        className={`text-right font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        Gross Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedSales.map((sale) => (
                      <TableRow key={sale.id} className="hover:bg-gray-50/50">
                        <TableCell className="py-3">
                          {moment(sale.sales_date).format("DD-MMM-YYYY")}
                        </TableCell>
                        <TableCell className="py-3 font-semibold text-gray-700">
                          {sale.sales_no || "N/A"}
                        </TableCell>
                        <TableCell className="py-3 font-medium text-gray-900">
                          {sale.sales_customer || "N/A"}
                        </TableCell>
                        <TableCell className="py-3 text-right font-semibold text-blue-600">
                          {formatCurrency(parseFloat(sale.sales_gross) || 0)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {displayedSales.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center text-gray-500"
                        >
                          No sales records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Card Table */}
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
                      <TableHead
                        className={`font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        Date
                      </TableHead>
                      <TableHead
                        className={`font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        JFC Bill No
                      </TableHead>
                      <TableHead
                        className={`font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        Supplier
                      </TableHead>
                      <TableHead
                        className={`text-right font-semibold ${ButtonConfig.tableLabel}`}
                      >
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedPurchases.map((purchase) => (
                      <TableRow
                        key={purchase.id}
                        className="hover:bg-gray-50/50"
                      >
                        <TableCell className="py-3">
                          {moment(purchase.purchase_date).format("DD-MMM-YYYY")}
                        </TableCell>
                        <TableCell className="py-3 font-semibold text-gray-700">
                          {purchase.purchase_bill_no || "N/A"}
                        </TableCell>
                        <TableCell className="py-3 font-medium text-gray-900">
                          {purchase.purchase_supplier || "N/A"}
                        </TableCell>
                        <TableCell className="py-3 text-right font-semibold text-orange-600">
                          {formatCurrency(
                            parseFloat(purchase.purchase_amount) || 0,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}

                    {displayedPurchases.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-28 text-center text-gray-500"
                        >
                          No purchase records found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default SaleDashboard;
