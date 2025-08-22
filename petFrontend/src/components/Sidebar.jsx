import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { MdOutlineSpaceDashboard, MdManageAccounts } from "react-icons/md";
import { SiActualbudget } from "react-icons/si";
import { GrTransaction } from "react-icons/gr";
import { CiExport } from "react-icons/ci";
import { IoLogOut } from "react-icons/io5";
import { useSidebar } from '../contexts/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Confirmation from './Confirmation';

const Sidebar = () => {
    const navigate = useNavigate();
    const { isSidebarOpen } = useSidebar();
    const [showConfirmation, setShowConfirmation] = useState(false);

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <>
            {showConfirmation && (
                <Confirmation
                    message="Are you sure you want to logout?"
                    onConfirm={() => {
                        onLogout();
                        setShowConfirmation(false);
                    }}
                    onCancel={() => setShowConfirmation(false)}
                />
            )}

            <div className={`top-0 left-0 h-screen transition-transform duration-300 bg-secondary w-64 fixed z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Navbar />
                <nav className="flex flex-col">
                    <Link to="/dashboard" className="flex gap-4 hover:bg-b p-4"><MdOutlineSpaceDashboard className='text-2xl' />Dashboard</Link>
                    <Link to="/accounts" className="flex gap-4 hover:bg-b p-4"><MdManageAccounts className='text-2xl' />Accounts</Link>
                    <Link to="/budgets" className="flex gap-4 hover:bg-b p-4"><SiActualbudget className='text-2xl' />Budgets</Link>
                    <Link to="/transactions" className="flex gap-4 hover:bg-b p-4"><GrTransaction className='text-2xl' />Transactions</Link>
                    <Link to="/exportDoc" className="flex gap-4 hover:bg-b p-4"><CiExport className='text-2xl' />Export</Link>
                    
                    <button
                        onClick={() => setShowConfirmation(true)}
                        className="flex gap-4 hover:bg-b p-4 items-center w-full"
                    >
                        <IoLogOut className='text-2xl' /> Logout
                    </button>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
