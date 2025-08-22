const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
  type: { type: String, required: true }
});

const userSchema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdOn: { type: Date, default: Date.now },

// accounts:{type:[AccountSchema], default:[{"type":"Wallet"}]}
// Why?
// Because if you use a plain object/array in default, it’s shared across all documents. Using a function (() => [...])
// ensures a new array is created for each user.

  accounts: {
    type: [AccountSchema],
    default: () => [{ type: "Wallet" }]
  },
  balance: { type: Number, default: 0 },
  category: { type: [String], default: [] }
});

module.exports = mongoose.model("User", userSchema);
