import React from 'react'
import Button from './Button'
import Header from './Header'
import Footer from './Footer'

const Main = () => {
  return (
    <>
    {/* <Header /> */}
    <div className='container'>
        <div className='p-5 text-center bg-light-dark rounded'>
            <h1 className='text-light'>Stock Prediction Portal</h1>
            <p className='text-light lead'>The stock prediction aplication utilizes machine learning techniqques, specially employing Keras, and LSTM model, integrated within Django framework. It forcasts future stock prices by analyzinng 100-day and 200-day moving averages, essential indicators widely used by stock analysts to inform tranding and investments decision.</p>
            {/* <div className='btn btn-outline-warning'>Login</div> */}
            {/* <div className='btn btn-info'>Login</div> */}
            <Button text='Explore Now' class="btn-outline-info" url="/dashboard"/>
        </div>
    </div>    
    {/* <Footer /> */}
    </>
  )
}

export default Main