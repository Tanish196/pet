import React, { useState } from 'react';
import { MdClose } from 'react-icons/md';
// import axiosInstance from '../../utils/axiosInstance';
import axiosInstance from '../../utils/axiosInstance';

const AddEditAccount = ({
    showToastMessage,
    mode,   // "add" or "edit"
    onClose,
    accounts,
    setaccounts,
    accountData // pass this only in edit mode
}) => {

    const [type, setType] = useState(accountData?.type || ""); // pre-fill when editing
    const [error, seterror] = useState("");
    // console.log(mode)
    const handleSubmit = () => {
        if (mode === "edit") {
            editAccount(accountData?._id);
        } else {
            addAccount();
        }
    };

    const editAccount = async (accountId) => {
        if (!accountId) {
            seterror("Some error occurred. Please reload.");
            return;
        }
        try {
            const res = await axiosInstance.put(`/edit-account/${accountId}`, { type: type });
            console.log(res.data)
            if (res.data && res.data.accounts) {
                setaccounts(res.data.accounts);
                // showToastMessage("Account updated successfully");
                onClose()
            }
        } catch (error) {
            if (error.res && error.res.data && error.res.data.message) {
                seterror(error.res.data.message)
            }
        }
    };

    const addAccount = async () => {
        try {
            const res = await axiosInstance.post('/add-account', { type:type });
            console.log(res)
            if (res.data && res.data.account) {
                setaccounts(prev => [...prev, res.data.account]); // update state immediately
                // showToastMessage("Account added successfully");
                onClose()
            }
        } catch (err) {
            console.log(err);
        }
    };


    return (
        <div>
            <div className='flex relative flex-col gap-2 w-full p-2'>
                <button
                    onClick={onClose}
                    className='w-10 h-10 bg-black rounded-xl flex items-center justify-center absolute -top-3 -right-3 cursor-pointer'>
                    <MdClose />
                </button>

                <h2 className="text-2xl">
                    {mode === "edit" ? "Edit Account" : "Add Account"}
                </h2>

                <div className='flex gap-5 items-center'>
                    <input
                        className='w-full bg-black outline-none rounded text-white px-4 py-2'
                        type='text'
                        placeholder='Name'
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    />
                </div>

                <div className='flex gap-5 items-center'>
                    <p>Balance:</p>
                    <p>{mode === "add" ? 0 : accountData?.balance || 0}</p>
                </div>

                <button
                    className='w-full bg-black font-medium p-3 rounded hover:cursor-pointer'
                    onClick={handleSubmit}
                >
                    {mode === "edit" ? "UPDATE" : "ADD"}
                </button>

                {error && <p className='text-red text-sm'>{error}</p>}
            </div>
        </div>
    );
};

export default AddEditAccount;