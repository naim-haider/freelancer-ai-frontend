import React, { useState } from "react";
import UserService from "../services/UserService";
import { X, Save, User, Mail, Phone, Shield, Lock } from "lucide-react";

function EditUserModal({ user, onClose, refresh, currentUser }) {
  const [form, setForm] = useState({
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create update payload - only send fields that have values
      const updatePayload = {};

      if (form.username && form.username !== user.username) {
        updatePayload.username = form.username;
      }

      // Only send email if it's changed
      if (form.email && form.email !== user.email) {
        updatePayload.email = form.email;
      }

      if (form.phone && form.phone !== user.phone) {
        updatePayload.phone = form.phone;
      }

      if (form.role && form.role !== user.role) {
        updatePayload.role = form.role;
      }

      // Only send password if it's provided
      if (form.password && form.password.trim() !== "") {
        updatePayload.password = form.password;
      }

      console.log("Update payload:", updatePayload);

      await UserService.update(user._id, updatePayload);

      // Refresh the data
      await refresh();

      // Close modal
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.error || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const canEditRole =
    currentUser?.role === "super-admin" || currentUser?.role === "admin";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-500 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <p className="text-blue-100 text-sm">Update user information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
              className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - Format: +1234567890
            </p>
          </div>

          {/* Role (only for admins) */}
          {canEditRole && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl focus:outline-none transition-colors"
              >
                {currentUser?.role === "super-admin" && (
                  <option value="super-admin">👑 Super Admin</option>
                )}
                <option value="admin">🛡️ Admin</option>
                <option value="user">👤 User</option>
              </select>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="w-full border-2 border-gray-300 focus:border-blue-500 px-4 py-3 rounded-xl focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional - Only fill if you want to change the password
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
