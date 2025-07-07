import { useState } from 'react';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const res = await axios.post("/api/login", { token });
      onLogin(res.data);
    } catch {
      setError("Invalid token or permissions.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h2>ClientCord | Enter Your Bot Token:</h2>
      <input type="password" placeholder="Bot Token" value={token} onChange={(e) => setToken(e.target.value)} />
      <button onClick={login}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}