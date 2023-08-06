import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

const AccountSubscription = () => {
    const [planCancelled, setPlanCancelled] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState({});
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/get_user').then((res) => {
            console.log(res.data.message);
            console.log(res.data);
            if (!res.data.user.subscribed) {
                setPageLoading(false);
                alert('You are not subscribed to any plan. Please subscribe to a plan to continue');
                navigate('/billing');
            }
            if (res.data.message === 'User not found or not logged in') {
                setPageLoading(false);
                alert('You are not logged in. Please login to continue');
                navigate('/login');
            }
            setUser(res.data.user);
            setPageLoading(false);
        }).catch((err) => {
            console.log(err);
        });
    }, []);

    const handlePlanChange = async () => {
        if (window.confirm('Are you sure you want to delete this subscription and subscribe to a new plan?')) {
            await api.post('/delete_subscription', {
                price_id: user.price_id
            }
            ).then((res) => {
                navigate('/billing');
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to delete this subscription?')) {
            await api.post('/delete_subscription', {
                price_id: user.price_id
            }
            ).then((res) => {
                console.log(res.data);
                setPlanCancelled(true);
                document.getElementsByClassName('planActive')[0].innerHTML = 'Cancelled';
                document.getElementsByClassName('planActive')[0].classList.add('planCancelled');
                document.getElementsByClassName('planCancelled')[0].classList.remove('planActive');
                document.getElementsByClassName('cancelPlanButton')[0].classList.add('d-none');
                document.getElementsByClassName('changePlanButton')[0].innerHTML = 'Choose Plan';
                document.getElementsByClassName('subscriptionDetails')[0].innerHTML = `Your subscription was cancelled on <strong>${new Date(res.data.deleted_on).toDateString().slice(4)}</strong>.`;
            }).catch((err) => {
                console.log(err);
            });
        }
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
        <div className='accSubscription'>
            <div className='d-flex'>
                <div className='col-5'>
                    <h5 className='currentPlan mt-3'>Current Plan Details</h5>
                </div>
                <div className='col-3'>
                    {planCancelled ? <h6 className='planActive planCancelled mb-0 mx-2 mt-3 text-center'>Cancelled</h6> : <h6 className='mb-0 mt-3 mx-2 planActive text-center'>Active</h6>}
                </div>
                <div className='col-3 mt-3 offset-1'>
                    <button className='cancelPlanButton justify-content-end fR' onClick={handleCancel}>Cancel</button>
                </div>
            </div>
            <div className='row mt-2'>
                <div className='col-6'>
                    <h6 className="planName mb-0">{user && user.subscribed_plan.charAt(0).toUpperCase() + user.subscribed_plan.slice(1)}</h6>
                    <p className='text-muted devices'>{user && user.subscription_devices.split(', ').join(' + ')}</p>
                </div>
            </div>
            <div className='row'>
                <h3 className='currentFee'><strong>₹ {user && user.subscription_fee}
                </strong>/{user && user.subscription_type === "yearly" ? "yr" : "mo"}</h3>
            </div>
            <Link to='/billing'>
                <button className='changePlanButton mt-3' onClick={handlePlanChange}>Change Plan</button>
            </Link>
            <p className='small mt-4 subscriptionDetails'>Your subscription has started on <strong>{user && new Date(user.subscribed_on).toDateString().slice(4)}</strong> and will auto renew on <strong>{user && new Date(user.renewal_date).toDateString().slice(4)}</strong>.</p>
        </div>
    )
}

export default AccountSubscription