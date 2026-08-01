import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./context/AdminAuthContext.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ManageOccasions from "./pages/ManageOccasions.jsx";
import ManageOutfitTypes from "./pages/ManageOutfitTypes.jsx";
import ManageItems from "./pages/ManageItems.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx";
import ManageOutfits from "./pages/ManageOutfits.jsx";
import AddOutfit from "./pages/AddOutfit.jsx";
import EditOutfit from "./pages/EditOutfit.jsx";
import ManageTrends from "./pages/ManageTrends.jsx";
import AddTrend from "./pages/AddTrend.jsx";
import ManageStyleTips from "./pages/ManageStyleTips.jsx";
import AddStyleTip from "./pages/AddStyleTip.jsx";
import Users from "./pages/Users.jsx";
import Settings from "./pages/Settings.jsx";

// Wraps any route that requires a logged-in admin. Shows nothing (or a
// loader) while the token is still being validated on first load, to avoid
// briefly flashing the login page for someone who's actually already logged in.
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAdminAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <p className="text-text-secondary">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path='/occasions' element={<ManageOccasions/>}/>
                    <Route path='/outfit-types' element={<ManageOutfitTypes/>}/>
                    <Route path="/items" element={<ManageItems />} />
                    <Route path="/items/add" element={<AddItem />} />
                    <Route path="/items/edit/:id" element={<EditItem />} />
                    <Route path="/outfits" element={<ManageOutfits />} />
                    <Route path="/outfits/add" element={<AddOutfit />} />
                    <Route path="/outfits/edit/:id" element={<EditOutfit />} />
                    <Route path="/trends" element={<ManageTrends />} />
                    <Route path="/trends/add" element={<AddTrend />} />
                    <Route path="/style-tips" element={<ManageStyleTips/>}/>
                    <Route path="/style-tips/add" element={<AddStyleTip/>}/>
                    <Route path="/users" element={<Users/>}/>
                    <Route path='/settings' element={<Settings/>}/>
                </Route>

                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;