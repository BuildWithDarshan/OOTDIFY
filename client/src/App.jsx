import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx'
import OutfitDetails from './pages/OutfitDetails.jsx';
import Men from "./pages/Men.jsx";
import Women from './pages/Women.jsx';
import Trends from './pages/Trends.jsx';
import TrendDetails from './pages/TrendDetails.jsx';
import StyleTips from './pages/StyleTips.jsx';
import StyletipsDetails from './pages/StyletipsDetails.jsx';
import WardrobeEssentials from './pages/WardrobeEssentials.jsx';
import Favourites from './pages/Favourites.jsx';
import Profile from './pages/Profile.jsx';
import About from './pages/About.jsx';
import ScrollToTop from './components/Common/ScrollToTop.jsx';
import { RouteMeta } from './components/Common/PageMeta.jsx';


function App() {
  return (
    <BrowserRouter>

    
    <AuthProvider>

      <ScrollToTop/>
      <RouteMeta/>
      
      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        
        <Route element={<MainLayout/>}>
          <Route path='/' element={<Home/>}/>
          <Route path='/outfit/:id' element={<OutfitDetails/>}/>
          <Route path='/men' element={<Men/>}/>
          <Route path='/women' element={<Women/>}/>
          <Route path='/trends' element={<Trends/>}/>
          <Route path='/trends/:id' element={<TrendDetails/>}/>
          <Route path='/style-tips' element={<StyleTips/>}/>
          <Route path='/style-tips/:id' element={<StyletipsDetails/>}/>
          <Route path='/wardrobe-essentials' element={<WardrobeEssentials/>}/>
          <Route path='/favourites' element={<Favourites/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/about' element={<About/>}/>
        </Route>

        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  )
}

export default App
