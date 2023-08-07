import axios from 'axios';

const api = axios.create({
    baseURL: 'https://richpanel-assessment-backend-hixnctymba-uc.a.run.app/',
    withCredentials: true
});

export default api;