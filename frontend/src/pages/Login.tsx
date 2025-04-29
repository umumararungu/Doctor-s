import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      
      localStorage.setItem('token', data.token);
      alert('Login successful!');
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        className="w-full p-2 border mb-2"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full p-2 border mb-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <select
        className="w-full p-2 border mb-4"
        value={role}
        onChange={e => setRole(e.target.value as 'patient' | 'doctor')}
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
      </select>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Login
      </button>
    </div>
  );
};

export default Login;
