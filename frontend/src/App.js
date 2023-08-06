import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Billing from './components/Billing';
import StripeWrapper from './components/StripeWrapper';
import AccountSubscription from './components/AccountSubscription';
import Home from './components/Home';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<h1>This page is still under development</h1>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/payment" element={<StripeWrapper />} />
          <Route path="/mysubscription" element={<AccountSubscription />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
