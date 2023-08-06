import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
    const [data, setData] = useState({});
    const navigate = useNavigate();
    const api = axios.create({
        baseURL: 'https://richpanel-assessment-backend-hixnctymba-uc.a.run.app/',
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
        }).catch((err) => {
            console.log(err);
        });

        api.get('/get_plans').then(async (res) => {
            console.log(res.data);
            await setData(res.data.plans);
            setLoading(false);
        }).catch((err) => {
            console.log(err);
        });
    }, []);
    const [selectedPlan, setSelectedPlan] = useState('mobile');
    const [selectedSub, setSelectedSub] = useState('monthly');
    const [term, setTerm] = useState('monthlySubscription');
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

    const indexMap = {
        "mobile": 0,
        "basic": 1,
        "standard": 2,
        "premium": 3
    };

    const handleSelectPlan = (planType) => {
        setSelectedPlan(planType);
        setSelectedPlanIndex(indexMap[planType]);
    };

    const handleSelectSub = (subType) => {
        setSelectedSub(subType);
        if (subType === 'monthly') {
            setTerm('monthlySubscription');
        }
        else {
            setTerm('annualSubscription');
        }
    };

    const proceedToPayment = () => {
        console.log(selectedPlan, "plan,", selectedSub, "subscription,", selectedSub, "fee:", data[selectedPlanIndex][term]);
        const priceID = selectedSub === 'monthly' ? data[selectedPlanIndex].monthlyPriceID : data[selectedPlanIndex].yearlyPriceID;
        const devices = data[selectedPlanIndex].Device;
        navigate('/payment', { state: { priceID: priceID, plan: selectedPlan, sub: selectedSub, fee: data[selectedPlanIndex][term], devices: devices } });
    };

    if (loading) {
        return (
            <div className='loading'>
                <h1 className='text-white'>Loading...</h1>
                <span className='spinner-border spinner-border-lg text-white'></span>
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
                            <h5 className='text-center mb-0'>{data && data[0]['planName']}</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'mobile' && <div className='protrusion' />}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className={`col-10 Type ${selectedPlan === 'basic' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('basic')}>
                            <h5 className='text-center mb-0'>{data && data[1]['planName']}</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'basic' && <div className='protrusion' />}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className={`col-10 Type ${selectedPlan === 'standard' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('standard')}>
                            <h5 className='text-center mb-0'>{data && data[2]['planName']}</h5>
                        </div>
                        <div className='center'>
                            {selectedPlan === 'standard' && <div className='protrusion' />}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className={`col-10 Type ${selectedPlan === 'premium' ? 'TypeSelected' : ''}`} onClick={() => handleSelectPlan('premium')}>
                            <h5 className='text-center mb-0'>{data && data[3]['planName']}</h5>
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
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>₹ {data[0][term]}</h6>) || <h6 className='text-center mb-0'>₹ {data[0][term]}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>₹ {data[1][term]}</h6>) || <h6 className='text-center mb-0'>₹ {data[1][term]}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>₹ {data[2][term]}</h6>) || <h6 className='text-center mb-0'>₹ {data[2][term]}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>₹ {data[3][term]}</h6>) || <h6 className='text-center mb-0'>₹ {data[3][term]}</h6>}
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
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>{data && data[0]['videoQuality']}</h6>) || <h6 className='text-center mb-0'>{data && data[0]['videoQuality']}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>{data && data[1]['videoQuality']}</h6>) || <h6 className='text-center mb-0'>{data && data[1]['videoQuality']}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>{data && data[2]['videoQuality']}</h6>) || <h6 className='text-center mb-0'>{data && data[2]['videoQuality']}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>{data && data[3]['videoQuality']}</h6>) || <h6 className='text-center mb-0'>{data && data[3]['videoQuality']}</h6>}
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
                            {(selectedPlan === 'mobile' && <h6 className='text-center mb-0 strong'>{data && data[0]['Resolution']}</h6>) || <h6 className='text-center mb-0'>{data && data[0]['Resolution']}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'basic' && <h6 className='text-center mb-0 strong'>{data && data[1]['Resolution']}</h6>) || <h6 className='text-center mb-0'>{data && data[1]['Resolution']}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'standard' && <h6 className='text-center mb-0 strong'>{data && data[2]['Resolution']}</h6>) || <h6 className='text-center mb-0'>{data && data[2]['Resolution']}</h6>}
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {(selectedPlan === 'premium' && <h6 className='text-center mb-0 strong'>{
                                data && data[3]['Resolution']
                            }</h6>) || <h6 className='text-center mb-0'>{data && data[3]['Resolution']}</h6>}
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
                            {
                                (selectedPlan === 'mobile' && <div> {data && data[0]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0 strong'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3 strong'>{device}</h6>
                                })}</div>) || <div> {data && data[0]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3'>{device}</h6>
                                })}</div>
                            }
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {
                                (selectedPlan === 'basic' && <div> {data && data[1]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0 strong'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3 strong'>{device}</h6>
                                })}</div>) || <div> {data && data[1]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3'>{device}</h6>
                                })}</div>
                            }
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {
                                (selectedPlan === 'standard' && <div> {data && data[2]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0 strong'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3 strong'>{device}</h6>
                                })}</div>) || <div> {data && data[2]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3'>{device}</h6>
                                })}</div>
                            }
                        </div>
                    </div>
                    <div className='col-2'>
                        <div className='col-10'>
                            {
                                (selectedPlan === 'premium' && <div> {data && data[3]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0 strong'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3 strong'>{device}</h6>
                                })}</div>) || <div> {data && data[3]['Device'].split(',').map((device, index) => {
                                    if (index === 0) {
                                        return <h6 key={index} className='text-center mb-0'>{device}</h6>
                                    }
                                    return <h6 key={index} className='text-center mt-3'>{device}</h6>
                                })}</div>
                            }
                        </div>
                    </div>
                </div>
                <hr />
                <div className='d-flex justify-content-center'>
                    <button className='mt-5 proceedToPaymentButton text-center' onClick={() => proceedToPayment()}>Next</button>
                </div>
            </div>
        </div>
    )
}

export default Billing;
