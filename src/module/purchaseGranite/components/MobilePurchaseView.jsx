import React from "react";
import moment from "moment";
import { ChevronLeft, Printer } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import ReactToPrint from "react-to-print";
import { Loader2 } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";

const MobilePurchaseView = ({
  purchaseData,
  calculateSubTotal,
  subTotal,
  tax,
  tempo,
  loading,
  unloading,
  other,
  other1,
  roundOff,
  amountToBeCollected,
  isLoading,
  handleDownloadPDF,
  tableRef,
  navigate,
}) => {
  if (!purchaseData) return null;

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
                onClick={() => navigate("/purchase")}
                className="rounded-full p-1"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-bold text-gray-800">
                Purchase Details
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
                documentTitle="Purchase Granite Report"
              />
            </div>
          </div>
        </div>
      </div>

      {purchaseData && (
        <div className="p-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="text-center border p-2 space-y-1 mb-3 text-xs bg-white">
                <h3 className="text-sm font-semibold">
                  JAJU'S FLOORING CONCEPTS
                </h3>
                <p className="text-xs">New 80 ft Sompura, Sriniwaspura Road</p>
                <p className="text-xs">Bengaluru, Karnataka 560098</p>
                <p className="text-xs">Phone: 097420 42097</p>
                <h4 className="text-sm font-semibold mt-1">PURCHASE</h4>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex justify-center border p-1 bg-white">
                  <span className="font-medium">Date:</span>{" "}
                  <span className="ml-1">
                    {moment(purchaseData?.purchase?.purchase_date).format(
                      "DD-MMM-YYYY"
                    )}
                  </span>
                </div>
                <div className="flex justify-center border p-1 bg-white">
                  <span className="font-medium">Purchase No:</span>{" "}
                  <span className="ml-1">
                    {purchaseData?.purchase?.purchase_no}
                  </span>
                </div>
              </div>

              <div className="border p-2 text-xs mb-3 bg-white">
                <span className="font-semibold">Supplier:</span>{" "}
                <span>{purchaseData?.purchase?.purchase_supplier}</span>
              </div>

              <table className="w-full border-collapse text-xs mb-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1 text-left">Sl No</th>
                    <th className="border p-1 text-left">Item</th>
                    <th className="border p-1 text-right">Qty (pcs/box)</th>
                    <th className="border p-1 text-right">Qty (sqft)</th>
                    <th className="border p-1 text-right">Rate</th>
                    <th className="border p-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseData?.purchaseSub?.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border p-1 text-left">{index + 1}</td>
                      <td className="border p-1 text-left">
                        {item.purchase_sub_item}
                      </td>
                      <td className="border p-1 text-right">
                        {item.purchase_sub_pcs}
                      </td>
                      <td className="border p-1 text-right">
                        {parseFloat(item.purchase_sub_qnty_sqr) ||
                          item.purchase_sub_qnty_sqr ||
                          0}
                      </td>
                      <td className="border p-1 text-right">
                        {item.purchase_sub_rate}
                      </td>
                      <td className="border p-1 text-right">
                        {item.purchase_sub_amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="w-full border-collapse text-xs bg-white">
                <tbody>
                  <tr className="font-bold">
                    <td className="border p-1 text-right">Total</td>
                    <td className="border p-1 text-right">{subTotal}</td>
                  </tr>
                  <tr>
                    <td className="border p-1 text-right font-medium">
                      Tax (GST{" "}
                      {purchaseData?.purchase?.purchase_gst_percentage || 18}% ={" "}
                      {Number(tax).toFixed(0)})
                    </td>
                    <td className="border p-1 text-right">
                      {Number(tax).toFixed(0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-1 text-right font-medium">
                      Tempo Charges
                    </td>
                    <td className="border p-1 text-right">
                      {Number(tempo).toFixed(0)}
                    </td>
                  </tr>
                  {Number(loading) > 0 && (
                    <tr>
                      <td className="border p-1 text-right font-medium">
                        Loading Only
                      </td>
                      <td className="border p-1 text-right">
                        {Number(loading).toFixed(0)}
                      </td>
                    </tr>
                  )}
                  {Number(unloading) > 0 && (
                    <tr>
                      <td className="border p-1 text-right font-medium">
                        Loading & Unloading
                      </td>
                      <td className="border p-1 text-right">
                        {Number(unloading).toFixed(0)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="border p-1 text-right font-medium">
                      Other Charges
                    </td>
                    <td className="border p-1 text-right">
                      {Number(other).toFixed(0)}
                    </td>
                  </tr>
                  {Number(other1) > 0 && (
                    <tr>
                      <td className="border p-1 text-right font-medium">
                        {purchaseData?.purchase?.purchase_other1_label ||
                          "Other Charges 2"}
                      </td>
                      <td className="border p-1 text-right">
                        {Number(other1).toFixed(0)}
                      </td>
                    </tr>
                  )}
                  {Math.abs(Math.round(roundOff)) > 0 && (
                    <tr>
                      <td className="border p-1 text-right font-medium">
                        Round Off
                      </td>
                      <td className="border p-1 text-right">
                        {Math.round(roundOff) > 0
                          ? `+${Math.round(roundOff)}`
                          : Math.round(roundOff)}
                      </td>
                    </tr>
                  )}
                  <tr className="font-bold">
                    <td className="border p-1 text-right">
                      Amount to be Collected
                    </td>
                    <td className="border p-1 text-right">
                      {Number(amountToBeCollected).toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MobilePurchaseView;
