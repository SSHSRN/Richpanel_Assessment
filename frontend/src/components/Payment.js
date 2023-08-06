import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { priceID, plan, sub, fee, devices } = location.state;
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [db, setDB] = useState(false);
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    });

    useEffect(() => {
        api.get('/get_user').then((res) => {
            console.log(res.data.message);
            if (res.data.message === 'User not found or not logged in') {
                setPageLoading(false);
                alert('You are not logged in. Please login to continue');
                navigate('/login');
            }
        }).catch((err) => {
            console.log(err);
        });
    }, []);
    const processPayment = async () => {
        if (window.confirm('Are you sure you want to proceed with the payment?')) {
            setLoading(true);
            try {
                const paymentMethod = await stripe.createPaymentMethod({
                    card: elements.getElement("card"),
                    type: "card",
                });

                console.log("paymentMethod:", paymentMethod.paymentMethod.id);

                const response = await api.post('/create_subscription', {
                    payment_method: paymentMethod ? paymentMethod.paymentMethod.id : null,
                    price_id: priceID
                });
                if (!response.data) {
                    setError('Payment Failed');
                    setLoading(false);
                    return;
                }
                console.log("data:", response.data);
                const confirm = await stripe.confirmCardPayment(response.data.client_secret); console.log("confirm:", confirm);
                if (confirm.error) {
                    setError(confirm.error.message);
                    setLoading(false);
                    return;
                }
                setLoading(false);
                setDB(true);
                await api.post('/update_user', {
                    plan: plan,
                    sub: sub,
                    fee: fee,
                    devices: devices
                }).then((res) => {
                    console.log(res.data);
                    if (res.data.status === 'error') {
                        alert(res.data.message);
                        setLoading(false);
                    }
                    else {
                        navigate('/mysubscription');
                    }
                }).catch((err) => {
                    setError(err.message);
                    setLoading(false);
                })
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }
    }
    if (error) {
        alert(error);
    }
    if (db) {
        return (
            <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '100vh' }}>
                <h1 className='text-white'>Saving data to the database</h1>
                <span className='spinner-border text-white' style={{ width: '2rem', height: '2rem' }}></span>
            </div>
        )
    }
    if (pageLoading) {
        return (
            <div className='d-flex flex-column justify-content-center align-items-center' style={{ height: '100vh' }}>
                <h1 className='text-white'>Loading...</h1>
                <span className='spinner-border text-white' style={{ width: '2rem', height: '2rem' }}></span>
            </div>
        )
    }
    return (
        <div className='paymentPage col-md-7 col-sm-8 col-10'>
            <div className="row">
                <div className="col-7 cardDetails">
                    <div className='container'>
                        <h2 className='strong'>Complete Payment</h2>
                        <h6 className='mt-2'>Enter your credit or debit card details below</h6>
                        <CardElement className='paymentDetailsGroup mt-3 mb-3' />
                        <button className='confirmPaymentButton mt-3' onClick={processPayment} disabled={!stripe || loading}>
                            {loading ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>
                </div>
                <div className="col-5 summary">
                    <div className='container'>
                        <h4>Order Summary</h4>
                        <div className='row mt-4'>
                            <div className='col-6'>
                                <h6 className="justify-content-start">Plan Name</h6>
                            </div>
                            <div className='col-6'>
                                <h6 className="justify-content-end fR">{plan.charAt(0).toUpperCase() + plan.slice(1)}</h6>
                            </div>
                            <hr />
                            <div className='col-6'>
                                <h6 className="justify-content-start">Billing Cycle</h6>
                            </div>
                            <div className='col-6'>
                                <h6 className="justify-content-end fR">{sub.charAt(0).toUpperCase() + sub.slice(1)}</h6>
                            </div>
                            <hr />
                            <div className='col-6'>
                                <h6 className="justify-content-start">Plan Price</h6>
                            </div>
                            <div className='col-6'>
                                <h6 className="justify-content-end fR">₹ {fee}/{sub === "monthly" ? 'mo' : 'yr'}</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment