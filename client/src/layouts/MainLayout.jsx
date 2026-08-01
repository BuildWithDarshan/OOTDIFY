import {Outlet} from 'react-router-dom';
import Navbar from '../components/Common/Navbar.jsx';
import Footer from '../components/Common/Footer.jsx';

const MainLayout = () => {
  return (
    <div className='min-h-screen flex flex-col bg-bg font-body'>
      <Navbar/>
      <main className='flex-1'>
        <Outlet/>
      </main>
      <Footer/>
    </div>
  )
}

export default MainLayout
