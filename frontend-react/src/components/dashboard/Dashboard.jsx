import React,{useEffect, useState} from 'react'
import axios from 'axios'
import axiosInstance from '../../axiosinstance'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const Dashboard = () => {
  const [ticker, setTicker] = useState('') //This useState created to hold the value of Ticker
  const [error, setError] = useState() //This useState is created to catch the error and display
  const [loading, setLoading] = useState(false) //This useState is created for spinning
  const [plot, setPlot] = useState() // This state is created to hold the image state
  const [ma100, setMA100] = useState() // This state is created to hold the image of 100 DMA
  const [ma200, setMA200] = useState() // This state is created to hold the image of 200 DMA
  const [prediction, setPrediction] = useState() 
  const [mse, setMse] = useState() 
  const [rmse, setRmse] = useState() 
  const [r2, setR2] = useState() 
  //const accessToken = localStorage.getItem('accessToken')

  useEffect(() => {
    const fetchProtectedData = async () => {
      try{
        // const response = await axiosInstance.get('/protected-view/',{
        //   // headers: {
        //   //   Authorization: `Bearer ${accessToken}`
        //   // }
        // })
        // console.log('Success: ', response.data);
        // const response = await axios.get('http://127.0.0.1:8000/api/v1/protected-view/',{ we can avoid using full path onche the axios interceptors will create
        const response = await axiosInstance.get('/protected-view/');
        //console.log('Success: ', response.data);
      } catch(error) {
          console.error('Error fetching data: ', error)
      }
    }
    fetchProtectedData();
  }, [])

  const handleSubmit= async (e) =>{
    e.preventDefault();
    setLoading(true)

    try{
      const response = await axiosInstance.post('/predict/', {
        ticker: ticker
      });
      console.log(response.data);
      // IMPORT image from backend-drf media folder. configure .env file then proceed as follow
      const backendRoot = import.meta.env.VITE_BACKEND_ROOT
      const plotUrl = `${backendRoot}${response.data.plot_img}`
      const ma100Url = `${backendRoot}${response.data.plot_100_dma}`
      const ma200Url = `${backendRoot}${response.data.plot_200_dma}`
      const predictionUrl = `${backendRoot}${response.data.plot_prediction}`
      //console.log(plotUrl);
      setPlot(plotUrl)
      setMA100(ma100Url)
      setMA200(ma200Url)
      setPrediction(predictionUrl)
      setMse(response.data.mse)
      setRmse(response.data.rmse)
      setR2(response.data.r2)
      if(response.data.error){
        setError(response.data.error)
      }
    } catch(error){
      console.error('There was an error making API request: ', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='container'>
      <div className="row">
        <div className="col-md-6 mx-auto">
          <form onSubmit={handleSubmit}>
            <input type="text" className='form-control' placeholder='Enter Stock Ticker' 
            onChange={(e) => setTicker(e.target.value)} required
            />
            <small>{error && <div className='text-danger'>{error}</div>}</small>
            <button type='submit' className='btn btn-info mt-3'>
              {loading ? <span><FontAwesomeIcon icon={faSpinner} spin />Please wait...</span> : 'See Prediction'}
            </button>
          </form>
        </div>

        {/* Print Prediction Plot */}

        {prediction && ( // Mean if the prediction this will show the content
          <div className="prediction mt-5">
          <div className="p-5">
            {plot && (
              <img src={plot} style={{maxWidth: '100%'}}/>
            )}
          </div>
          <div className='p-3'>
            {ma100 && (
              <img src={ma100} style={{maxWidth: '100%'}}/>
            )}          
          </div>
          <div className='p-3'>
            {ma200 && (
              <img src={ma200} style={{maxWidth: '100%'}}/>
            )}          
          </div>
          <div className='p-3'>
            {prediction && (
              <img src={prediction} style={{maxWidth: '100%'}}/>
            )}          
          </div>
          <div className="text-light p-3">
            <h4>Model Evaluation</h4>
            <p>Mean Squared Error(MSC): {mse}</p>
            <p>Root Mean Squared Error(RMSC): {rmse}</p>
            <p>R-Squared(R2): {r2}</p>
          </div>
        </div>)}
        
      </div>
    </div>
  )
}

export default Dashboard