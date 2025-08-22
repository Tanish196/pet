import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { validateEmail } from '../../utils/validateEmail'
import Navbar from '../../components/Navbar'
import axiosInstance from '../../utils/axiosInstance'

const LogIn = () => {

  const [email, setemail] = useState("")
  const [pass, setpass] = useState("")
  const [error, seterror] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      seterror("Not a valid email")
      return
    }

    if (!pass) {
      seterror("Not a valid password")
      return
    }

    seterror("")

    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: pass
      })

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken)
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        seterror(error.response.data.message)
      } else {
        seterror("Unexpected error occurred")
      }
    }
  }

  return (
    <>
      <Navbar />
      <div className='flex justify-center items-center mt-30'>
        <div className='w-96 border rounded bg-lg px-7 py-10'>
          <form onSubmit={handleSubmit}>
            <h4 className='text-xl mb-7 text-center'>Log in to your existing profile</h4>
            <input value={email} type="text" className='input-box' placeholder='Email' onChange={(e) => setemail(e.target.value)} />
            <input value={pass} type="password" className='input-box' placeholder='Password' onChange={(e) => setpass(e.target.value)} />
            <button className='button mb-1.5'>LOGIN</button>

            {error && <div className='text-xs text-black'>{error}</div>}

            <p className=''>Not registered ?
              <Link to='/signup' className='underline px-1.5 hover:text-green-200'>Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </>

  )
}

export default LogIn