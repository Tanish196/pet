import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar'
import Header from '../../components/header'
import { useSidebar } from '../../contexts/SidebarContext'
import AccountCard from '../../components/Cards/AccountCard'
import { IoPersonAddOutline } from "react-icons/io5";
import { useUser } from '../../contexts/UserInfoContext';
import axiosInstance from '../../utils/axiosInstance';
import Modal from "react-modal"
import AddEditAccount from '../../components/Modals/AddEditAccount';
import Confirmation from '@/components/Confirmation';

const Accounts = () => {
  let { isSidebarOpen } = useSidebar();
  const { userInfo } = useUser();
  const [accounts, setaccounts] = useState(userInfo?.accounts || []);
  const [balances, setbalances] = useState({})
  const [addEditAccount, setaddEditAccount] = useState({ isOpen: false, mode: "add", data: null })
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, accountId: null });
  const onClose = () => {
    setaddEditAccount({ isOpen: false, mode: "add", data: null })
  }

  const handleDelete = async (accountId) => {
    // const confirmDelete = window.confirm('Do you really want to delete the Account ?');
    // console.log(confirmDelete)
    try {
      const res = await axiosInstance.delete('/delete-account/' + accountId)
      if (res.data && res.data.message) {
        setaccounts(prev => prev.filter(acc => acc._id !== accountId));
        // showToastMessage(res.data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }


  const handleEdit = (accountData) => {
    setaddEditAccount({ isOpen: true, mode: "edit", data: accountData })
  }

  // API call to get transactions accountwise  
  const getBalance = async (value) => {
    try {
      // API calling in get and post request is different
      const res = await axiosInstance.get('/get-accounts-transactions', {
        params: { account: value }
      });

      let accountBalance = 0;
      for (let tx of res.data.transactions) {
        if (tx.type === "Income") {
          accountBalance += tx.amount;
        } else if (tx.type === "Expense") {
          accountBalance -= tx.amount;
        }
      }

      return accountBalance;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.accounts) {
      setaccounts(userInfo.accounts);
    }
  }, [userInfo]);

  const fetchGetBalances = async () => {
    const newBalances = {}
    for (let i of accounts) {
      newBalances[i._id] = await getBalance(i.type);
    }
    setbalances(newBalances)
  }

  // for async getBalances
  useEffect(() => {
    if (accounts.length > 0) {
      fetchGetBalances()
    }

  }, [accounts])


  // Bug: SideBarOpen when add account
  // const onAddClick = () => {
  //   setaddEditAccount({ isOpen: true, mode: "add", data: null })
  //   isSidebarOpen = false
  // }

  // useEffect(() => {
  //   isSidebarOpen =false
  // }, [setaddEditAccount])


  return (

    <div>
      {/* Confirmation modal */}
      {confirmDelete.isOpen && (
        <Confirmation
          message="Are you sure you want to delete this account?"
          onConfirm={() => {
            handleDelete(confirmDelete.accountId);
            setConfirmDelete({ isOpen: false, accountId: null });
          }}
          onCancel={() => setConfirmDelete({ isOpen: false, accountId: null })}
        />
      )}
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <Header value="Accounts" />
          <div className='flex justify-center p-10 mt-10'>
            <div className='bg-g max-w-4xl rounded-2xl text-3xl pt-4 p-2'>
              {userInfo && (
                <>
                  <div className='flex justify-between gap-5 px-5'>
                    <p>Accounts</p>
                    <p>Balance : {Object.values(balances).reduce((a, b) => a + b, 0)}</p>
                  </div>

                  <div className='gap-5 justify-center w-200'>
                    {accounts.length > 0 ? accounts.map((acc) => (
                      <AccountCard
                        key={acc._id}
                        name={acc.type}
                        balance={balances[acc._id]}
                        editAccount={() => handleEdit(acc)}
                        deleteAccount={() => setConfirmDelete({ isOpen: true, accountId: acc._id })}
                        accountId={acc._id} />          // cannot use getBalances directly here as it is a async function
                    )) : (
                      <p className='mt-10 mb-5 text-center text-sm'>No Active Accounts found. Create a new account.</p>
                    )}
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className='absolute bottom-20 right-12 text-4xl bg-lg p-2 rounded-2xl hover:cursor-pointer items-center'>
        <IoPersonAddOutline onClick={() => {
          setaddEditAccount({ isOpen: true, mode: "add", data: null })
          isSidebarOpen = false
        }} />
      </div>

      <Modal isOpen={addEditAccount.isOpen}
        onRequestClose={onClose}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
        }}
        contentLabel='Account'
        className={"w-[53%] max-h-3/4 bg-lg rounded-md mx-auto mt-20 p-5 overflow-auto"}>
        <AddEditAccount mode={addEditAccount.mode} accounts={accounts} onClose={onClose} setaccounts={setaccounts} accountData={addEditAccount.data} />

      </Modal>
    </div>

  );
};

export default Accounts;