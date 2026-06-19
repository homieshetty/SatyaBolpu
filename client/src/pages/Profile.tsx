import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUserAlt } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import Button from '../components/Button';
import useApi from '../hooks/useApi';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useDialog } from '../context/DialogBoxContext';
import gsap from 'gsap';
import { BASE_URL } from '../App';

const Profile = () => {
  const { state, dispatch } = useAuth();
  const dialog = useDialog();
  const { error, loading, post } = useApi('/auth/logout', { auto: false });
  const [buttonLoad, setButtonLoad] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    dialog.popup({
      title: 'Logging Out',
      description: 'Are you sure you want to log out?',
      severity: 'risky',
      onConfirm: async () => {
        try {
          await post({});
          dispatch({ type: 'LOGOUT' });
          toast.info('User Logged Out');
        } catch (err) {
          console.error('Logout failed:', err);
          toast.error('Something went wrong while logging out.');
        }
      },
    });
  };

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (profileRef.current) {
        gsap.fromTo(
          profileRef.current,
          { top: '100px', opacity: 0 },
          { top: '0px', opacity: 1, duration: 0.75, ease: 'power2.inOut' },
        );
      }
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setButtonLoad(loading);
    if (error) {
      console.warn('Logout error:', error);
      toast.error(error);
    }
  }, [error, loading]);

  if (!state.token) return <Navigate to="/login" replace />;

  return (
    <div className="relative w-full min-h-screen bg-black flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute w-150 h-150 rounded-full bg-primary/10 blur-3xl" />

      <div
        ref={profileRef}
        className="relative w-full sm:w-[85%] md:w-2/3 lg:w-1/2 xl:w-[42%] max-w-3xl border border-zinc-500/60
          rounded-3xl px-8 py-14 flex flex-col items-center gap-8 overflow-hidden"
      >
        <div className="flex flex-col items-center text-center relative">
          <div
            className="w-32 h-32 rounded-full bg-black/40 border-2 border-primary/40
              flex items-center justify-center overflow-hidden"
          >
            {state.user?.image ? (
              <img
                className="object-cover w-full h-full object-center"
                src={`${BASE_URL}${state.user.image}`}
                alt="profile-image"
              />
            ) : (
              <FaUserAlt className="text-primary text-6xl" />
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl md:text-4xl font-black text-white">
                {state.user?.name}
              </h1>

              {state.user?.verified && (
                <MdVerified className="text-blue-500 text-2xl" />
              )}
            </div>

            <p className="text-zinc-400 italic mt-1">@{state.user?.uname}</p>

            {state.user?.role !== 'user' && (
              <div
                className="mt-3 inline-flex px-4 py-1 rounded-full text-green-400 
                  text-xs font-bold tracking-widest uppercase"
              >
                {state.user?.role}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center w-full">
          <div className="flex-1 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
        </div>

        <div className="w-full grid gap-5">
          <div className="bg-black/30 border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Email Address
            </p>

            <p className="text-white break-all">{state.user?.email}</p>
          </div>

          <div className="bg-black/30 border border-zinc-800 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">
              Phone Number
            </p>

            <p className="text-white">
              {state.user?.phone ? (
                '+' + state.user.phone.dialCode + ' ' + state.user.phone.number
              ) : (
                <span className="italic text-zinc-500">Not Provided</span>
              )}
            </p>
          </div>
        </div>

        <div className="w-full pt-2">
          <Button
            loading={buttonLoad}
            loadingText="Leaving Portal..."
            onClick={handleLogout}
            className="w-full py-3.5 rounded-full bg-primary hover:bg-[#d46f2a] text-black
             font-bold tracking-widest uppercase"
            content="Log Out"
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
