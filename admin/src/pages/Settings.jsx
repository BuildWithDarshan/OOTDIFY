import {useState} from 'react';
import { CheckCircle2, LockKeyhole, Save, Settings2, UserRound } from 'lucide-react';
import api from "../services/api.js";
import { useAdminAuth } from '../context/useAdminAuth.js';

const fieldClass = 'w-full rounded-xl border border-green-200 bg-white px-4 py-3 text-sm text-green-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100';

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
            return;
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
    <div className='max-w-5xl space-y-6'>
        <div className="flex items-start gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-white"><Settings2 size={22} /></span><div><p className="text-[10px] font-bold uppercase tracking-widest text-green-500">Your workspace</p><h1 className='font-display text-4xl text-green-900'>Settings</h1><p className="mt-1 text-sm text-green-600">Manage your account and sign-in details.</p></div></div>
        <div className="rounded-3xl bg-green-800 p-5 text-white sm:p-7"><p className="text-xs uppercase tracking-widest text-green-200">Signed in as</p><p className="mt-2 font-display text-3xl">{admin?.name || 'Administrator'}</p><p className="mt-1 text-sm text-green-100">{admin?.email}</p></div>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-800"><UserRound size={19} /></span><div><h2 className='font-display text-2xl text-green-900'>Profile</h2><p className='text-xs text-green-600'>Your OOTDIFY admin identity.</p></div></div>

            <form onSubmit={handleProfileSubmit} className='space-y-4'>
                {profileError && (
                    <div role="alert" className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{profileError}</div>
                )}
                {profileSuccess && (
                    <div role="status" className='flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800'><CheckCircle2 size={16} />{profileSuccess}</div>
                )}

                <div>
                    <label htmlFor="admin-name" className='mb-1 block text-sm font-medium text-green-700'>Name</label>
                    <input id="admin-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={fieldClass}/>
                </div>

                <div>
                    <label htmlFor="admin-email" className='mb-1 block text-sm font-medium text-green-700'>Email</label>
                    <input id="admin-email" type="email" value={admin?.email || ""} disabled className='w-full cursor-not-allowed rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-500'/>
                    <p className='text-xs text-text-muted mt-1'>Email changes aren't supported yet.</p>
                </div>

                <button type='submit' disabled={profileSubmitting} className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 sm:w-auto'>
                    <Save size={16} /> {profileSubmitting ? "Saving..." : "Save profile"}
                </button>
            </form>
        </section>

        <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><LockKeyhole size={19} /></span><div><h2 className='font-display text-2xl text-green-900'>Password</h2><p className='text-xs text-green-600'>Update your admin sign-in password.</p></div></div>

            <form onSubmit={handlePasswordSubmit} className='space-y-4'>
                {passwordError && (
                    <div role="alert" className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{passwordError}</div>
                )}
                {passwordSuccess && (
                    <div role="status" className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"><CheckCircle2 size={16} />{passwordSuccess}</div>
                )}

                <div>
                    <label htmlFor="current-password" className='mb-1 block text-sm font-medium text-green-700'>Current password</label>
                    <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={fieldClass} autoComplete='current-password'/>
                </div>

                <div>
                    <label htmlFor="new-password" className='mb-1 block text-sm font-medium text-green-700'>New password</label>
                    <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={fieldClass} autoComplete='new-password'/>
                </div>

                <div>
                    <label htmlFor="confirm-password" className='mb-1 block text-sm font-medium text-green-700'>Confirm new password</label>
                    <input id="confirm-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className={fieldClass} autoComplete='new-password'/>
                </div>

                <button type="submit" disabled={passwordSubmitting} className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60 sm:w-auto'>
                    <LockKeyhole size={16} /> {passwordSubmitting ? "Saving..." : "Change password"}
                </button>
            </form>
        </section>
        </div>
    </div>
  )
}

export default Settings
