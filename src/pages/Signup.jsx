import { useState } from "react";
import { useNavigate } from "react-router-dom";

//  CHANGED
import {
  nameRegex,
  emailRegex,
  passwordRegex
} from "../utils/validators";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({}); // CHANGED
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  
  //  CHANGED
  
  const validateField = (name, value) => {
    switch (name) {
      case "firstname":
  if (!value.trim()) return "First name is required";

  // changed
  if (value.length < 3)
    return "Enter more than 2 characters";

  if (value.length > 15)
    return "First name must not exceed 15 characters";

  if (!nameRegex.test(value))
    return "Enter a valid first name";

  return "";

case "lastname":
  if (!value.trim()) return "Last name is required";

  // changed
  if (value.length > 15)
    return "Last name must not exceed 15 characters";

  if (!nameRegex.test(value))
    return "Enter a valid last name";

  return "";


      case "email":
        if (!value.trim()) return "Email is required";
        if (!emailRegex.test(value))
          return "Enter a valid email address";
        return "";

      case "password":
        if (!value) return "Password is required";
        if (!passwordRegex.test(value))
          return "Password must be at least 8 characters and contain letters & numbers";
        return "";

      default:
        return "";
    }
  };

  
  //  CHANGED
  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  //  CHANGED
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Revalidate only if field already blurred
    if (touched[name]) {
      setErrors({
        ...errors,
        [name]: validateField(name, value),
      });
    }
  };

  
  // CHANGED: handleBlur (TAB / next field)
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({
      ...errors,
      [name]: validateField(name, value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // CHANGED: mark all fields touched on submit
    setTouched({
      firstname: true,
      lastname: true,
      email: true,
      password: true,
    });

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
  setApiError(data.message || "Signup failed");
  return;
}

// CHANGED
const sendCodeRes = await fetch(
  "http://localhost:5000/api/auth/send-code",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.email }),
  }
);

const sendCodeData = await sendCodeRes.json();

if (!sendCodeRes.ok) {
  // CHANGED
  setApiError(
    sendCodeData.message ||
    "Unable to send verification email. Please check your email."
  );
  return;
}
// CHANGED
navigate("/verify-email", { state: { email: form.email } });
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Create your GG Life account
        </h1>

        {apiError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">

          <div className="flex gap-4">
            <div className="w-1/2">
              <input
                name="firstname"
                placeholder="First Name"
                value={form.firstname}
                onChange={handleChange}   // CHANGED
                onBlur={handleBlur}      // CHANGED
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.firstname && touched.firstname
                    ? "border-red-500"
                    : "focus:ring-green-600"
                }`}
              />
              {errors.firstname && touched.firstname && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.firstname}
                </p>
              )}
            </div>

            <div className="w-1/2">
              <input
                name="lastname"
                placeholder="Last Name"
                value={form.lastname}
                onChange={handleChange}   // CHANGED
                onBlur={handleBlur}      // CHANGED
                className={`w-full px-4 py-3 border rounded-lg ${
                  errors.lastname && touched.lastname
                    ? "border-red-500"
                    : "focus:ring-green-600"
                }`}
              />
              {errors.lastname && touched.lastname && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.lastname}
                </p>
              )}
            </div>
          </div>

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}     //  CHANGED
            onBlur={handleBlur}        //  CHANGED
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.email && touched.email
                ? "border-red-500"
                : "focus:ring-green-600"
            }`}
          />
          {errors.email && touched.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}     //  CHANGED
            onBlur={handleBlur}        // CHANGED
            className={`w-full px-4 py-3 border rounded-lg ${
              errors.password && touched.password
                ? "border-red-500"
                : "focus:ring-green-600"
            }`}
          />
          {errors.password && touched.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Already registered?
            </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ml-2 text-sm font-semibold text-green-600 hover:underline"
            >
              Login
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
