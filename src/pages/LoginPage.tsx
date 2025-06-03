import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState<string|null>(null);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav('/admin');
    } catch (err:any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email} onChange={e=>setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password} onChange={e=>setPass(e.target.value)}
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Entrar
        </button>
      </form>
    </div>
  );
}
