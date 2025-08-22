import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../contexts/SidebarContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useUser } from '@/contexts/UserInfoContext';
import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import BudgetCard from '@/components/Cards/BudgetCard';
// import AccountCard from '@/components/Cards/AccountCard';

const Dashboard = () => {
  const { isSidebarOpen } = useSidebar()
  const { userInfo } = useUser()
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (userInfo?.accounts) {
      setAccounts(userInfo.accounts);
    }
  }, [userInfo]);

  const data = useMemo(() => {
    if (!userInfo?.categories) return [];

    return userInfo.categories.map((cat, index) => ({
      name: cat.name,
      value: Number(cat.total || 0),
      color: COLORS[index % COLORS.length],
    }));
  }, [userInfo]);

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

  const getBudgets = async () => {
    try {
      const res = await axiosInstance.get("/get-budgets");
      if (res.data && res.data.budgets) {
        setBudgets(res.data.budgets);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTransactions();
    getBudgets()
  }, []);

  const monthlyData = transactions
    ? transactions.reduce((acc, tx) => {
      const month = new Date(tx.date).toLocaleString("default", { month: "short" });
      let found = acc.find(item => item.month === month);
      if (!found) {
        found = { month, Income: 0, Expense: 0 };
        acc.push(found);
      }
      if (tx.type === "Income") found.Income += tx.amount;
      if (tx.type === "Expense") found.Expense += tx.amount;
      return acc;
    }, [])
    : [];

  const pastMonthlyData = transactions
    ? transactions
      .filter(tx => {
        const txDate = new Date(tx.date);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() - 1;
      })
      .reduce((acc, tx) => {
        const day = new Date(tx.date).getDate();
        let found = acc.find(item => item.day === day);
        if (!found) {
          found = { day, Income: 0, Expense: 0 };
          acc.push(found);
        }
        if (tx.type === "Income") found.Income += tx.amount;
        if (tx.type === "Expense") found.Expense += tx.amount;
        return acc;
      }, [])
    : [];

  const getLastTransactions = (transactions) => {
    if (!transactions || transactions.length === 0) return { income: null, expense: null };

    // Sort by date (latest first) if not already sorted
    const sortedTxns = [...transactions].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const lastIncome = sortedTxns.find(txn => txn.type === "Income") || null;
    const lastExpense = sortedTxns.find(txn => txn.type === "Expense") || null;

    return { income: lastIncome, expense: lastExpense };
  };

  const { income: lastIncome, expense: lastExpense } = getLastTransactions(transactions);

  const getClosestBudget = (budgets) => {
    if (!budgets || budgets.length === 0) return null;

    const today = new Date();
    const activeBudgets = budgets.filter(b => new Date(b.endDate) >= today);

    if (activeBudgets.length === 0) return null;

    activeBudgets.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    return activeBudgets[0];
  };

  const lastBudget = getClosestBudget(budgets);

  const getBalanceByCategory = (category) => {
    const filteredTransactions = transactions.filter(
      (t) => t.category === category
    );
    const totalSpent = filteredTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    return totalSpent;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9b59b6', '#e74c3c'];

  const getCategorySplit = () => {
    if (!transactions || transactions.length === 0 || !userInfo?.category) return [];

    return userInfo.category.map((cat) => {
      const spent = transactions
        .filter((t) => t.category === cat && t.type === "Expense")
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { name: cat, value: spent };
    }).filter(item => item.value > 0); // remove empty categories
  };

  const pieData = getCategorySplit();

  const getBalanceByAccount = (account) => {
    const filteredTransactions = transactions.filter(
      (t) => t.accountCat === account
    );

    const balance = filteredTransactions.reduce((sum, t) => {
      if (t.type === "Expense") {
        return sum - Number(t.amount);
      } else if (t.type === "Income") {
        return sum + Number(t.amount);
      }
      return sum;
    }, 0);

    return balance;
  };

  const getOverallBalance = () => {
    if (!accounts || accounts.length === 0) return 0;

    return accounts.reduce((total, acc) => total + getBalanceByAccount(acc.type), 0);
  };

  const getTwoAccounts = () => {
    let rec = accounts.map((acc) => ({
      type: acc.type,
      balance: getBalanceByAccount(acc.type),
    }));

    rec.sort((a, b) => b.balance - a.balance);
    return rec.slice(0, 4);
  };


  const taccounts = getTwoAccounts()

  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Header value="DASHBOARD" />
          <div className='mt-12'>
            <div className='p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 '>
              <div className='min-h-40 dashboardCard'>
                <h1 className='text-3xl bg-black rounded p-2'>Summary</h1>
                <div className='gap-3 flex flex-col'>
                  <div className='bg-black rounded p-2 mt-2 text-xl'>Balance : {getOverallBalance()}</div>
                  <div className='bg-black rounded p-2'>
                    <h2 className='text-xl'>Last Transactions</h2>
                    {lastIncome && (
                      <p className='mt-2'>
                        Last Income: {lastIncome.amount} ({lastIncome.category})
                      </p>
                    )}
                    {lastExpense && (
                      <p >
                        Last Expense: {lastExpense.amount} ({lastExpense.category})
                      </p>
                    )}
                  </div>
                </div>

              </div>

              <div className='min-h-40 dashboardCard'>
                <h1 className='text-3xl bg-black rounded p-2'>
                  Closest Budget Deadline
                </h1>
                {lastBudget ? <BudgetCard
                  key={lastBudget?._id}
                  name={lastBudget?.name}
                  amount={lastBudget?.amount}
                  startDate={lastBudget?.startDate}
                  endDate={lastBudget?.endDate}
                  budgetId={lastBudget?._id}
                  category={lastBudget?.category}
                  balance={getBalanceByCategory(lastBudget?.category)}
                  isHide={true}
                /> : <p className='text-xl p-2'>No Budget Yet</p>}
              </div>

              <div className="min-h-40 dashboardCard">
                <h1 className="text-3xl bg-black rounded p-2">Accounts</h1>
                <div>
                  {taccounts.length > 0 ? (
                    taccounts.map((acc, idx) => (
                      <div key={idx} className="p-2 border-b">
                        <div>
                          {acc.type} : {acc.balance}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Loading accounts...</p>
                  )}
                </div>
              </div>


            </div>
            <div className='px-4 grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <div className='min-h-40 dashboardCard'>
                  <h1 className="text-3xl bg-black rounded p-2 mb-2">Categories Split</h1>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="p-4">No category expenses yet</p>
                  )}
                </div>


              </div>
              <div>
                <div className='min-h-40 dashboardCard'>

                  <h1 className='text-3xl bg-black p-2 rounded mb-2'>Income VS Expense</h1>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Income" stroke="#8884d8" />
                      <Line type="monotone" dataKey="Expense" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className='min-h-40 dashboardCard mt-6'>
                  <h2 className='text-3xl bg-black p-2 rounded mb-2'>Past Month</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={pastMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Income" fill="#8884d8" />
                      <Bar dataKey="Expense" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
export default Dashboard