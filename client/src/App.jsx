import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
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
import CommunityDiscover from './pages/CommunityDiscover.jsx';
import CreateCommunityOutfit from './pages/CreateCommunityOutfit.jsx';
import CommunityOutfitDetails from './pages/CommunityOutfitDetails.jsx';
import CommunityCreatorProfile from './pages/CommunityCreatorProfile.jsx';
import CommunitySavedOutfits from './pages/CommunitySavedOutfits.jsx';
import CommunityActionDock from './components/Common/CommunityActionDock.jsx';
import ScrollToTop from './components/Common/ScrollToTop.jsx';
import { RouteMeta } from './components/Common/PageMeta.jsx';



function App() {
  return (
    <BrowserRouter>

    
      <ScrollToTop/>
      <RouteMeta/>
      <CommunityActionDock />
      
      <Routes>
        <Route path='/login/*' element={<Login/>}/>
        <Route path='/register/*' element={<Register/>}/>
        
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
          <Route path='/community' element={<CommunityDiscover/>}/>
          <Route path='/community/create' element={<CreateCommunityOutfit/>}/>
          <Route path='/community/saved' element={<CommunitySavedOutfits/>}/>
          <Route path='/community/creator/:userId' element={<CommunityCreatorProfile/>}/>
          <Route path='/community/:id/edit' element={<CreateCommunityOutfit/>}/>
          <Route path='/community/:id' element={<CommunityOutfitDetails/>}/>
        </Route>

        <Route path='*' element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
