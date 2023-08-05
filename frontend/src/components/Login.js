import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [loading, setLoading] = useState(false)
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    })
    const navigate = useNavigate()
    const handleLogin = async (e) => {
        setLoading(true)
        e.preventDefault()
        console.log(document.getElementById('signupEmail').value, document.getElementById('signupPass').value);
        await api.post('/login', {
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPass').value,
            remember_user: document.getElementById('rememberMe').checked
        }).then((res) => {
            console.log(res.data);
            if (res.data.message === 'User does not exist') {
                alert('A user with this email does not exist')
                setLoading(false)
            }
            else if (res.data.message === 'Incorrect password') {
                alert('Incorrect password')
                setLoading(false)
            }
            else {
                navigate('/billing')
            }
        }).catch((err) => {
            console.log(err);
            setLoading(false);
        })
    }

    if (loading) {
        return (
            <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '100vh' }}>
                <h1 className='text-white'>Logging you in...</h1>
                <div className="spinner-border text-white justify-content-center mt-3" role="status">
                    <span className="sr-only"></span>
                </div>
            </div>
        )
    }
    
    return (
        <div className='signuploginForm col-md-4 col-sm-8 col-10'>
            <h5 className='text-center p-3'>Login to your account</h5>
            <form onSubmit={handleLogin}>
                <div className="form-group mt-4">
                    <label htmlFor="signupEmail">Email</label>
                    <input type="email" className="form-control" id="signupEmail" placeholder="Enter Email" />
                </div>
                <div className="form-group mt-4">
                    <label htmlFor="signupPass">Password</label>
                    <input type="password" className="form-control" id="signupPass" placeholder="Enter Password" />
                </div>
                <div className="form-group form-check mt-4">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
                </div>
                <button type='submit' className="signuploginButton mt-4">Login</button>
            </form>
            <p className='text-center mt-4'>New to MyApp? <Link to='/signup'>Sign Up</Link></p>
        </div>
    )
}

export default Login