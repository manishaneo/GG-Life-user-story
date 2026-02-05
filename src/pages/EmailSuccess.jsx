import { useNavigate } from "react-router-dom";

export default function EmailSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-bold mt-4 text-green-600">
          Email verified successfully
        </h2>
        <p className="text-gray-600 mt-2">
          Your account is now active.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
}
