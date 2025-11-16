import { useState } from 'react'
import './assets/css/style.css'
import Header from './components/Header'
import Main from './components/Main'
import Footer from './components/Footer'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Register from './components/Register'
import Login from './components/Login'
import AuthProvider from './AuthProvider'
import Dashboard from './components/dashboard/Dashboard'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'

function App() {

  return (
    <>
      {/* <Header /> */}
      {/* <Main /> */}
      {/* <Footer /> */}
    <AuthProvider>
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path = '/' element={<Main />}/>
        {/* <Route path = '/register' element = {<Register />}  />
        <Route path = '/login' element = {<Login />}></Route> */}
        {/* <Route path = '/dashboard' element = {<Dashboard />}></Route> */}
        <Route path = '/dashboard' element = {<PrivateRoute><Dashboard /></PrivateRoute>}/>
        <Route path = '/register' element = {<PublicRoute><Register /></PublicRoute>}  />
        <Route path = '/login' element = {<PublicRoute><Login /></PublicRoute>}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App
