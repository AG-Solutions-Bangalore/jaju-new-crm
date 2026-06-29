const BalanceAlert = ({ balance, receivedTotal, paymentTotal, variant = "desktop" }) => {
  if (balance === 0) return null;

  if (variant === "mobile") {
    return (
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div
          className={`p-2 rounded-md ${
            balance >= 0
              ? "bg-green-50 border-green-100"
              : "bg-red-50 border-red-100"
          } border`}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-green-800">Credit: {receivedTotal || 0}</p>
              <p className="text-red-800">Debit: {paymentTotal || 0}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">Difference</p>
              <p
                className={`font-bold ${
                  balance >= 0 ? "text-green-800" : "text-red-800"
                }`}
              >
                {balance}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-4 pt-4">
      <div
        className={`p-2 rounded-md ${
          balance >= 0
            ? "bg-green-50 border-green-100"
            : "bg-red-50 border-red-100"
        } border`}
      >
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-green-800">Credit: {receivedTotal || 0}</p>
            <p className="text-red-800">Debit: {paymentTotal || 0}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Difference</p>
            <p
              className={`font-bold ${
                balance >= 0 ? "text-green-800" : "text-red-800"
              }`}
            >
              {balance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceAlert;
