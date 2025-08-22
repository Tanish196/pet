import Logo from "./Logo"
import { Link } from "react-router-dom"

const HomeNavbar = () => {
    return (
        <div className='bg-lg flex justify-between px-3'>
            <div className="flex p-2 gap-4 items-center">
                <Logo />
                <div className='text-2xl'>P.E.B.T.</div>
            </div>
            <div className="flex gap-4">
                <button className="p-2 m-2 bg-b hover:bg-g rounded"><Link to='/logIn'>Log In</Link></button>
                <button className="p-2 m-2 bg-b hover:bg-g rounded"><Link to='/signUp'>Sign Up</Link></button>
            </div>
        </div>
    )
}

export default HomeNavbar