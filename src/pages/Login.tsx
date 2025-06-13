import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const {
    login
  } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    // In this mock version, we don't validate the password
    const success = login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Leave Management System
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input id="email" type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input id="password" type="password" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo accounts:</p>
          <p className="mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded">
              john@example.com
            </code>{' '}
            - Employee
          </p>
          <p className="mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded">
              manager@example.com
            </code>{' '}
            - Manager
          </p>
          <p className="mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded">
              admin@example.com
            </code>{' '}
            - Admin
          </p>
          <p className="mt-3 text-xs text-gray-500">
            (Any password will work for this demo)
          </p>
        </div>
      </div>
    </div>;
}