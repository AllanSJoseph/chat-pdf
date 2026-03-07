import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        first_name: '',
        last_name: '',
        phone_no: '',
        password: '',
        conf_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.conf_password) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await authAPI.signup({
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password,
                phone_no: formData.phone_no
            });
            // Redirect to login on success
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return ( 
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome to <span className="text-blue-600">ChatPDF</span>
                        </h1>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            An advanced <b>Ctrl + F</b> for your pdfs
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label 
                                htmlFor="email" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                placeholder="Enter your email"
                            />
                        </div>
                        
                        {/* First Name */}
                        <div>
                            <label 
                                htmlFor="first_name" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                First Name
                            </label>
                            <input 
                                type="text" 
                                id="first_name" 
                                name="first_name" 
                                value={formData.first_name}
                                onChange={handleChange}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                placeholder="Enter your first name"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label 
                                htmlFor="last_name" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Last Name
                            </label>
                            <input 
                                type="text" 
                                id="last_name" 
                                name="last_name" 
                                value={formData.last_name}
                                onChange={handleChange}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                placeholder="Enter your last name"
                            />
                        </div>

                        {/* Phone No */}
                        <div>
                            <label 
                                htmlFor="phone_no" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Phone Number
                            </label>
                            <input 
                                type="text" 
                                id="phone_no" 
                                name="phone_no" 
                                value={formData.phone_no}
                                onChange={handleChange}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                placeholder="Enter your phone no"
                            />
                        </div>

                        {/* Password Fields */}
                        <div>
                            <label 
                                htmlFor="password" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div>
                            <label 
                                htmlFor="conf_password" 
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirm Password
                            </label>
                            <input 
                                type="password" 
                                id="conf_password" 
                                name="conf_password" 
                                value={formData.conf_password}
                                onChange={handleChange}
                                required 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
                                placeholder="Confirm your password"
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                        >
                            {loading ? 'Processing...' : 'Sign Up'}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center mt-6">
                            <span className="text-gray-600 text-sm">
                                Already a User?{" "}
                                <a 
                                    href="/login" 
                                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition duration-200"
                                >
                                    Log In
                                </a>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup;