import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { validateEmail } from '../../utils/validateEmail'
import Navbar from '../../components/Navbar'
import axiosInstance from '../../utils/axiosInstance'

const SignUp = () => {
  const [email, setemail] = useState("")
  const [pass, setpass] = useState("")
  const [name, setname] = useState("")
  const [error, seterror] = useState(null)
const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      seterror("Not a valid email")
      return
    }

    // add a validate password function here in future
    if (!pass) {
      seterror("Not a valid password")
      return
    }

    if (!name) {
      seterror("Please enter a name.")
      return
    }

    seterror("")
    console.log(`${email}, ${pass}, ${name}`)

    // signup api call
    try {
      const response = await axiosInstance.post("/create-account", {
        email: email,
        password: pass,
        fullname: name
      })

      if (response.data && response.data.error) {
        seterror(response.data.message)
      }

      if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken)
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        seterror(error.response.data.message)
      }
      else {
        seterror("Unexpected error Occured")
      }
    }
  }
  return (
    <>
      <Navbar />
      <div className='flex justify-center items-center mt-30'>
        <div className='w-96 border rounded bg-lg px-7 py-10'>
          <form onSubmit={handleSubmit}>
            <h4 className='text-xl mb-7 text-center'>Join PEBT now.</h4>
            <input type="text" className='input-box' placeholder='Email' onChange={(e) => setemail(e.target.value)} />
            <input type="text" className='input-box' placeholder='Full Name' onChange={(e) => setname(e.target.value)} />
            <input type="password" className='input-box' placeholder='Password' onChange={(e) => setpass(e.target.value)} />
            <button className='button mb-1.5'>REGISTER</button>

            {error && <div className='text-xs text-red-700'>{error}</div>}

            <p className=''>Already have an account ?
              <Link to='/login' className='underline px-1.5 hover:text-green-200'>Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default SignUp