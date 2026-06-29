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
import { useNavigate } from "react-router-dom";

// Helper Circular Progress Component
const CircularProgress = ({ percentage, label, color }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    green: "text-[#2e7d32] stroke-[#2e7d32] stroke-emerald-500 text-emerald-500", 
    indigo: "text-[#5c6bc0] stroke-[#5c6bc0] stroke-indigo-500 text-indigo-500", 
    orange: "text-[#d84315] stroke-[#d84315] stroke-orange-500 text-orange-500" 
  };

  const strokeColor = colorMap[color] || colorMap.green;

  return (
    <Card className="flex flex-col items-center justify-center p-6 border border-gray-100 shadow-sm bg-white rounded-2xl hover:shadow-md transition-shadow">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 112 112">
          {/* Background Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="7"
            stroke="#f3f4f6"
            fill="transparent"
          />
          {/* Foreground Progress Ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${strokeColor} transition-all duration-700 ease-in-out`}
            stroke="currentColor"
          />
        </svg>
        <span className="absolute text-2xl font-bold text-gray-800">{percentage}%</span>
      </div>
      <span className="mt-4 text-sm font-semibold text-gray-600 tracking-wide">{label}</span>
    </Card>
  );
};

const restockAlertsData = [
  {
    id: 1,
    name: "Cotton tote bags",
    details: "8 left · reorder by Friday",
    barColor: "bg-[#e28a96]",
    textColor: "text-[#8c3b4a]"
  },
  {
    id: 2,
    name: "USB-C cables",
    details: "15 left · reorder by Tuesday",
    barColor: "bg-[#d9ad3d]",
    textColor: "text-[#8f6a1e]"
  },
  {
    id: 3,
    name: "Ceramic mugs",
    details: "22 left · reorder by next week",
    barColor: "bg-[#d9ad3d]",
    textColor: "text-[#8f6a1e]"
  }
];

const warehouseCapacityData = [
  {
    id: 1,
    name: "Warehouse A · Bengaluru",
    capacity: 82,
    barColor: "bg-[#d9ad3d]"
  },
  {
    id: 2,
    name: "Warehouse B · Mumbai",
    capacity: 64,
    barColor: "bg-[#56b394]"
  },
  {
    id: 3,
    name: "Warehouse C · Pune",
    capacity: 91,
    barColor: "bg-[#e25c5c]"
  }
];

const SaleDashboard = () => {
  const navigate = useNavigate();
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
  const displayedSales = sales.slice(0, 5);
  const displayedPurchases = purchases.slice(0, 5);

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
          <Card className="relative overflow-hidden cursor-pointer border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent
              className="p-6"
              onClick={() => navigate("/sales")} // ✅ navigate to sales page
            >
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
          <Card
            className="relative overflow-hidden border-orange-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow "
            onClick={() => navigate("/purchase")}
          >
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

        {/* Circular Progress Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CircularProgress percentage={82} label="Stock health" color="green" />
          <CircularProgress percentage={94} label="Order fulfillment" color="indigo" />
          <CircularProgress percentage={76} label="Supplier reliability" color="orange" />
        </div>

        {/* Alerts and Warehouse Capacity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restock Alerts Card */}
          <Card className="border border-gray-100 shadow-sm p-6 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Restock alerts</h2>
            <div className="space-y-6">
              {restockAlertsData.map((item) => (
                <div key={item.id} className="flex gap-4 items-stretch">
                  <div className={`w-[4px] rounded-full ${item.barColor}`} />
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-gray-800">{item.name}</h4>
                    <p className={`text-sm font-medium ${item.textColor}`}>{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Warehouse Capacity Card */}
          <Card className="border border-gray-100 shadow-sm p-6 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Warehouse capacity</h2>
            <div className="space-y-6">
              {warehouseCapacityData.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-700">{item.name}</span>
                    <span className="font-bold text-gray-700">{item.capacity}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                      style={{ width: `${item.capacity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
