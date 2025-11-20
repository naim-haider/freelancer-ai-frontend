import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        // `${API_BASE_URL}/login`,
        `${API_BASE_URL}/api/users/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = res.data;
      console.log(data);

      if (res.status === 429) {
        setError(
          "Server is busy (rate limit hit). Please try again in a few seconds."
        );
      } else if (data.success) {
        localStorage.setItem("freelancerUser", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        navigate("/");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        // Backend responded with an error (e.g. 400, 401)
        setError(err.response.data?.error || "Invalid credentials");
      } else if (err.request) {
        // Request made but no response
        setError("No response from server. Please try again later.");
      } else {
        // Something else happened
        setError(err.message || "Network error. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          🚀 Freelancer AI
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Login to access your bid assistant
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
