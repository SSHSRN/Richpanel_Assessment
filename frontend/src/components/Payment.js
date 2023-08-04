import React from 'react'

const Payment = () => {
    return (
        <div className='paymentPage col-md-7 col-sm-8 col-10'>
            <div className="row">
                <div className="col-7 cardDetails">
                    <div className='container'>
                        <h2 className='strong'>Complete Payment</h2>
                        <h6 className='mt-2'>Enter your credit or debit card details below</h6>
                        <div className='input-group mt-3 mb-3 paymentDetailsGroup'>
                            <div className='col-sm-7'>
                                <input type='text' className='paymentFormControl form-control noBorder' placeholder='Card Number' />
                            </div>
                            <div className='col-sm-3'>
                                <input type='text' className='paymentFormControl form-control noBorder' placeholder='MM/YY' />
                            </div>
                            <div className='col-sm-2'>
                                <input type='text' className='paymentFormControl form-control noBorder' placeholder='CVC' />
                            </div>
                        </div>
                        <button className='confirmPaymentButton mt-3'>Confirm Payment</button>
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