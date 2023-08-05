import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

import Payment from './Payment';


const stripePromise = loadStripe('pk_test_51KydKFSCT3zDBivMfKPk01CeVdIWGKt7dawE3uwTTv5AxGrm4GiGEFS4BD0N8UnsajhRFfsKltLoxM2hs4niyWEi00CMXeROQ6');

const StripeWrapper = () => {
    return (
        <Elements stripe={stripePromise}>
            <Payment />
        </Elements>
    )
}

export default StripeWrapper;