import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useReactToPrint } from "react-to-print";
import { BUYER_DOWNLOAD, BUYER_REPORT } from "@/api";
import Loader from "@/components/loader/Loader";

const BuyerReport = () => {
  const containerRef = useRef();
  const { toast } = useToast();

  // Fetch data from API
  const fetchBuyerData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${BUYER_REPORT}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.buyer;
    } catch (error) {
      console.error("Error fetching buyer data:", error);
      return null;
    }
  };

  const {
    data: buyerData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["buyerData"],
    queryFn: fetchBuyerData,
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${BUYER_DOWNLOAD}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob", // Must be inside config object
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "buyer.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Remove the link after clicking

      toast({
        title: "Success",
        description: "Buyer data downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Download failed",
        variant: "destructive",
      });
    }
  };

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Product_Stock",
    pageStyle: `
      @page {
    size: A4 portrait;
        margin: 5mm;
      }
      @media print {
        body {
          font-size: 10px; 
          margin: 0mm;
          padding: 0mm;
        }
        table {
          font-size: 11px;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });
  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
         <Loader/>
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Buyer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <div className="p-0 md:p-4">

      <div className="sm:hidden">
  <div
    className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      {/* Title Section */}
      <div className="flex-1 text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Buyer Summary
        </h1>
      </div>

      {/* Button Section */}
      <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
        {/* Print Button */}
        <button
          className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg flex items-center justify-center`}
          onClick={handlePrintPdf}
        >
          <Printer className="h-3 w-3 mr-1" /> Print
        </button>

        {/* Download Button */}
        <button
          className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg flex items-center justify-center`}
          onClick={onSubmit}
        >
          <Download className="h-3 w-3 mr-1" /> Download
        </button>
      </div>
    </div>
  </div>
</div>




        <div className="hidden sm:block">
        <div
          className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4 mb-2`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Title Section */}
            <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">
              Buyer Summary
            </h1>

            {/* Button Section */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button
                className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              >
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button
                className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={onSubmit}
              >
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          </div>
        </div>
        </div>
        <div
          className="overflow-x-auto text-[11px] grid grid-cols-1"
          ref={containerRef}
        >
          <h1 className="text-center text-2xl font-semibold mb-3 hidden print:block">
            Buyer Summary
          </h1>
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-2 py-2 text-center">
                  Buyer Name
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  City
                </th>
                <th className="border border-black px-2 py-2 text-center cursor-pointer">
                  Status{" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {buyerData && buyerData.length > 0 ? (
                buyerData.map((buyer, index) => (
                  <tr key={buyer.id || index} className="hover:bg-gray-50">
                    <td className="border border-black px-2 py-2">
                      {buyer.buyer_name}
                    </td>
                    <td className="border border-black px-2 py-2">
                      {buyer.buyer_city}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                      {buyer.buyer_status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default BuyerReport;
