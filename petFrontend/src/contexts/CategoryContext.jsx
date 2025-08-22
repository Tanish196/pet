import axiosInstance from "@/utils/axiosInstance";
import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "./UserInfoContext";
import { Trophy } from "lucide-react";

const CatContext = createContext();

export const CatProvider = ({ children }) => {
    const { userInfo } = useUser()
    const [category, setCategory] = useState(userInfo?.category || []);
    // const [error, setError] = useState(econd)
    useEffect(() => {
        if (userInfo?.category) {
            setCategory(userInfo.category);
        }
    }, [userInfo]);

    // const deleteCategory = async (cat) => {
    //     try {
    //         // Assuming backend expects DELETE /delete-category/:cat
    //         const res = await axiosInstance.delete(`/delete-category/${cat}`);

    //         if (res.data?.success) {
    //             console.log("Category deleted:", cat);
    //         }
    //     } catch (error) {
    //         console.error("Failed to delete category", error);
    //     }
    // };


    // Update category in backend
    const editCategory = async (newCategory) => {
        try {
            const res = await axiosInstance.put("/edit-category", {
                category: newCategory,
            });
            if (res.data?.category) {
                setCategory(res.data.category);
            }
        } catch (err) {
            console.error("Failed to edit category", err);
        }
    };

    // Add category & sync with backend
    const addCategory = async (name) => {
        const updated = [...category, name];
        setCategory(updated);
        await editCategory(updated);
    };

    // Remove category & sync with backend
const removeCategory = async (category) => {
  try {
    const res = await axiosInstance.delete(`/delete-category/${category}`);

    if (res.data && res.data.categories) {
      // update state with latest categories
      setCategory(res.data.categories);
    //   showToastMessage("Category deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting category:", error);
    // showToastMessage("Error deleting category");
  }
};


    return (
        <CatContext.Provider value={{ category, addCategory, removeCategory, editCategory, setCategory }}>
            {children}
        </CatContext.Provider>
    );
};

export const useCategory = () => useContext(CatContext);