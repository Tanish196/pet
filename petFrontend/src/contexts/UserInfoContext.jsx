import { createContext } from "react";
import { useEffect, useContext, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [userInfo, setuserInfo] = useState(null)
    const navigate = useNavigate()

    const fetchUserInfo = async () => {
        try {
            const res = await axiosInstance.get('/get-user')
            if (res.data && res.data.user) {
                setuserInfo(res.data.user[0])
            }
            // console.log(userInfo)    
        } catch (error) {
            if (error.response && error.response.status == 401) {
                localStorage.clear()
                navigate('/')
            }
        }
    }

    useEffect(() => {
        fetchUserInfo();
    }, [])

    return (
        <UserContext.Provider value={{ userInfo, setuserInfo }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)