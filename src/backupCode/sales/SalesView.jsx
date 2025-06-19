import { decryptId } from "@/components/common/Encryption";
import BASE_URL from "@/config/BaseUrl";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../../app/dashboard/page";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useReactToPrint } from "react-to-print";
import moment from "moment";
import html2pdf from "html2pdf.js";

const SalesView = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const containerRef = useRef();
  const [sales, setSales] = useState({});
  const [salessubData, setSalesSubData] = useState([]);
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
  const {
    data: SalesId,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["salesByid", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/sales/${decryptedId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch sales order");
      return response.json();
    },
  });

  useEffect(() => {
    if (SalesId) {
      setSales(SalesId.sales);
      setSalesSubData(SalesId.salesSub);
    }
  }, [SalesId]);
  const totalSalesSubBox = salessubData.reduce(
    (total, row) => total + row.sales_sub_box,
    0
  );
  const totalSaleWeight = salessubData.reduce(
    (total, row) => total + row.sales_sub_weight * row.sales_sub_box,
    0
  );
  

  const handleSaveAsPdf = () => {
    if (!containerRef.current) {
      console.error("Element not found");
      return;
    }

    html2pdf()
      .from(containerRef.current)
      .set({
        margin: 10, // Standard margin
        filename: "Dispatch.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  return (
    <Page>
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4 mb-2 grid grid-cols-1 overflow-x-auto`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Title Section */}
          <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">
            Dispatch
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
              onClick={handleSaveAsPdf}
            >
              <Printer className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
      </div>{" "}
      <div
        className="w-full max-w-3xl mx-auto px-4 pb-4 border border-black bg-white"
        ref={containerRef}
      >
        <h2 className="text-center font-bold text-lg py-2 ">RUFF PERFORMA</h2>

        <div className="w-full border border-black mb-4 grid grid-cols-2">
          <div className="border-r border-black">
            <div className="p-2 border-b border-black">
              <span className="font-medium">Name:</span>{" "}
              {sales.sales_buyer_name}
            </div>
            <div className="p-2">
              <span className="font-medium">Ref No:</span> {sales.sales_ref_no}
            </div>
          </div>
          <div>
            <div className="p-2 border-b border-black">
              <span className="font-medium">City:</span>{" "}
              {sales.sales_buyer_city}
            </div>
            <div className="p-2">
              <span className="font-medium">Date:</span>{" "}
              {moment(sales.sales_date).format("DD-MMM-YYYY")}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <table className="w-full border-collapse border border-black">
          {/* Table Head */}
          <thead className="bg-gray-200 border border-black">
            <tr className="border border-black">
              <th className="p-2 border border-black">ITEM NAME</th>
              <th className="p-2 border border-black">SIZE</th>
              <th className="p-2 border border-black">BRAND</th>
              <th className="p-2 border border-black">QUANTITY</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {salessubData.map((row, index) => (
              <tr key={index} className="border border-black">
                <td className="p-2 border border-black">
                  {row.sales_sub_item}
                </td>
                <td className="p-2 border border-black">
                  {row.sales_sub_size}
                </td>
                <td className="p-2 border border-black">
                  {row.sales_sub_brand}
                </td>
                <td className="p-2 border border-black text-right">
                  {row.sales_sub_box}
                </td>
              </tr>
            ))}

            {/* Total Row */}
            <tr className="border border-black bg-gray-200 font-semibold">
              <td className="p-2 border border-black">TOTAL</td>
              <td className="p-2 border border-black"></td>
              <td className="p-2 border border-black"></td>
              <td className="p-2 border border-black text-right">
                {totalSalesSubBox}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Details */}
        <div className="mt-2 text-sm border border-black">
          <p className="py-1 px-2 border-b border-black">
            WEIGHT : {totalSaleWeight} KG
          </p>
          <p className="py-1 px-2 border-b border-black">
            VEHICLE : {sales.sales_vehicle_no}
          </p>
          <p className="py-1 px-2">REMARK : {sales.sales_remark}</p>
        </div>
      </div>
    </Page>
  );
};

export default SalesView;
