const mongoose = require("mongoose")
const Schema = mongoose.Schema

const transactionSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref:'User', required:true},
    accountCat: {type:String, required: true},
    category: {type:String, required: true},
    amount: {type: Number, required:true},
    type:{type:String, enum:["Income", "Expense"], required:true}, 
    date:{type:Date, required:true},
    note:{type:String, required:true}
})

module.exports = mongoose.model('Transaction', transactionSchema)