import { MdCreate, MdDelete } from "react-icons/md";
import { MdCurrencyRupee } from "react-icons/md";
const TransactionCard = ({ transaction, deleteTransaction, editTransaction }) => {
  const { note, amount, date, _id, type, accountCat, category } = transaction;

  const handleEdit = () => {
    editTransaction(transaction);
  };

  const handleDelete = () => {
    deleteTransaction(_id);
  };

  return (
    <div className="text-2xl items-center mt-3">
      {/* top bar */}
      <div className={` ${type === "Income" ? "bg-lg" : "bg-red-800"} h-3 rounded-t-xl`}></div>

      {/* card body */}
      <div className="p-5 bg-black rounded-b-xl text-white">
        {/* account + balance */}
        <div className="flex justify-between">
          <div>
            <p className="font-semibold">{note}</p>
            <p className="text-xs text-gray-400">{accountCat}</p>
          </div>
          <p className="text-sm flex items-center">
            {type === "Income" ? "+" : "-"}<MdCurrencyRupee/>{amount}
          </p>
        </div>

        {/* createdAt + action buttons */}
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-400">Created: {date.split("T")[0]}</p>

          <div className="flex gap-4 text-lg">
            <button
              className="hover:text-yellow-400 transition"
              onClick={handleEdit}
            >
              <MdCreate />
            </button>
            <button
              className="hover:text-red-500 transition"
              onClick={handleDelete}
            >
              <MdDelete />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
