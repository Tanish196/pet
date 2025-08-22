require('dotenv').config()
const mongoose = require("mongoose")
const express = require("express")
const cors = require('cors')
const app = express()
const jwt = require("jsonwebtoken")
const { authenticateToken } = require("./utilities.js")
const User = require('./models/user.model.js')
const Transaction = require('./models/transaction.model.js')
const Budget = require('./models/budget.model.js')

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

app.use(express.json())

app.use(cors({
    origin: "https://pet-red.vercel.app", // your Vercel frontend
    credentials: true
}));


// Trial
app.get('/', (req, res) => {
    res.json({ "message": "hello" })
})

// Create Account API
app.post('/create-account', async (req, res) => {
    const { email, fullname, password } = req.body

    if (!email) {
        return res.status(400).json({ error: true, message: "Email not provided" })
    }

    if (!fullname) {
        return res.status(400).json({ error: true, message: "Name not provided" })
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Password not provided" })
    }

    const isUser = await User.findOne({ email: email })

    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" })
    }

    const user = new User({
        fullname,
        email,
        password
    })

    await user.save()

    const accessToken = jwt.sign({ user: { _id: user._id, email: user.email, fullName: user.fullName, balance: user.balance, accounts: user.accounts, category: user.category } }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600m" });

    return res.json({
        error: false,
        user,
        accessToken,
        message: "Registration Successful"
    })
})

