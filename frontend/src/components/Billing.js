import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
    const navigate = useNavigate();
    const api = axios.create({
        baseURL: 'http://localhost:5000',
        withCredentials: true
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Billing page loaded');
        api.get('/get_user').then((res) => {
            console.log(res.data.message);
            if (res.data.message === 'User not found or not logged in') {
                setLoading(false);
                alert('You are not logged in. Please login to continue');
                navigate('/login');
            }
            setLoading(false);
        }).catch((err) => {
            console.log(err);
        });
    }, []);
    const [selectedPlan, setSelectedPlan] = useState('mobile');
    const [selectedSub, setSelectedSub] = useState('monthly');

    const priceDetails = {
        monthly: {
            mobile: 100,
            basic: 200,
            standard: 500,
            premium: 700
        },
        yearly: {
            mobile: 1000,
            basic: 2000,
            standard: 5000,
            premium: 7000
        }
    }

    const handleSelectPlan = (planType) => {
        setSelectedPlan(planType);
    };

    const handleSelectSub = (subType) => {
        setSelectedSub(subType);
    };

    const printSelection = () => {
        console.log(selectedPlan, "plan,", selectedSub, "subscription,", selectedSub, "fee:", priceDetails[selectedSub][selectedPlan]);
    };

    if (loading) {
        return (
            <div className='loading'>
                <h1 className='text-white'>Loading...</h1>
            </div>
        )
    }

    return (
        <div className='billingPage'>
            <h4 className='text-center mt-5 bold'>Choose the right plan for you</h4>
            <div className='container mt-3'>
                <div className='row'>
                    <div className='col-md-2 col-12'>
                        <div className='subType'>
                            <div className={`opt1 col-6 ${selectedSub === 'monthly' ? 'optSelected' : ''}`} onClick={() => handleSelectSub('monthly')}>
                                <h5 className='text-center mb-0 font-weight-bold'>Monthly</h5>
                            </div>
                            <div className={`opt2 col-6 ${selectedSub === 'yearly' ? 'optSelected' : ''}`} onClick={() => handleSelectSub('yearly')}>
                                <h5 className='text-center mb-0'>Yearly</h5>
                            </div>
                        </div>
                    </div>
                    <div className='col-2 offset-md-1'>
                        <div className={`col-10 Type ${selectedPlan === 'mobile' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('mobile')}>
                            <h5 className='text-center mb-0'>Mobile</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'mobile' && <div className='protrusion' />}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className={`col-10 Type ${selectedPlan === 'basic' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('basic')}>
                            <h5 className='text-center mb-0'>Basic</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'basic' && <div className='protrusion' />}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className={`col-10 Type ${selectedPlan === 'standard' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('standard')}>
                            <h5 className='text-center mb-0'>Standard</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'standard' && <div className='protrusion' />}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className={`col-10 Type ${selectedPlan === 'premium' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('premium')}>
                            <h5 className='text-center mb-0'>Premium</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'premium' && <div className='protrusion' />}
                        </div>
                    </div>
                </div>
                {/* Monthly/Yearly price */}
                <div className='row mt-5'>
                    <div className='col-md-2 col-12 text-center'>
                        {selectedSub.charAt(0).toUpperCase() + selectedSub.slice(1)} Price
                    </div>
                    <div className='col-2 offset-md-1'>
                        <div className='col-10'>
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>₹ {priceDetails[selectedSub].mobile}</h6>) || <h6 className='text-center mb-0'>₹ {priceDetails[selectedSub].mobile}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>₹ {priceDetails[selectedSub].basic}</h6>) || <h6 className='text-center mb-0'>₹ {priceDetails[selectedSub].basic}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>₹ {priceDetails[selectedSub].standard}</h6>) || <h6 className='text-center mb-0'>₹ {priceDetails[selectedSub].standard}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>₹ {priceDetails[selectedSub].premium}</h6>) || <h6 className='text-center mb-0'>₹ {priceDetails[selectedSub].premium}</h6>}
                        </div>
                    </div>
                </div>
                <hr />
                {/* Video Quality */}
                <div className='row mt-5'>
                    <div className='col-md-2 col-12 text-center'>
                        Video Quality
                    </div>
                    <div className='col-2 offset-md-1'>
                        <div className='col-10'>
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>Good</h6>) || <h6 className='text-center mb-0'>Good</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>Good</h6>) || <h6 className='text-center mb-0'>Good</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>Better</h6>) || <h6 className='text-center mb-0'>Better</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>Best</h6>) || <h6 className='text-center mb-0'>Best</h6>}
                        </div>
                    </div>
                </div>
                <hr />
                {/* Resolution */}
                <div className='row mt-5'>
                    <div className='col-md-2 col-12 text-center'>
                        Resolution
                    </div>
                    <div className='col-2 offset-md-1'>
                        <div className='col-10'>
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>480p</h6>) || <h6 className='text-center mb-0'>480p</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>480p</h6>) || <h6 className='text-center mb-0'>480p</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>1080p</h6>) || <h6 className='text-center mb-0'>1080p</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>4K+HDR</h6>) || <h6 className='text-center mb-0'>4K+HDR</h6>}
                        </div>
                    </div>
                </div>
                <hr />
                {/* Devices you can use to watch */}
                <div className='row mt-5'>
                    <div className='col-md-3 col-12 text-center'>
                        Devices you can use to watch
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>Phone</h6>) || <h6 className='text-center mb-0'>Phone</h6>}
                            {(selectedPlan === 'mobile' && <h6 className='text-center mt-3 strong'>Tablet</h6>) || <h6 className='text-center mt-3'>Tablet</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>Phone</h6>) || <h6 className='text-center mb-0'>Phone</h6>}
                            {(selectedPlan === 'basic' && <h6 className='text-center mt-3 strong'>Tablet</h6>) || <h6 className='text-center mt-3'>Tablet</h6>}
                            {(selectedPlan === 'basic' && <h6 className='text-center mt-3 strong'>Computer</h6>) || <h6 className='text-center mt-3'>Computer</h6>}
                            {(selectedPlan === 'basic' && <h6 className='text-center mt-3 strong'>TV</h6>) || <h6 className='text-center mt-3'>TV</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>Phone</h6>) || <h6 className='text-center mb-0'>Phone</h6>}
                            {(selectedPlan === 'standard' && <h6 className='text-center mt-3 strong'>Tablet</h6>) || <h6 className='text-center mt-3'>Tablet</h6>}
                            {(selectedPlan === 'standard' && <h6 className='text-center mt-3 strong'>Computer</h6>) || <h6 className='text-center mt-3'>Computer</h6>}
                            {(selectedPlan === 'standard' && <h6 className='text-center mt-3 strong'>TV</h6>) || <h6 className='text-center mt-3'>TV</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>Phone</h6>) || <h6 className='text-center mb-0'>Phone</h6>}
                            {(selectedPlan === 'premium' && <h6 className='text-center mt-3 strong'>Tablet</h6>) || <h6 className='text-center mt-3'>Tablet</h6>}
                            {(selectedPlan === 'premium' && <h6 className='text-center mt-3 strong'>Computer</h6>) || <h6 className='text-center mt-3'>Computer</h6>}
                            {(selectedPlan === 'premium' && <h6 className='text-center mt-3 strong'>TV</h6>) || <h6 className='text-center mt-3'>TV</h6>}
                        </div>
                    </div>
                </div>
                <hr />
                <div className='d-flex justify-content-center'>
                    <button className='mt-5 proceedToPaymentButton text-center' onClick={() => printSelection()}>Next</button>
                </div>
            </div>
        </div>
    )
}

export default Billing;
