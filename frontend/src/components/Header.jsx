import React from 'react';
import { useNavigate } from 'react-router-dom';
// import {logo} from '../assets/seal';

function Header() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Guest';

    const handleLogin = () => {
        if (!token) {
            navigate('/signin');  // Redirect to signin page if not logged in
        } else {
            navigate('/profile');  // Redirect to profile page if logged in
        }
    };

    const handleDashboard = () => {
        navigate('/homepage');  // Navigate to the dashboard
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/signin');  // Redirect to signin page after logout
    };

    return (
        <header className="bg-blue-900 text-white p-4 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex space-x-8">
                    <h1 className='font-bold text-2xl'><i class="fa-solid fa-magnifying-glass"></i>SealSure</h1>
                    <button onClick={() => navigate('/learn')} className="hover:text-gray-200">
                        Learn
                    </button>
                    <button onClick={() => navigate('/about')} className="hover:text-gray-200">
                        About
                    </button>
                    <button onClick={() => navigate('/docs')} className="hover:text-gray-200">
                        Docs
                    </button>
                </div>

                <div className="flex items-center space-x-6">
                    {!token ? (
                        <button onClick={handleLogin} className="bg-blue-950 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                            Login
                        </button>
                    ) : (
                        <>
                            <button onClick={handleDashboard} className="bg-blue-950 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
                                Dashboard
                            </button>
                            <span className="text-white">Hello, {username}</span>
                            <button onClick={handleLogout} className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-red-700">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
