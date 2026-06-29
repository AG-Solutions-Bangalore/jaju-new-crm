export const validatePaymentReceivedEntries = (
  paymentEntries,
  receivedEntries,
) => {
  const paymentErrors = paymentEntries.map((entry) => ({
    account: !entry.payment_about ? "Account is required" : "",
    amount: !entry.payment_amount
      ? "Amount is required"
      : isNaN(entry.payment_amount)
        ? "Amount must be a number"
        : "",
  }));

  const receivedErrors = receivedEntries.map((entry) => ({
    account: !entry.received_about ? "Account is required" : "",
    amount: !entry.received_amount
      ? "Amount is required"
      : isNaN(entry.received_amount)
        ? "Amount must be a number"
        : "",
  }));

  const hasPaymentErrors = paymentErrors.some(
    (err) => err.account || err.amount,
  );
  const hasReceivedErrors = receivedErrors.some(
    (err) => err.account || err.amount,
  );

  return {
    paymentErrors,
    receivedErrors,
    hasErrors: hasPaymentErrors || hasReceivedErrors,
    hasPaymentErrors,
    hasReceivedErrors,
  };
};

export const buildValidationToast = (paymentErrors, receivedErrors) => {
  const hasPaymentErrors = paymentErrors.some(
    (err) => err.account || err.amount,
  );
  const hasReceivedErrors = receivedErrors.some(
    (err) => err.account || err.amount,
  );

  return (
    <div className="w-full space-y-2 text-xs max-h-[60vh] overflow-y-auto">
      {hasPaymentErrors && (
        <div>
          <div className="font-medium mb-1 text-white">Debit Errors</div>
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-red-50">
                <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-6">
                  #
                </th>
                <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800">
                  Account
                </th>
                <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-36">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentErrors.map(
                (error, i) =>
                  (error.account || error.amount) && (
                    <tr key={i} className="bg-white even:bg-gray-50">
                      <td className="px-1 py-0.5 text-center text-gray-500">
                        {i + 1}
                      </td>
                      <td className="px-1 py-0.5 text-red-600 truncate max-w-0">
                        {error.account}
                      </td>
                      <td className="px-1 py-0.5 text-red-600 font-mono text-right">
                        {error.amount}
                      </td>
                    </tr>
                  ),
              )}
            </tbody>
          </table>
        </div>
      )}
      {hasReceivedErrors && (
        <div>
          <div className="font-medium mb-1 text-white">Credit Errors</div>
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-red-50">
                <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-6">
                  #
                </th>
                <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800">
                  Account
                </th>
                <th className="px-1 py-0.5 text-left text-xs font-medium text-red-800 w-36">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {receivedErrors.map(
                (error, i) =>
                  (error.account || error.amount) && (
                    <tr key={i} className="bg-white even:bg-gray-50">
                      <td className="px-1 py-0.5 text-center text-gray-500">
                        {i + 1}
                      </td>
                      <td className="px-1 py-0.5 text-red-600 truncate max-w-0">
                        {error.account}
                      </td>
                      <td className="px-1 py-0.5 text-red-600 font-mono text-right">
                        {error.amount}
                      </td>
                    </tr>
                  ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
