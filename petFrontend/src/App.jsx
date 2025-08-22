import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LogIn from './pages/logIn/LogIn'
import SignUp from './pages/signUp/SignUp'
import Accounts from './pages/dashboard/Accounts'
import Dashboard from './pages/dashboard/Dashboard'
import Budgets from './pages/dashboard/Budgets'
import Home from './pages/home/Home'
import ExportDoc from './pages/dashboard/ExportDoc'
// import ScheduledTransactions from './pages/dashboard/ScheduledTransactions'
import Transactions from './pages/dashboard/Transactions'
import { SidebarProvider } from './contexts/SidebarContext'
import { UserProvider } from './contexts/UserInfoContext'
import { CatProvider } from './contexts/CategoryContext'

const routes = (
  <Routes>
    <Route path='/dashboard' element={<Dashboard />} />
    <Route path='/signup' element={<SignUp />} />
    <Route path='/login' element={<LogIn />} />
    <Route path='/' element={<Home />} />
    <Route path='/accounts' element={<Accounts />} />
    <Route path='/budgets' element={<Budgets />} />
    <Route path='/exportDoc' element={<ExportDoc />} />
    {/* <Route path='/autopay' element={<ScheduledTransactions />} /> */}
    <Route path='/transactions' element={<Transactions />} />
  </Routes>
)

const App = () => {
  return (
    <BrowserRouter>
      <UserProvider>
        <CatProvider>
          <SidebarProvider>
            <div>
              {routes}
            </div>
          </SidebarProvider>
        </CatProvider>
      </UserProvider>
    </BrowserRouter>
  )
}

export default App