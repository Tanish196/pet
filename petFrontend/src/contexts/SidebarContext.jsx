import {createContext, useContext, useState} from "react";

// Creating context
const SidebarContext = createContext()

// Used to wrap the app
export const SidebarProvider = ({children})=>{
    const [isSidebarOpen, setisSidebarOpen] = useState(false)

    const toggleSidebar = ()=>setisSidebarOpen(prev=>!prev)

    return (
        <SidebarContext.Provider value={{isSidebarOpen, toggleSidebar}}>
            {children}
        </SidebarContext.Provider>
    )
}

// Accessing content easily by custom hook
export const useSidebar = ()=>useContext(SidebarContext) 