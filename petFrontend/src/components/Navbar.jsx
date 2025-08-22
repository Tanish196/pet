import Logo from "./Logo"
const Navbar = () => {
    return (
        <div className='bg-lg p-2 flex gap-4'>
            <Logo />
            <div className='text-2xl'>P.E.B.T.</div>
        </div>
    )
}

export default Navbar