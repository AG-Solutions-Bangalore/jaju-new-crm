import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, ShoppingCart, ShoppingBag } from "lucide-react";
import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/loader/Loader";
import { useSales, usePurchases } from "../hooks/useHome";
import { formatCurrency } from "../utils/formatCurrency";
import MetricCard from "../components/MetricCard";
import CircularProgress from "../components/CircularProgress";
import SalesTable from "../components/SalesTable";
import PurchaseTable from "../components/PurchaseTable";

const RESTOCK_ALERTS = [
  { id: 1, name: "Cotton tote bags", details: "8 left \u00B7 reorder by Friday", barColor: "bg-[#e28a96]", textColor: "text-[#8c3b4a]" },
  { id: 2, name: "USB-C cables", details: "15 left \u00B7 reorder by Tuesday", barColor: "bg-[#d9ad3d]", textColor: "text-[#8f6a1e]" },
  { id: 3, name: "Ceramic mugs", details: "22 left \u00B7 reorder by next week", barColor: "bg-[#d9ad3d]", textColor: "text-[#8f6a1e]" },
];

const WAREHOUSE_CAPACITY = [
  { id: 1, name: "Warehouse A \u00B7 Bengaluru", capacity: 82, barColor: "bg-[#d9ad3d]" },
  { id: 2, name: "Warehouse B \u00B7 Mumbai", capacity: 64, barColor: "bg-[#56b394]" },
  { id: 3, name: "Warehouse C \u00B7 Pune", capacity: 91, barColor: "bg-[#e25c5c]" },
];

const SaleDashboardPage = () => {
  const navigate = useNavigate();
  const { data: sales = [], isLoading: isSalesLoading, isError: isSalesError, refetch: refetchSales } = useSales();
  const { data: purchases = [], isLoading: isPurchasesLoading, isError: isPurchasesError, refetch: refetchPurchases } = usePurchases();

  const isLoading = isSalesLoading || isPurchasesLoading;
  const isError = isSalesError || isPurchasesError;

  const handleRefreshAll = () => {
    refetchSales();
    refetchPurchases();
  };

  const displayedSales = useMemo(() => sales.slice(0, 5), [sales]);
  const displayedPurchases = useMemo(() => purchases.slice(0, 5), [purchases]);

  const totalSalesAmount = useMemo(
    () => sales.reduce((sum, item) => sum + (parseFloat(item.sales_gross) || 0), 0),
    [sales],
  );

  const totalPurchaseAmount = useMemo(
    () => purchases.reduce((sum, item) => sum + (parseFloat(item.purchase_amount) || 0), 0),
    [purchases],
  );

  const netFlow = totalSalesAmount - totalPurchaseAmount;

  const activeEntities = useMemo(
    () =>
      Array.from(
        new Set(
          [...sales.map((s) => s.sales_customer), ...purchases.map((p) => p.purchase_supplier)].filter(Boolean),
        ),
      ).length,
    [sales, purchases],
  );

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
            <p className="text-sm text-gray-500">Could not load the sales or purchase records.</p>
            <Button onClick={handleRefreshAll} variant="outline" className="w-full flex items-center justify-center gap-2">
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time overview of sales and purchases</p>
          </div>
          <Button onClick={handleRefreshAll} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sales"
            value={formatCurrency(totalSalesAmount)}
            icon={TrendingUp}
            iconBg="bg-blue-50 text-blue-600"
            count={sales.length}
            countLabel="Bills"
            onClick={() => navigate("/sales")}
            gradientFrom="from-blue-100/30"
          />
          <MetricCard
            title="Total Purchases"
            value={formatCurrency(totalPurchaseAmount)}
            icon={TrendingDown}
            iconBg="bg-orange-50 text-orange-600"
            count={purchases.length}
            countLabel="Records"
            onClick={() => navigate("/purchase")}
            gradientFrom="from-orange-100/30"
          />
          <MetricCard
            title="Net Flow"
            value={formatCurrency(netFlow)}
            icon={DollarSign}
            iconBg={netFlow >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}
            gradientFrom="from-emerald-100/20"
          />
          <MetricCard
            title="Active Entities"
            value={activeEntities}
            icon={ShoppingBag}
            iconBg="bg-violet-50 text-violet-600"
            countLabel="Total vendors & clients interacted"
            gradientFrom="from-violet-100/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CircularProgress percentage={82} label="Stock health" color="green" />
          <CircularProgress percentage={94} label="Order fulfillment" color="indigo" />
          <CircularProgress percentage={76} label="Supplier reliability" color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-gray-100 shadow-sm p-6 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Restock alerts</h2>
            <div className="space-y-6">
              {RESTOCK_ALERTS.map((item) => (
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

          <Card className="border border-gray-100 shadow-sm p-6 bg-white rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Warehouse capacity</h2>
            <div className="space-y-6">
              {WAREHOUSE_CAPACITY.map((item) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesTable sales={displayedSales} />
          <PurchaseTable purchases={displayedPurchases} />
        </div>
      </div>
    </Page>
  );
};

export default SaleDashboardPage;
