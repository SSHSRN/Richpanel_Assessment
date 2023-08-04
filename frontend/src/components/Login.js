import React from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
    return (
        <div className='signuploginForm col-md-4 col-sm-8 col-10'>
            <h5 className='text-center p-3'>Login to your account</h5>
            <form>
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
                <button className="signuploginButton mt-4">Sign Up</button>
            </form>
            <p className='text-center mt-4'>New to MyApp? <Link to='/signup'>Sign Up</Link></p>
        </div>
    )
}

export default Login