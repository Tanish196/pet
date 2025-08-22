import { MdCreate, MdDelete } from 'react-icons/md'
import dayjs from 'dayjs'

const BudgetCard = ({ name, startDate, endDate, amount, category, editBudget, deleteBudget, balance, isHide }) => {
    return (
        <div className="text-xl bg-black rounded-xl p-2 mt-3">
            <div className="flex justify-between">
                <h2>{name}</h2>
                <h2>{category}</h2>
            </div>

            <div className="flex justify-between text-xs m-2">
                <div>{dayjs(startDate).format("MMMM D, YYYY")}</div>
                <div>{amount ? ((balance / Number(amount)) * 100).toFixed(2) + "%" : "0%"}</div>
                <div>{dayjs(endDate).format("MMMM D, YYYY")}</div>
            </div>

            {/* Progress Bar */}
            <div className="bg-g h-3 rounded-2xl overflow-hidden m-2">
                <div
                    className="bg-red-400 h-3"
                    style={{ width: `${amount ? (balance / Number(amount)) * 100 : 0}%` }}
                ></div>
            </div>


            <div className="flex justify-between text-xs m-2">
                <div>0</div>
                <div>{balance}</div>
                <div>{Number(amount)}</div>
            </div>

            <div className="flex justify-between px-2">
                <div className="text-sm"></div>
                <div className="flex gap-5">
                    <button className={`hover:cursor-pointer ${isHide?'hidden':""}`} onClick={editBudget}><MdCreate /></button>
                    <button className={`hover:cursor-pointer ${isHide?'hidden':""}`} onClick={deleteBudget}><MdDelete /></button>
                </div>
            </div>
        </div>
    )
}

export default BudgetCard
