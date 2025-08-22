import { GiHamburgerMenu } from "react-icons/gi";
import { useSidebar } from '../contexts/SidebarContext';
import { getInitials } from '../utils/getInitials';
import { useUser } from "../contexts/UserInfoContext";

const Header = ({ value }) => {
    const { toggleSidebar } = useSidebar();
    const { userInfo } = useUser();

    return (
        <div className='bg-lg fixed flex w-full h-12 justify-between z-1'>
            <div className='flex gap-5 p-2'>
                <GiHamburgerMenu 
                    className='mt-1 text-2xl hover:cursor-pointer'
                    onClick={toggleSidebar} 
                />
                <div className='text-2xl'>{value}</div>
            </div>

            {userInfo ? (
                <div className='flex gap-5 px-4 items-center'>
                    <div className='bg-black rounded-full h-9 w-9 flex items-center justify-center text-white font-bold'>
                        {getInitials(userInfo?.fullname || "")}
                    </div>
                    <div>{userInfo.fullname}</div>
                </div>
            ) : (
                <div className='px-4 text-sm text-gray-400'>Loading...</div>
            )}
        </div>
    );
};

export default Header;