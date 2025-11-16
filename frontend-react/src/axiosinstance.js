// Example of Axios Interceptor
import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASEAPI

const axiosInstance = axios.create({
    //baseURL: 'http://127.0.0.1:8000/api/v1'
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    }
})

// Reuest Interceptor--Config means reuest

axiosInstance.interceptors.request.use(
    function(config){
        //console.log('Request without auth header==>', config);
        const accessToken = localStorage.getItem('accessToken')

        if (accessToken){
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }
       // console.log(config);
        return config;
    }, function(error){
        return Promise.reject(error);
    }
)

// Response Interceptor

axiosInstance.interceptors.response.use(
    function(response){
        return response;
    },
    // Handle failed response
    async function(error){
        const originalRequest = error.config;

        if(error.response.status === 401 && !originalRequest.retry){
            originalRequest.retry = true;
            const refreshToken = localStorage.getItem('refreshToken');

            try{
                const response = await axiosInstance.post('/token/refresh/', {refresh: refreshToken})
                //console.log('Refresh response: ', response.data);
                //console.log('New access Token: ', response.data.access)
                localStorage.setItem('accessToken', response.data.access)
                originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`
                return  axiosInstance(originalRequest)
            } catch(error){
                //return false;
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                //window.location.href = '/login'
            }
        }
        return Promise.reject(error);
    }
)

export default axiosInstance;