import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='homeContainer'>
      <h1 className='text-center'>MyApp</h1>
      <h3 className='mt-5'>This website is built for the Richpanel Assessment.</h3>
      <h3>The website is built using ReactJS for the frontend, Flask for the backend.</h3>
      <h3>The website uses Stripe for the payment gateway, MongoDB for the database.</h3>
      <h3>The website is hosted on Google Cloud Platform (Cloud Run) and CI/CD is enabled using Github Actions.</h3>
      <h3 className='mt-5'>Click <Link to="/signup">here</Link> to signup and <Link to="/login">here</Link> to login</h3>
    </div>
  )
}

export default Home