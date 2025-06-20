import Page from "@/app/dashboard/page";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  BookOpen, 
  Scale, 
  Package, 
  ChevronRight, 
  Eye, 
  Edit,
  ShoppingBag,
  Calendar,
  Users,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import moment from "moment";
import { 
  PRODUCT_LIST, 
  PURCHASE_GRANITE_LIST, 
  PURCHASE_TILES_LIST, 
  SALES_LIST 
} from "@/api";

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("granite");

  // Report items from navigation
  const reportItems = [
    {
      title: "Day Book",
      url: "/day-book",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      description: "Daily transactions"
    },
    {
      title: "Ledger",
      url: "/ledger",
      icon: BookOpen,
      color: "from-green-500 to-green-600",
      description: "Account ledgers"
    },
    {
      title: "Trial Balance",
      url: "/trial-balance",
      icon: Scale,
      color: "from-purple-500 to-purple-600",
      description: "Financial balance"
    },
    {
      title: "Stocks",
      url: "/stocks",
      icon: Package,
      color: "from-orange-500 to-orange-600",
      description: "Inventory status"
    }
  ];

  // Product data query
  const {
    data: productType,
    isLoading: productLoading,
  } = useQuery({
    queryKey: ["productType"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${PRODUCT_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.product_type;
    },
  });

  // Purchase Granite data query
  const {
    data: purchaseGranite,
    isLoading: graniteLoading,
  } = useQuery({
    queryKey: ["purchaseGranite"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${PURCHASE_GRANITE_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.purchase;
    },
  });

  // Purchase Tiles data query
  const {
    data: purchaseTiles,
    isLoading: tilesLoading,
  } = useQuery({
    queryKey: ["purchaseTiles"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${PURCHASE_TILES_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.purchase;
    },
  });

  // Sales data query
  const {
    data: sales,
    isLoading: salesLoading,
  } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${SALES_LIST}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.sales;
    },
  });

  const handleReportClick = (url) => {
    navigate(url);
  };

  const handleProductEdit = (productId) => {
    navigate(`/product/edit/${productId}`);
  };

  const handleGraniteEdit = (id) => {
    navigate(`/purchase-granite/edit/${id}`);
  };

  const handleGraniteView = (id) => {
    navigate(`/purchase-granite/view/${id}`);
  };

  const handleTilesEdit = (id) => {
    navigate(`/purchase-tiles/edit/${id}`);
  };

  const handleTilesView = (id) => {
    navigate(`/purchase-tiles/view/${id}`);
  };

  const handleSalesEdit = (id) => {
    navigate(`/sales/edit/${id}`);
  };

  const handleSalesView = (id) => {
    navigate(`/sales/view/${id}`);
  };

  return (
    <Page>
      <div className="w-full p-0 md:p-0 sm:grid grid-cols-1">
        <div className="sm:hidden">
          {/* Mobile Dashboard */}
          <div className="min-h-screen   bg-gradient-to-br from-slate-50 to-blue-50">
            
           
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 rounded-b-3xl shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Welcome to</h1>
                  <h2 className="text-3xl font-extrabold text-white">Jaju CRM</h2>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              
           
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-white" />
                    <span className="text-white text-sm font-medium">Products</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">
                    {productType?.length || 0}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-white" />
                    <span className="text-white text-sm font-medium">Sales</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-1">
                    {sales?.length || 0}
                  </p>
                </div>
              </div>
            </div>

        
            {/* Reports Section */}
<div className="px-4 mb-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold text-gray-800">Reports</h3>
    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
      {reportItems.length} Available
    </Badge>
  </div>
  
  <div className="grid grid-cols-2 gap-3">
    {reportItems.map((item, index) => {
      const Icon = item.icon;
      return (
        <Card 
          key={index}
          className={`cursor-pointer transform transition-all hover:scale-105 ${
            index === 3 ? 'opacity-70' : ''
          }`}
          onClick={() => handleReportClick(item.url)}
        >
          <CardContent className="p-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mb-2`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 text-xs mb-1">{item.title}</h4>
            <p className="text-xs text-gray-500 leading-tight">{item.description}</p>
          </CardContent>
        </Card>
      );
    })}
  </div>
</div>

            {/* Products Section */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Products</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/product')}
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {productLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  productType?.slice(0, 5).map((product, index) => (
                    <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 text-sm">{product.product_type}</h4>
                                <p className="text-xs text-gray-500">{product.product_type_group}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={product.product_type_status === 'Active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {product.product_type_status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleProductEdit(product.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Purchase Section */}
            <div className="px-4 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Purchase</h3>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="granite" className="text-sm">Granite</TabsTrigger>
                  <TabsTrigger value="tiles" className="text-sm">Tiles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="granite" className="space-y-3">
                  {graniteLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    purchaseGranite?.slice(0, 5).map((granite, index) => (
                      <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 text-sm">{granite.purchase_supplier}</h4>
                                <p className="text-xs text-gray-500">
                                  {moment(granite.purchase_date).format("DD-MMM-YYYY")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-sm">₹{granite.purchase_amount}</p>
                              <p className="text-xs text-gray-500">{granite.purchase_no_of_count} items</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600">Bill: {granite.purchase_bill_no}</p>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleGraniteView(granite.id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleGraniteEdit(granite.id)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="tiles" className="space-y-3">
                  {tilesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    purchaseTiles?.slice(0, 5).map((tile, index) => (
                      <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 text-sm">{tile.purchase_supplier}</h4>
                                <p className="text-xs text-gray-500">
                                  {moment(tile.purchase_date).format("DD-MMM-YYYY")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-sm">₹{tile.purchase_amount}</p>
                              <p className="text-xs text-gray-500">{tile.purchase_no_of_count} items</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600">Bill: {tile.purchase_bill_no}</p>
                              {tile.purchase_estimate_ref && (
                                <p className="text-xs text-gray-600">Est: {tile.purchase_estimate_ref}</p>
                              )}
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleTilesView(tile.id)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleTilesEdit(tile.id)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sales Section */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Sales</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/sales')}
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {salesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : (
                  sales?.slice(0, 5).map((sale, index) => (
                    <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 text-sm">{sale.sales_customer}</h4>
                              <p className="text-xs text-gray-500">
                                {moment(sale.sales_date).format("DD-MMM-YYYY")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 text-sm">₹{sale.sales_gross}</p>
                            <p className="text-xs text-gray-500">{sale.sales_no_of_count} items</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600">Est: {sale.sales_no}</p>
                            <div className="flex space-x-2 text-xs text-gray-500 mt-1">
                              <span>Adv: ₹{sale.sales_advance}</span>
                              <span>Bal: ₹{sale.sales_balance}</span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleSalesView(sale.id)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleSalesEdit(sale.id)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

          
          
          </div>
        </div>

       
        <div className="hidden sm:block rounded-md border">
          large dashboard
        </div>
      </div>
    </Page>
  );
};

export default Home;