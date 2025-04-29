import React, { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient', specialty: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">Registration successful!</div>}
      <input className="w-full p-2 border mb-2" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input className="w-full p-2 border mb-2" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input className="w-full p-2 border mb-2" type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <select className="w-full p-2 border mb-2" onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
      </select>
      {form.role === 'doctor' && <input className="w-full p-2 border mb-2" placeholder="Specialty" onChange={e => setForm({ ...form, specialty: e.target.value })} />}
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>Register</button>
    </div>
  );
};

export default Register;
