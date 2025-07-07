import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [data, setData] = useState(null);
  return data ? <Dashboard botData={data} /> : <LoginPage onLogin={setData} />;
}