import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useSidebar } from "../../contexts/SidebarContext";
import { IoMdAdd } from "react-icons/io";
import Modal from "react-modal";
import TransactionCard from "../../components/Cards/TransactionCard";
import axiosInstance from "../../utils/axiosInstance";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";
import dayjs from "dayjs";
import AddEditTransaction from "@/components/Modals/AddEditTransaction";
// import AddEditTransaction from "../../components/Modals/AddEditTransaction";
import { useUser } from "@/contexts/UserInfoContext";

const Transactions = () => {
  const { userInfo } = useUser()
  const { isSidebarOpen } = useSidebar();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [accounts, setAccounts] = useState(userInfo?.accounts || [])
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const categories = userInfo?.category || []

  const [addEditTransaction, setAddEditTransaction] = useState({
    isOpen: false,
    type: "add",
    data: null,
  });

  // Move month backward
  const prevMonth = () => {
    setCurrentMonth((prev) => prev.subtract(1, "month"));
  };

  // Move month forward
  const nextMonth = () => {
    setCurrentMonth((prev) => prev.add(1, "month"));
  };

  const onClose = () => {
    setAddEditTransaction({ isOpen: false, type: "add", data: null });
  };

  // Fetch transactions from backend
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

  const handleDelete = async (transactionId) => {
    try {
      const res = await axiosInstance.delete(
        "/delete-trans/" + transactionId
      );
      if (res.data && res.data.message) {
        setTransactions((prev) =>
          prev.filter((t) => t._id !== transactionId)
        );
        getTransactions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (transactionData) => {
    setAddEditTransaction({ isOpen: true, type: "edit", data: transactionData });
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const accountsType = accounts.map(acc => acc.type);
  useEffect(() => {
    if (userInfo && userInfo.accounts) {
      setAccounts(userInfo.accounts);
    }
  }, [userInfo]);

  // Apply both search and month filter
  const filteredTransactions = transactions.filter((t) => {
    // const matchesSearch =
    //   search === "" ||
    //   t.note?.toLowerCase().includes(search.toLowerCase());
    const matchesMonth = dayjs(t.date).isSame(currentMonth, "month");

    const matchesAccount =
      selectedAccount === "all" || t.accountCat === selectedAccount;

    const matchesCategory =
      filterCategory === "all" || t.category === filterCategory;

    return matchesMonth && matchesAccount && matchesCategory;
  });

  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div
          className={`flex-1 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-0"
            }`}
        >
          <Header value="Transactions" />
          <div className="flex justify-center p-10 mt-10">
            <div className="bg-g max-w-6xl rounded-2xl text-3xl p-4 w-full gap-6">
              <p className="px-4">Transactions</p>
              <div className="flex gap-6 mt-4" >
                {/* Left: Filters */}
                <div className="w-1/3 bg-black text-white rounded-lg p-4 text-sm max-h-130">
                  <p className="font-semibold mb-2">Filters</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-4">
                      <label className="text-white">Filter by Category:</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="p-2 rounded bg-black text-white border border-gray-600"
                      >

                        <option value="all">All Categories</option>
                        {
                          categories.map((cat, idx) => (
                            <option key={idx} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="bg-dg px-2 py-1 rounded">
                      <button className="bg-dg px-2 py-1 rounded flex items-center justify-between">
                        <label className="mr-2">Account Filter:</label>
                        <select
                          name="account"
                          className="bg-black text-white rounded px-2 py-1"
                          value={selectedAccount}
                          onChange={(e) => setSelectedAccount(e.target.value)}
                        >
                          <option value="all">All Accounts</option>
                          {accounts.map((acc) => (
                            <option value={acc.type} key={acc._id}>
                              {acc.type}
                            </option>
                          ))}
                        </select>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Transactions */}
                <div className="flex-1">
                  {/* Month Navigation */}
                  <div className="flex rounded-xl items-center justify-between mb-4 bg-black">
                    <button
                      onClick={prevMonth}
                      className="p-2 rounded-full"
                    >
                      <MdNavigateBefore className="text-lg hover:text-white" />
                    </button>
                    <h2 className="text-sm">
                      {currentMonth.format("MMMM YYYY")}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="p-2 rounded-full"
                    >
                      <MdNavigateNext className="text-lg hover:text-white" />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      className="w-full rounded px-3 py-2 text-sm bg-black text-white outline-none"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Transactions List */}
                  <div>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TransactionCard
                          key={transaction._id}
                          transaction={transaction}
                          deleteTransaction={() =>
                            handleDelete(transaction._id)
                          }
                          editTransaction={() => handleEdit(transaction)}
                        />
                      ))
                    ) : (
                      <p className="mt-10 mb-5 text-center text-sm">
                        No transactions found for{" "}
                        {currentMonth.format("MMMM YYYY")}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Transaction Button */}
          <div className="fixed bottom-20 right-12 text-4xl bg-lg p-2 rounded-2xl hover:cursor-pointer items-center">
            <IoMdAdd
              onClick={() =>
                setAddEditTransaction({
                  isOpen: true,
                  type: "add",
                  data: null,
                })
              }
            />
          </div>

          {/* Modal for Add/Edit Transaction */}
          <Modal
            isOpen={addEditTransaction.isOpen}
            onRequestClose={onClose}
            style={{
              overlay: {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
              },
            }}
            contentLabel="Transaction"
            className={
              "w-[53%] max-h-3/4 bg-lg rounded-md mx-auto mt-20 p-5 overflow-auto"
            }
          >
            {/* Replace with AddEditTransaction modal */}
            <AddEditTransaction
              type={addEditTransaction.type}
              transactionData={addEditTransaction.data}
              onClose={onClose}
              getAllTransactions={getTransactions}
              accounts={accountsType}
            />
            {/* <p className="text-center">Transaction Modal Goes Here 🚀</p> */}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
