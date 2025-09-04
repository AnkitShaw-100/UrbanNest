import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './components/Home'
import Benefits from './components/Benefits'
import TestimonialsPage from './components/TestimonialsPage'
import Footer from './components/Footer'
import BuyerSignup from "./components/pages/BuyerSignup"
import SellerSignup from './components/pages/SellerSignup'
import Login from './components/pages/Login'
import AboutUs from './components/pages/AboutUs'
import ContactUs from './components/pages/ContactUs'
import PropertyListing from './components/pages/PropertyListing'
import AddProperty from './components/pages/AddProperty'
import SellerDashboard from './components/pages/SellerDashboard'
import BuyerDashboard from './components/pages/BuyerDashboard'
import FavoritesPage from './components/pages/FavoritesPage'
import PropertyDetail from './components/pages/PropertyDetail'

import './App.css'

const HomePage = () => {
  return (
    <>
      <Home />
      <Benefits />
      <TestimonialsPage />
    </>
  )
}


function App() {
  const location = useLocation()
  const hideNavAndFooter = location.pathname.startsWith("/property/")
  const hideFooter = location.pathname === "/properties" || location.pathname.startsWith("/property/")

  return (
    <AuthProvider>
      {!hideNavAndFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/properties" element={<PropertyListing />} />
        <Route path="/property/:propertyId" element={<PropertyDetail />} />
        <Route path="/services" element={<Benefits />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/signup/buyer" element={<BuyerSignup />} />
        <Route path="/signup/seller" element={<SellerSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/seller/add-property" element={<AddProperty />} />
        <Route path="/properties" element={<PropertyListing />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
      {!hideFooter && <Footer />}
    </AuthProvider>
  )
}

export default App
