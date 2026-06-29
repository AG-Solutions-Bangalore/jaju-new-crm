import React from "react";
import moment from "moment";
import { ChevronLeft, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Loader2 } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";

const MobileEstimateView = ({
  estimateData,
  calculateTotal,
  isLoading,
  handleDownloadPDF,
  tableRef,
  navigate,
}) => {
  if (!estimateData) return null;

  return (
    <div className="sm:hidden">
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => navigate("/estimate")}
                className="rounded-full p-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold text-gray-800">
                Estimate Details
              </h1>
            </div>
            <div className="flex gap-[2px]">
              <button
                type="button"
                className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                onClick={handleDownloadPDF}
              >
                <FaRegFilePdf className="h-4 w-4" />
              </button>
              <ReactToPrint
                trigger={() => (
                  <button
                    type="button"
                    className={`sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md`}
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                )}
                content={() => tableRef.current}
                documentTitle="Estimate Report"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="text-center font-semibold text-sm mb-2">
              ESTIMATE
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex justify-center border p-1 bg-white">
                <span className="font-medium">Date:</span>{" "}
                <span className="ml-1">
                  {moment(estimateData?.estimate?.estimate_date).format(
                    "DD-MMM-YYYY"
                  )}
                </span>
              </div>
              <div className="flex justify-center border p-1 bg-white">
                <span className="font-medium">Estimate No:</span>{" "}
                <span className="ml-1">
                  {estimateData?.estimate?.estimate_no}
                </span>
              </div>
            </div>

            <div className="border p-2 text-xs mb-3 bg-white">
              <span className="font-semibold">Customer:</span>{" "}
              <span>{estimateData?.estimate?.estimate_customer}</span>
            </div>

            <table className="w-full border-collapse text-xs mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-1 text-left">Sl No</th>
                  <th className="border p-1 text-left">Item</th>
                  <th className="border p-1 text-right">Qty</th>
                  <th className="border p-1 text-right">Rate</th>
                  <th className="border p-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {estimateData?.estimateSub?.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border p-1 text-left">{index + 1}</td>
                    <td className="border p-1 text-left">
                      {item.estimate_sub_item}
                    </td>
                    <td className="border p-1 text-right">
                      {item.estimate_sub_qnty}
                    </td>
                    <td className="border p-1 text-right">
                      {item.estimate_sub_rate}
                    </td>
                    <td className="border p-1 text-right">
                      {item.estimate_sub_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className="w-full border-collapse text-xs bg-white">
              <tbody>
                <tr>
                  <td className="border p-1 text-right font-medium">Sub-Total</td>
                  <td className="border p-1 text-right">
                    {calculateTotal(estimateData?.estimateSub)}
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 text-right font-medium">
                    Tax (GST 18% ={" "}
                    {Number(estimateData?.estimate?.estimate_tax).toFixed(0)})
                  </td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_tax}
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 text-right font-medium">
                    Tempo Charges
                  </td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_tempo}
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 text-right font-medium">
                    Loading/Unloading
                  </td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_loading}
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 text-right font-medium">
                    Other Charges
                  </td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_other}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td className="border p-1 text-right">Total</td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_gross}
                  </td>
                </tr>
                <tr>
                  <td className="border p-1 text-right font-medium">
                    Advance Received
                  </td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_advance}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td className="border p-1 text-right">Balance</td>
                  <td className="border p-1 text-right">
                    {estimateData?.estimate?.estimate_balance}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileEstimateView;
