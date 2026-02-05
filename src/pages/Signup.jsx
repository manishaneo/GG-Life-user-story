import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors = {};

    // First Name validation
    if (!form.firstname.trim()) {
      newErrors.firstname = "First Name is required";
    } else if (!/^[A-Za-z ]+$/.test(form.firstname)) {
      newErrors.firstname = "First Name can contain only letters";
    };

    // Last Name validation
    if (!form.lastname.trim()) {
      newErrors.lastname = "Last Name is required";
    } else if (!/^[A-Za-z ]+$/.test(form.lastname)) {
      newErrors.lastname = "Last Name can contain only letters";
    };

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Enter a valid email address";
    }

    // Password Validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)
    ) {
      newErrors.password =
        "Password must contain letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (validate()) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await response.json();

        if (response.ok) {
          await fetch("http://localhost:5000/api/auth/send-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email }),
          });
          navigate("/verify-email", { state: { email: form.email } });
        } else {
          setApiError(data.message || "Signup failed");
        }
      } catch (err) {
        setApiError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Create your GG Life account
        </h1>

        <p className="text-sm text-gray-500 text-center mt-2">
          Join GG Life to continue
        </p>

        {apiError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                type="text"
                placeholder="First Name"
                value={form.firstname}
                onChange={(e) =>
                  setForm({ ...form, firstname: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.firstname
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-green-600"
                  }`}
              />
              {errors.firstname && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstname}
                </p>
              )}
            </div>
            <div className="w-1/2">
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastname}
                onChange={(e) =>
                  setForm({ ...form, lastname: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.lastname
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-green-600"
                  }`}
              />
              {errors.lastname && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastname}
                </p>
              )}
            </div>
          </div>

          <div>
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.email
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-green-600"
                }`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 ${errors.password
                ? "border-red-500 focus:ring-red-500"
                : "focus:ring-green-600"
                }`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
