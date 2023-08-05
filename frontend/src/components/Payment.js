import React, { useState } from 'react'
import axios from 'axios'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation } from 'react-router-dom';

const Payment = () => {
    const location = useLocation();
    const { client_secret } = location.state;
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    })
    const checkCard = async () => {
        if (window.confirm('Are you sure you want to pay?')) {
            setLoading(true);
            try {
                const paymentMethod = await stripe.createPaymentMethod({
                    card: elements.getElement("card"),
                    type: "card",
                });

                console.log("paymentMethod:", paymentMethod.paymentMethod.id);

                const response = await api.post('/create_subscription', {
                    payment_method: paymentMethod ? paymentMethod.paymentMethod.id : null,
                });
                if (!response.data) {
                    setError('Payment Failed')
                    setLoading(false);
                    return;
                }
                const data = await response.json();
                const confirm = await stripe.confirmCardPayment(data.clientSecret);
                if (confirm.error) return alert("Payment unsuccessful!");
                alert("Payment successful!");
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }
    }
    return (
        <div className='paymentPage col-md-7 col-sm-8 col-10'>
            <div className="row">
                <div className="col-7 cardDetails">
                    <div className='container'>
                        <h2 className='strong'>Complete Payment</h2>
                        <h6 className='mt-2'>Enter your credit or debit card details below</h6>
                        <CardElement className='paymentDetailsGroup mt-3 mb-3' />
                        <button className='confirmPaymentButton mt-3' onClick={checkCard} disabled={!stripe || loading}>
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
                                <h6 className="justify-content-end fR">Basic</h6>
                            </div>
                            <hr />
                            <div className='col-6'>
                                <h6 className="justify-content-start">Billing Cycle</h6>
                            </div>
                            <div className='col-6'>
                                <h6 className="justify-content-end fR">Monthly</h6>
                            </div>
                            <hr />
                            <div className='col-6'>
                                <h6 className="justify-content-start">Plan Price</h6>
                            </div>
                            <div className='col-6'>
                                <h6 className="justify-content-end fR">₹ 200/mo</h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Payment