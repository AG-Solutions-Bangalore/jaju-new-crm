import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const TransactionTable = ({ type, items, total, variant = "desktop" }) => {
  const isCredit = type === "credit";
  const headerLabel = isCredit ? "Credit Transactions" : "Debit Transactions";
  const nameLabel = isCredit ? "Credit By" : "Debit By";
  const nameField = isCredit ? "received_about" : "payment_about";
  const amountField = isCredit ? "received_amount" : "payment_amount";
  const totalAmount = total
    ? isCredit
      ? total.total_received_amount
      : total.total_payment_amount
    : null;

  const bgClass = isCredit ? "green" : "red";

  if (variant === "mobile") {
    return (
      <div className="mb-4">
        <div className={`text-sm font-medium bg-${bgClass}-50 p-1 text-center border`}>
          {headerLabel}
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1 w-8">#</th>
              <th className="border p-1 text-left">{nameLabel}</th>
              <th className="border p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items?.length ? (
              items.map((item, index) => (
                <tr
                  key={`${type}-${index}`}
                  className={index % 2 === 0 ? "bg-white" : `bg-${bgClass}-50`}
                >
                  <td className="border p-1 text-center">{index + 1}</td>
                  <td className="border p-1 text-left">{item[nameField]}</td>
                  <td className="border p-1 text-center">{item[amountField]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border p-2 text-center text-gray-500">
                  No {type} transactions
                </td>
              </tr>
            )}
            {totalAmount && (
              <tr className={`bg-${bgClass}-50 font-medium`}>
                <td colSpan={2} className="border p-1 text-center">
                  Total
                </td>
                <td className="border p-1 text-center">{totalAmount}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Table className="border">
        <TableHeader>
          <TableRow className={`bg-${bgClass}-100 hover:bg-${bgClass}-100`}>
            <TableHead colSpan={3} className={`text-center text-black bg-${bgClass}-50`}>
              {headerLabel}
            </TableHead>
          </TableRow>
          <TableRow className="bg-gray-100 hover:bg-gray-100">
            <TableHead className="text-center w-10">#</TableHead>
            <TableHead className="text-center">{nameLabel}</TableHead>
            <TableHead className="text-center">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.length ? (
            items.map((item, index) => (
              <TableRow
                key={`${type}-${index}`}
                className={index % 2 === 0 ? "bg-white" : `bg-${bgClass}-50/30`}
              >
                <TableCell className="text-center border-r">{index + 1}</TableCell>
                <TableCell className="text-left border-r">{item[nameField]}</TableCell>
                <TableCell className="text-center">{item[amountField]}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                No {type} transactions found
              </TableCell>
            </TableRow>
          )}
          {totalAmount && (
            <TableRow className={`bg-${bgClass}-50/30 font-medium`}>
              <TableCell colSpan={2} className="text-center border-r">
                Total
              </TableCell>
              <TableCell className="text-center">{totalAmount}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;
