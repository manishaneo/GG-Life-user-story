import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to GG Life, {user.firstname}!
        </h1>

        <p className="text-gray-600 mt-2">
          You have successfully logged in as <span className="font-semibold">{user.email}</span>.
        </p>

        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold">
            Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            This is the GG Life dashboard area.
          </p>
        </div>
      </div>
    </div>
  );
}