// Edits User Credentials (Not used now. Can be further modified for user profile changes)
app.put('/edit-user', authenticateToken, async (req, res) => {
    try {
        const { accounts } = req.body;

        const existingUser = await User.findById(req.user.id);
        if (!existingUser) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        existingUser.accounts = accounts;

        await existingUser.save();

        return res.json({ error: false, message: "User accounts updated", user: existingUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});

// add account
app.post('/add-account', authenticateToken, async (req, res) => {
    const { user } = req.user
    try {
        const { type } = req.body;
        // req.user should now be available from authenticateToken middleware
        const dbUser = await User.findById(user._id);

        if (!dbUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // push new account
        dbUser.accounts.push({ type: type });
        await dbUser.save();

        // const dbUser2 = await User.findById(user._id)
        res.json({ error: false, account: dbUser.accounts[dbUser.accounts.length - 1] });

    } catch {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

//Edit Category
app.put('/edit-category', authenticateToken, async (req, res) => {
    const { category } = req.body;
    const { user } = req.user;

    try {
        const dbUser = await User.findById(user._id);

        if (!dbUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Replace whole category array
        dbUser.category = category;
        await dbUser.save();

        res.json({ error: false, category: dbUser.category });
    } catch {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

app.delete("/delete-category/:name", authenticateToken, async (req, res) => {
    const { user } = req.user;
    try {
        const userId = user._id;
        const categoryToDelete = req.params.name;

        // Delete all transactions with this category for the user
        await Transaction.deleteMany({ userId, category: categoryToDelete });

        // Delete all budgets with this category for the user
        await Budget.deleteMany({ userId, category: categoryToDelete });

        // Update the user and fetch the new updated document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { category: categoryToDelete } },
            { new: true } // ensures the updated document is returned
        );

        res.json({
            message: `Category '${categoryToDelete}' removed along with its transactions and budgets.`,
            categories: updatedUser.category   // return updated categories
        });
    } catch (err) {
        console.error("❌ Error deleting category:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//Edit account 
app.put('/edit-account/:accountId', authenticateToken, async (req, res) => {
    const { user } = req.user
    const accountId = req.params.accountId
    const { type } = req.body

    try {
        const updateUser = await User.findOneAndUpdate(
            { _id: user._id, "accounts._id": accountId },
            { $set: { "accounts.$.type": type } },
            { new: true }
        );

        if (!updateUser) {
            return res.status(404).json({ error: true, message: "User not found" })
        }

        res.json({ error: false, message: "Account Edited", accounts: updateUser.accounts })
    } catch {
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
})

// Deletes account
app.delete('/delete-account/:accountId', authenticateToken, async (req, res) => {
    const accountId = req.params.accountId;

    try {
        // Find the user who owns this account
        const user = await User.findOne({ "accounts._id": accountId });
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        // Find the account subdocument
        const account = user.accounts.id(accountId);
        if (!account) {
            return res.status(404).json({ error: true, message: "Account not found" });
        }

        // Delete related transactions and budgets
        await Transaction.deleteMany({ accountCat: account.type });
        await Budget.deleteMany({ accountCat: account.type });

        // Remove the account from the user
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $pull: { accounts: { _id: accountId } } },
            { new: true }
        );

        res.json({ error: false, message: "Account deleted successfully", user: updatedUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});

// Log In 
app.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        return res.status(400).json({ error: true, message: "Email not found" })
    }

    if (!password) {
        return res.status(400).json({ error: true, message: "Password not found" })
    }

    const userInfo = await User.findOne({ email: email })

    if (!userInfo) {
        return res.status(400).json({ error: true, message: "User not found" })
    }

    if (userInfo.email == email && userInfo.password == password) {
        const user = { user: userInfo }

        // const accessToken = jwt.sign({ userId: userInfo._id }, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"3600m"});
        //  the above line can also be used if you don't want to wrap the userInfo   // It is actually the best practice available    
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "3600m" });
        return res.json({ error: false, message: "Logged in Sucessfully", email, accessToken })
    }
    else {
        return res.json({ error: true, message: "Invalid credentials" });
    }
})

// Get user
app.get('/get-user', authenticateToken, async (req, res) => {

    const { user } = req.user

    try {
        const userInfo = await User.find({ _id: user._id })

        if (!userInfo) {
            return res.status(404).json({ error: true, message: "User not found" })
        }

        return res.json({ user: userInfo })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

// Create Transaction API
app.post('/create-transaction', authenticateToken, async (req, res) => {
    const { accountCat, category, amount, type, note, date } = req.body
    const { user } = req.user

    if (!user._id) {
        return res.status(400).json({ error: true, message: "User Id not provided" })
    }

    if (!accountCat || !date) {
        return res.status(400).json({ error: true, message: "Account Category not provided" })
    }

    if (!category) {
        return res.status(400).json({ error: true, message: "Category not provided" })
    }

    if (!amount) {
        return res.status(400).json({ error: true, message: "Amount not provided" })
    }

    if (!type) {
        return res.status(400).json({ error: true, message: "Income or Expense not provided" })
    }

    if (!note) {
        return res.status(400).json({ error: true, message: "Note or Description not provided" })
    }

    const transaction = new Transaction({
        userId: user._id, accountCat, category, amount, type, note, date
    })

    await transaction.save()

    return res.json({
        error: false,
        transaction,
        message: "Transaction saved"
    });
});

// Edit Transaction API
app.put("/edit-transaction/:transactionId", authenticateToken, async (req, res) => {
    const transactionId = req.params.transactionId
    const { user } = req.user
    const { accountCat, category, amount, type, note } = req.body

    if (!accountCat && !category && !amount && !type && !note) {
        res.status(400).json({ error: true, message: "No changes provided" })
    }

    try {
        const transaction = await Transaction.findOne({ _id: transactionId, userId: user._id })
        if (!transaction) {
            return res.status(400).json({ error: true, message: "Transaction not found" })
        }

        if (accountCat) transaction.accountCat = accountCat
        if (category) transaction.category = category
        if (amount) transaction.amount = amount
        if (type) transaction.type = type
        if (note) transaction.note = note

        await transaction.save()

        return res.json({ error: false, message: "Transaction updated", transaction })
    }
    catch {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

// Gets Transactions
app.get("/get-transactions", authenticateToken, async (req, res) => {
    const { user } = req.user
    try {
        const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 })
        res.json({ error: false, transactions, message: "All transacttions received" })
    } catch {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

// Gets transactions of needed accounts
app.get('/get-accounts-transactions', authenticateToken, async (req, res) => {
    try {
        const account = req.query.account?.trim(); // remove extra spaces
        // const user = req.user;
        const { user } = req.user

        if (!user || !account) {
            return res.status(400).json({ error: true, message: "Invalid request. User or account not found" });
        }

        console.log("Fetching transactions for User ID:", user._id);
        console.log("Account queried:", account);

        // Case-insensitive search for account name
        const transactions = await Transaction.find({
            userId: user._id,
            accountCat: account
        });

        console.log("Transactions found:", transactions.length);

        return res.json({ transactions, user, account });
    } catch (err) {
        console.error("Error fetching account transactions:", err);
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});


// Delete Transactions
app.delete("/delete-trans/:transactionId", authenticateToken, async (req, res) => {
    const transactionId = req.params.transactionId
    const { user } = req.user

    try {
        const transaction = await Transaction.findOne({ userId: user._id, _id: transactionId })
        if (!transaction) {
            return res.status(400).json({ error: true, message: "Transaction not found" })
        }

        await Transaction.deleteOne({ userId: user._id, _id: transactionId })
        return res.json({ error: false, message: "Transaction Deleted" })

    } catch {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

// Search Transactions
app.get('/search-transaction/', authenticateToken, async (req, res) => {
    const { query } = req.query
    const { user } = req.user

    if (!query) {
        return res.status(400).json({ error: true, message: "Query Required !!" })
    }

    try {
        const mtransactions = await Transaction.find({
            userId: user._id, $or: [
                { date: { $regex: new RegExp(query, 'i') } },
                { note: { $regex: new RegExp(query, 'i') } }
            ]
        })

        return res.json({ error: false, transactions: mtransactions, message: "Success" })
    } catch {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

// Create Budgets
app.post('/create-budget', authenticateToken, async (req, res) => {
    const { user } = req.user
    const { name, startDate, endDate, amount, category } = req.body

    if (!user._id || !name || !startDate || !endDate || !amount || !category) {
        return res.status(400).json({ error: true, message: "All Credentials not provided" })
    }

    try {
        const budget = new Budget({
            userId: user._id, name, startDate, endDate, amount, category
        })

        await budget.save()

        return res.json({
            error: false,
            budget,
            message: "Budget saved succesfully"
        });
    } catch {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
});

// Gets Budgets
app.get('/get-budgets', authenticateToken, async (req, res) => {
    const { user } = req.user
    try {
        const today = new Date()

        const budgets = await Budget.find({
            userId: user._id,
            endDate: { $gte: today }   // only budgets whose endDate is today or in future
        }).sort({ endDate: 1 }) // sorting ascending so nearest deadline comes first

        res.json({ error: false, budgets, message: "Active Budgets received" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
});

// Edit Budgets
app.put('/edit-budget/:budgetId', authenticateToken, async (req, res) => {
    const budgetId = req.params.budgetId
    const { user } = req.user   // ✅ get the real user
    const { name, startDate, endDate, amount, category } = req.body

    if (!name && !startDate && !endDate && !amount && !category) {
        return res.status(400).json({ error: true, message: "No changes provided" })
    }

    try {
        const budget = await Budget.findOne({ _id: budgetId, userId: user._id })
        if (!budget) {
            return res.status(404).json({ error: true, message: "Budget not found" })
        }

        if (name) budget.name = name
        if (startDate) budget.startDate = startDate
        if (endDate) budget.endDate = endDate
        if (amount) budget.amount = amount
        if (category) budget.category = category

        await budget.save()

        return res.json({ error: false, message: "Edit Successfully", budget })
    } catch (err) {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})


// Delete Budgets 
app.delete('/delete-budget/:budgetId', authenticateToken, async (req, res) => {
    const budgetId = req.params.budgetId
    const { user } = req.user

    try {
        const budget = await Budget.find({ userId: user._id, _id: budgetId })

        if (!budget) {
            return res.json({ error: true, message: "Not Found" }).status(400)
        }

        await Budget.deleteOne({ userId: user._id, _id: budgetId })
        return res.json({ error: false, message: "Deletion Successful" })
    } catch {
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
});


// // delete Expired Budgets
// app.delete('/delete-expired-budgets', authenticateToken, async (req, res) => {
//     const { user } = req.user;
//     try {
//         const today = new Date();
//         const result = await Budget.deleteMany({
//             userId: user._id,
//             endDate: { $lt: today }
//         });

//         res.json({
//             error: false,
//             deletedCount: result.deletedCount,
//             message: "Expired budgets deleted successfully"
//         });
//     } catch {
//         return res.status(500).json({ error: true, message: "Internal server error" });
//     }
// });



// Get Balances of given category (Add account balances also here)
app.get('/get-category-balances', authenticateToken, async (req, res) => {
    try {
        const { user } = req.user
        const { cat } = req.query  // <- from query, not body

        const transactions = await Transaction.find({ category: cat, userId: user._id })

        let balance = 0
        for (let tx of transactions) {
            balance += tx.type === "Income" ? tx.amount : -tx.amount
        }

        return res.json({ error: false, balance })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: true, message: "Internal server error" })
    }
})

app.listen(8000);
module.exports = app