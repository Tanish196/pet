import React from 'react';
import { MdCreate, MdDelete } from 'react-icons/md';

const AccountCard = ({ name, balance, editAccount, deleteAccount}) => {

  return (
    <div className="bg-black w-200 rounded-xl text-2xl p-5 items-center mt-3">
      <div className="flex justify-between">
        <p>{name}</p>
        <div>Balance: {balance}</div>
      </div>

      <div className="relative top-3 flex gap-5">
        <button
          className="hover:cursor-pointer p-1 rounded hover:bg-red-700"
          onClick={deleteAccount}
        >
          <MdDelete />
        </button>
        <button
          className="hover:cursor-pointer p-1 rounded hover:bg-lg"
          onClick={editAccount}
        >
          <MdCreate />
        </button>
      </div>
    </div>
  );
};

export default AccountCard;
