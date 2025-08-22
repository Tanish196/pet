import React, { use, useEffect, useState } from "react";
import { MdDateRange, MdClose } from "react-icons/md";
import { CalendarDate } from "../calendarDate";
import { useCategory } from "@/contexts/CategoryContext";
import axiosInstance from "@/utils/axiosInstance";
import dayjs from "dayjs";

const AddEditTransaction = ({
    onClose,
    transactionData,
    type,
    getAllTransactions,
    accounts
}) => {

    const { category, addCategory, removeCategory, setCategory } = useCategory();
    const [transactionType, setTransactionType] = useState("Income")
    const [date, setDate] = useState(type === "edit" ? new Date(transactionData.date) : new Date());
    const [name, setName] = useState(transactionData?.note || "");
    const [amount, setAmount] = useState(transactionData?.amount || 0);
    const [account, setAccount] = useState(transactionData?.accountCat || "");
    const [selectedCategory, setSelectedCategory] = useState(transactionData?.category || "");

    // console.log(account)
    const [openDateCalendar, setOpenDateCalendar] = useState(false);
    const [isAddCategory, setIsAddCategory] = useState(false);
    const [newCat, setNewCat] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (type === "edit") {
            editTransaction(transactionData?._id);
        } else {
            addTransaction();
        }
    };

    const editTransaction = async (transactionId) => {
        try {
            const res = await axiosInstance.put(`/edit-transaction/${transactionId}`, {
                note: name,
                date: dayjs(date).format("MMMM D, YYYY"),
                amount,
                accountCat: account,
                category: selectedCategory,
                type: transactionType
            });
            if (res.data && res.data.transaction) {
                getAllTransactions();
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to edit transaction");
        }
    };

    const addTransaction = async () => {
        try {
            const res = await axiosInstance.post("/create-transaction", {
                note: name,
                date: dayjs(date).format("MMMM D, YYYY"),
                amount,
                accountCat: account,
                category: selectedCategory,
                type: transactionType
            });
            if (res.data && res.data.transaction) {
                getAllTransactions();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // useEffect(() => {


    //   return () => {
    //     setCategory()
    //   }
    // }, [category])


    return (
        <div>

            <div className="flex gap-2">
                <h2 className="text-2xl mb-4 py-3 rounded-xl px-3 text-white bg-black font-bold w-full">
                    {type === "edit" ? "Edit Transaction" : "Add Transaction"}
                </h2>
                <button
                    className="text-3xl bg-black py-3 px-3 mb-4 rounded-xl hover:cursor-pointer"
                    onClick={onClose}
                >
                    <MdClose />
                </button>
            </div>

            <div>
                <input
                    type="text"
                    className="input-box"
                    placeholder="Transaction Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onClick={() => setOpenDateCalendar(false)}
                />

                <select
                    name="type"
                    className="input-box"
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    onClick={() => setOpenDateCalendar(false)}
                >
                    <option value="Income" className="bg-black">Income</option>
                    <option value="Expense" className="bg-black">Expense</option>
                </select>


                {/* Date */}
                <div className="flex gap-3 justify-center">
                    <label className="w-[20%]">Date:</label>
                    <input
                        type="text"
                        className="input-box"
                        value={dayjs(date).format("MM/DD/YYYY")}
                        onChange={(e) => setDate(e.target.value)}
                        readOnly
                    />
                    <div className="relative">
                        <MdDateRange
                            className="text-4xl hover:cursor-pointer hover:text-black"
                            onClick={() => setOpenDateCalendar(!openDateCalendar)}
                        />
                        {openDateCalendar && <CalendarDate date={date} setDate={setDate} />}
                    </div>
                </div>

                {/* Amount */}
                <input
                    type="number"
                    placeholder="Amount"
                    className="input-box"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onClick={() => setOpenDateCalendar(false)}
                />

                {/* Account */}
                <div className="flex gap-3">
                    <select
                        className="input-box"
                        value={account}
                        onChange={(e) => {
                            setAccount(e.target.value);
                        }}
                        onClick={() => setOpenDateCalendar(false)}

                    >
                        <option value="" className="bg-black">-- Select Account --</option>
                        {accounts.map((cat) => (
                            <option key={cat} className="bg-black" value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Category */}
                <div className="flex gap-3">
                    <select
                        className="input-box"
                        value={selectedCategory}
                        onClick={() => setOpenDateCalendar(false)}

                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "__add__") {
                                setIsAddCategory(true);
                                setSelectedCategory("");
                            } else {
                                setSelectedCategory(value);
                            }
                        }}
                    >
                        <option value="" className="bg-black">-- Select Category --</option>
                        {category.map((cat) => (
                            <option key={cat} className="bg-black" value={cat}>
                                {cat}
                            </option>
                        ))}
                        <option value="__add__" className="bg-black">➕ Add Category</option>
                    </select>
                    <button
                        className="button mb-4 w-[20%] disabled:opacity-50"
                        disabled={!selectedCategory}
                        onClick={() => {
                            removeCategory(selectedCategory); // context handles state + backend
                            setSelectedCategory("");
                            setOpenDateCalendar(false)
                        }}
                    >
                        Delete
                    </button>
                </div>

                {/* Add New Category */}
                {isAddCategory && (
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            className="input-box"
                            value={newCat}
                            onChange={(e) => setNewCat(e.target.value)}
                            placeholder="Enter new category"
                        />
                        <button
                            className="px-3 py-1 bg-black text-white rounded"
                            onClick={() => {
                                if (newCat.trim()) {
                                    addCategory(newCat.trim());
                                    setNewCat("");
                                    setIsAddCategory(false);
                                }
                            }}
                        >
                            Add
                        </button>
                        <button
                            className="px-3 py-1 bg-black text-white rounded"
                            onClick={() => setIsAddCategory(false)}
                        >
                            Close
                        </button>
                    </div>
                )}

                <button className="button mt-4" onClick={handleSubmit}>
                    {type === "edit" ? "UPDATE" : "ADD"}
                </button>
            </div>
        </div>
    );
};

export default AddEditTransaction;