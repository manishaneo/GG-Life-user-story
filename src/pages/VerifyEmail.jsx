import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(15);//
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!code || code.length !== 4) {
      setError("Please enter a valid 4-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-code", {//
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code:code }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/email-success");
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(60);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/resend-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("New verification code sent!");
      } else {
        setError(data.message || "Failed to resend code");
        setTimer(0);
        setCanResend(true);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setTimer(0);
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <div className="text-4xl">📧</div>
        <h2 className="text-xl font-bold mt-4">Verify your email</h2>
        <p className="text-gray-600 mt-2">
          Enter the 4-digit code sent to <span className="font-semibold">{email}</span>
        </p>

        {error && (
          <div className="mt-4 p-2 bg-red-100 text-red-600 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-2 bg-green-100 text-green-600 rounded text-sm">
            {success}
          </div>
        )}

        <div className="mt-6">
          <input
            type="text"
            maxLength="4"
            placeholder="0000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            className="text-center text-3xl tracking-widest w-full border-b-2 border-gray-300 focus:border-green-600 outline-none py-2"
          />
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className={`mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        <div className="mt-6 text-sm text-gray-500">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`font-semibold ${canResend ? "text-green-600 hover:text-green-700" : "text-gray-400 cursor-not-allowed"
              }`}
          >
            {canResend ? "Resend Code" : `Resend in ${timer}s`}
          </button>
        </div>
      </div>
    </div>
  );
}
