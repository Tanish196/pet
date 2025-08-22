import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/header';
import { useSidebar } from '../../contexts/SidebarContext';
import BudgetCard from '../../components/Cards/BudgetCard';
import { IoMdAdd } from "react-icons/io";
import Modal from "react-modal";
import AddEditBudget from '../../components/Modals/AddEditBudget';
import axiosInstance from '../../utils/axiosInstance';

const Budgets = () => {
  const { isSidebarOpen } = useSidebar();
  const [budgets, setBudgets] = useState([]);
  const [addEditBudget, setAddEditBudget] = useState({ isOpen: false, type: "add", data: null });
  const [transactions, setTransactions] = useState([])
  const onClose = () => {
    setAddEditBudget({ isOpen: false, type: "add", data: null });
  };

  // Fetch budgets from backend
  const getBudgets = async () => {
    try {
      const res = await axiosInstance.get('/get-budgets');
      if (res.data && res.data.budgets) {
        setBudgets(res.data.budgets);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (budgetId) => {
    try {
      const res = await axiosInstance.delete('/delete-budget/' + budgetId);
      if (res.data && res.data.message) {
        setBudgets(prev => prev.filter(b => b._id !== budgetId));
        showToastMessage(res.data.message); // make sure you have a toast util like in Accounts
        getBudgets()
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const getBalanceByCategory = (category) => {
    const filteredTransactions = transactions.filter(
      (t) => t.category === category
    );
    const totalSpent = filteredTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0);
    return totalSpent;
  };

  const handleEdit = (budgetData) => {
    setAddEditBudget({ isOpen: true, type: "edit", data: budgetData });
  };

  useEffect(() => {
    getBudgets();
    getTransactions()
  }, []);

  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Header value="Budgets" />
          <div className='flex justify-center p-10 mt-10'>
            <div className='bg-g max-w-4xl rounded-2xl text-3xl pt-4 p-2'>
              <div className='flex justify-between gap-5 px-5'>
                <p>Budgets</p>
              </div>

              <div className='gap-5 justify-center w-200'>
                {budgets.length > 0 ? budgets.map((budget) => (
                  <BudgetCard
                    key={budget._id}
                    name={budget.name}
                    amount={budget.amount}
                    startDate={budget.startDate}
                    endDate={budget.endDate}
                    editBudget={() => handleEdit(budget)}
                    deleteBudget={() => handleDelete(budget._id)}
                    budgetId={budget._id}
                    category={budget.category}
                    balance={getBalanceByCategory(budget.category)}
                    isHide={false}
                  />
                )) : (
                  <p className='mt-10 mb-5 text-center text-sm'>
                    No Budgets found. Create a new budget.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Budget Button */}
      <div className='absolute bottom-20 right-12 text-4xl bg-lg p-2 rounded-2xl hover:cursor-pointer items-center'>
        <IoMdAdd onClick={() => setAddEditBudget({ isOpen: true, type: "add", data: null })} />
      </div>

      {/* Modal */}

      <Modal
        isOpen={addEditBudget.isOpen}
        onRequestClose={onClose}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        }}
        contentLabel='Budget'
        className={"w-[53%] max-h-3/4 bg-lg rounded-md mx-auto mt-20 p-5 overflow-auto"}
      >
        <AddEditBudget
          type={addEditBudget.type}
          budgetData={addEditBudget.data}
          onClose={onClose}
          showToastMessage={() => { }}
          getAllBudgets={getBudgets}
          setBudgets={setBudgets}
        />
      </Modal>
    </div>
  );
};

export default Budgets;