import {useState} from 'react';
import api from "../services/api.js";
import { useAdminAuth } from '../context/AdminAuthContext.jsx';

const Settings = () => {

    const {admin, updateAdminInfo} = useAdminAuth();

    const [name, setName] = useState(admin?.name || "");
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    const handleProfileSubmit = async(e) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");

        if(!name.trim()) {
            setProfileError("Name cannot be empty");
            return;
        }
        setProfileSubmitting(true);

        try {
            const {data} = await api.put("/users/profile",{name: name.trim()});
            updateAdminInfo({name: data.user.name});
            setProfileSuccess("Profile Updated Successfully");
        } catch (err) {
            setProfileError(err.response?.data?.message || "Failed to update profile");
        } finally {
            setProfileSubmitting(false);
        }
    }

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    const handlePasswordSubmit = async(e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if(!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordError("All password fields are required");
            return;
        }

        if(newPassword !== confirmNewPassword) {
            setPasswordError("New password and confirmation do not match");
        }

        if(newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        setPasswordSubmitting(true);

        try {
            await api.put('/auth/change-password', {currentPassword, newPassword});
            setPasswordSuccess("Password Changed Successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordSubmitting(false);
        }
    }
  return (
    <div className='max-w-xl space-y-10'>
        <h1 className='font-display text-3xl text-text-primary'>Settings</h1>

        <section>
            <h2 className='font-display text-xl text-text-primary mb-1'>Profile</h2>
            <p className='text-sm text-text-secondary mb-4'>Your account details as an OOTDIFY admin.</p>

            <form onSubmit={handleProfileSubmit} className='space-y-4'>
                {profileError && (
                    <div className='text-sm text-white bg-red-500 rounded-lg px-4 py-2'>{profileError}</div>
                )}
                {profileSuccess && (
                    <div className='text-sm text-white bg-green-600 rounded-lg px-4 py-2'>{profileSuccess}</div>
                )}

                <div>
                    <label className='block text-sm text-text-secondary mb-1'>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent'/>
                </div>

                <div>
                    <label className='block text-sm text-text-secondary mb-1'>Email</label>
                    <input type="email" value={admin?.email || ""} disabled className='w-full border border-border rounded-lg px-3 py-2 text-text-muted bg-bg-subtle cursor-not-allowed'/>
                    <p className='text-xs text-text-muted mt-1'>Email changes aren't supported yet.</p>
                </div>

                <button type='submit' disabled={profileSubmitting} className='bg-accent text-on-accent rounded-lg px-6 py-2.5 font-medium hover:bg-accent-hover disabled:opacity-60'>
                    {profileSubmitting ? "Saving..." : "Save Profile"}
                </button>
            </form>
        </section>

        <section>
            <h2 className='font-display text-xl text-text-primary mb-1'>Change Password</h2>
            <p className='text-sm text-text-secondary mb-4'>Update the password used to log into this admin panel.</p>

            <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                {passwordError && (
                    <div className='text-sm text-white bg-red-500 rounded-lg px-4 py-2'>{passwordError}</div>
                )}
                {passwordSuccess && (
                    <div className="text-sm text-white bg-green-600 rounded-lg px-4 py-2">{passwordSuccess}</div>
                )}

                <div>
                    <label className='block text-sm text-text-secondary mb-1'>Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' autoComplete='current-password'/>
                </div>

                <div>
                    <label className='block text-sm text-text-secondary mb-1'>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' autoComplete='new-password'/>
                </div>

                <div>
                    <label className='block text-sm text-text-secondary mb-1'>Confirm New Password</label>
                    <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className='w-full border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-accent' autoComplete='new-password'/>
                </div>

                <button type="submit" disabled={passwordSubmitting} className='bg-accent text-on-accent rounded-lg px-6 py-2.5 font-medium hover:bg-accent-hover disabled:opacity-60'>
                    {passwordSubmitting ? "Saving" : "Change Password"}
                </button>
            </form>
        </section>
    </div>
  )
}

export default Settings
