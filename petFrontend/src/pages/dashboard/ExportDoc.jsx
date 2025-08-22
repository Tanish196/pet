import Sidebar from '../../components/Sidebar';
import Header from '../../components/header';
import { useSidebar } from '../../contexts/SidebarContext';
import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';

const ExportDoc = () => {
  const { isSidebarOpen } = useSidebar();
  const [transactions, setTransactions] = useState([]);

  // Fetch transactions
  const getTransactions = async () => {
    try {
      const res = await axiosInstance.get("/get-transactions");
      if (res.data && res.data.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTransactions()
  }, [])

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Date","Note", "Account", "Category", "Type", "Amount"];
    const rows = transactions.map((t) => [
      new Date(t.date).toLocaleDateString(),
      t.note,
      t.accountCat,
      t.category,
      t.type,
      t.amount
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      const xlsx = await import("xlsx");
      const worksheet = xlsx.utils.json_to_sheet(transactions.map(t => ({
        Date: new Date(t.date).toLocaleDateString(),
        Account: t.accountCat,
        Category: t.category,
        Type: t.type,
        Amount: t.amount,
        Note: t.note,
      })));
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Transactions");
      xlsx.writeFile(workbook, "transactions.xlsx");
    } catch (err) {
      console.error("❌ Error exporting to Excel:", err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className={`flex-1 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header value="EXPORT TRANSACTIONS" />
        <div className="mt-12 p-4">
          <div className="flex gap-4 mb-6">
            <button
              onClick={exportToCSV}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
            >
              Export as CSV
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
            >
              Export as Excel
            </button>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto bg-dg rounded-lg shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-lg">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Account</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((t) => (
                    <tr key={t._id} className="border-t">
                      <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-2">{t.accountCat}</td>
                      <td className="p-2">{t.category}</td>
                      <td className="p-2">{t.type}</td>
                      <td className="p-2">{t.amount}</td>
                      <td className="p-2">{t.note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      Loading transactions...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDoc;
