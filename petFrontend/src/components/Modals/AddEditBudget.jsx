import React, { useState } from "react";
import { MdDateRange } from "react-icons/md";
import { CalendarDate } from "../CalendarDate";
import { useCategory } from "@/contexts/CategoryContext";
import axiosInstance from "@/utils/axiosInstance";
import { MdClose } from "react-icons/md";
import dayjs from "dayjs";

const AddEditBudget = ({ onClose, budgetData, type, getAllBudgets, showToastMessage, setBudgets }) => {
    const { category, addCategory, removeCategory } = useCategory();

    const [start, setStart] = useState(type === "edit" ? new Date(budgetData.startDate) : new Date());
    const [end, setEnd] = useState(type === "edit" ? new Date(budgetData.endDate) : new Date());

    const [name, setName] = useState(budgetData?.name || "")
    const [amount, setAmount] = useState(budgetData?.amount || 0)
    // const [cat, setCat] = useState(budgetData?.category || "")
    const [selectedCategory, setSelectedCategory] = useState(budgetData?.category || "");

    const [openStartCalendar, setOpenStartCalendar] = useState(false);
    const [openEndCalendar, setOpenEndCalendar] = useState(false);

    const [isAddCategory, setIsAddCategory] = useState(false);

    // For adding New Category
    const [newCat, setNewCat] = useState("");

    // const [type, setType] = useState(budgetData?.type || ""); // pre-fill when editing
    const [error, seterror] = useState("");
    // console.log(mode)

    const handleSubmit = () => {
        if (type === "edit") {
            editBudget(budgetData?._id);
        } else {
            addBudget();
        }
    };

    const editBudget = async () => {
        const budgetId = budgetData._id
        try {
            const res = await axiosInstance.put(`/edit-budget/${budgetId}`, {
                name,
                startDate: dayjs(start).format("MMMM D, YYYY"),
                endDate: dayjs(end).format("MMMM D, YYYY"),
                amount,
                category: selectedCategory,
            });
            // console.log(res.data)
            if (res.data && res.data.budget) {
                // showToastMessage({ message: "Budget Edited Successfully", type: 'edit' })
                // setbudget(res.data.accounts);
                getAllBudgets()
                // showToastMessage("Account updated successfully");
                onClose()
            }
        } catch (error) {
            if (error.res && error.res.data && error.res.data.message) {
                seterror(error.res.data.message)
            }
        }
    };

    const addBudget = async () => {
        try {
            const res = await axiosInstance.post("/create-budget", {
                name,
                startDate: dayjs(start).format("MMMM D, YYYY"),
                endDate: dayjs(end).format("MMMM D, YYYY"),
                amount,
                category: selectedCategory,
            });
            if (res.data && res.data.budget) {
                // showToastMessage({ message: "Budget added successfully", type: "success" });
                getAllBudgets();
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div>
            <div className="flex gap-2">
                <h2 className="text-2xl mb-4 py-3 rounded-xl px-3 text-white bg-black font-bold w-full">
                    {type === "edit" ? "Edit Budget" : "Add Budget"}
                </h2>
                <button className="text-3xl bg-black py-3 px-3 mb-4 rounded-xl hover:cursor-pointer" onClick={() => {
                    onClose()
                    getAllBudgets()
                }}><MdClose /></button>

            </div>
            <div>

                <input type="text" className="input-box" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

                {/* Start Date */}
                <div className="flex gap-3 justify-center">
                    <label className="w-[15%]">Start Date:</label>
                    <input
                        type="text"
                        className="input-box"
                        value={start.toLocaleDateString()}
                        onChange={(e)=>setStart(e.target.value)}
                        readOnly
                    />
                    <div className="relative">
                        <MdDateRange
                            className="text-4xl hover:cursor-pointer hover:text-black"
                            onClick={() => {
                                setOpenEndCalendar(false);
                                setOpenStartCalendar(!openStartCalendar);
                            }}
                        />
                        {openStartCalendar && (
                            <CalendarDate date={start} setDate={setStart} />
                        )}
                    </div>
                </div>

                {/* End Date */}
                <div className="flex gap-3 justify-center">
                    <label className="w-[15%]">End Date:</label>
                    <input
                        type="text"
                        className="input-box"
                        value={end.toLocaleDateString()}
                        onChange={(e)=>setEnd(e.target.value)}
                        readOnly
                    />
                    <div className="relative">
                        <MdDateRange
                            className="text-4xl hover:cursor-pointer hover:text-black"
                            onClick={() => {
                                setOpenStartCalendar(false);
                                setOpenEndCalendar(!openEndCalendar);
                            }}
                        />
                        {openEndCalendar && (
                            <CalendarDate date={end} setDate={setEnd} />
                        )}
                    </div>
                </div>

                <input
                    type="number"
                    placeholder="Budget Amount"
                    className="input-box"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <div className="flex gap-3">
                    {/* Category Select */}
                    <select
                        className="input-box"
                        // class = "focus:outline-none focus:ring-0"
                        value={selectedCategory}
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
                        <option value="" className="bg-black">-- Select Category --/ -- Delete Selected Category --</option>
                        {category.map((cat) => (
                            <option className="bg-dg text-white" key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                        <option value="__add__" className="bg-black text-white ">➕ Add Category</option>
                    </select>
                    <button
                        className="button mb-4 w-[20%] disabled:opacity-50"
                        disabled={!selectedCategory}
                        onClick={() => {
                            removeCategory(selectedCategory);
                            // setBudgets(prev => prev.filter(b => b._id !== budgetData._id));
                            setSelectedCategory("");
                            getAllBudgets();
                        }}
                    >
                        Delete
                    </button>
                </div>

                {/* Add New Category */}
                {isAddCategory && (
                    <div className="flex gap-2 mt-2 ">
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
                            onClick={() => {
                                setIsAddCategory(false);
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}
                <button className="button" onClick={() => {
                    handleSubmit()
                    getAllBudgets()
                }}>{type === "edit" ? "UPDATE" : "ADD"}</button>
            </div>

        </div>
    );
};

export default AddEditBudget;
