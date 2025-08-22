const mongoose = require('mongoose')
const Schema = mongoose.Schema

const budgetSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true }
})

module.exports = mongoose.model('Budget', budgetSchema)