import React from 'react'
import { Link } from 'react-router-dom'

const AccountSubscription = () => {
    const [planCancelled, setPlanCancelled] = React.useState(false)

    const handleCancel = () => {
        setPlanCancelled(true);
        document.getElementsByClassName('planActive')[0].innerHTML = 'Cancelled';
        document.getElementsByClassName('planActive')[0].classList.add('planCancelled');
        document.getElementsByClassName('planCancelled')[0].classList.remove('planActive');
        document.getElementsByClassName('cancelPlanButton')[0].classList.add('d-none');
        document.getElementsByClassName('changePlanButton')[0].innerHTML = 'Choose Plan';
        document.getElementsByClassName('subscriptionDetails')[0].innerHTML = 'Your subscription was cancelled on <strong>05th August 2023</strong>.';
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
                    <h6 className="planName mb-0">Basic</h6>
                    <p className='text-muted devices'>Phone + Tablet</p>
                </div>
            </div>
            <div className='row'>
                <h3 className='currentFee'><strong>₹ 2000</strong>/yr</h3>
            </div>
            <Link to='/billing'>
                <button className='changePlanButton mt-3'>Change Plan</button>
            </Link>
            <p className='small mt-4 subscriptionDetails'>Your subscription has started on <strong>05th August 2023</strong> and will auto renew on <strong>05th September 2023</strong>.</p>
        </div>
    )
}

export default AccountSubscription