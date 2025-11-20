import React, { useEffect, useState } from "react";
import UserService from "../services/UserService";
import EditUserModal from "../components/EditUserModal";
import {
  User,
  Users,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  Plus,
  LogOut,
} from "lucide-react";
import NewUserModal from "../components/NewUserModal";
import { useNavigate } from "react-router-dom";

function UserProfile() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [newUser, setNewUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await UserService.getMe();
      setMe(res.data);

      if (res.data.role === "super-admin" || res.data.role === "admin") {
        fetchAllUsers();
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await UserService.getAll();
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await UserService.delete(id);
      fetchAllUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("freelancerUser");
    localStorage.removeItem("email");

    navigate("/login", { replace: true });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "super-admin":
        return "👑";
      case "admin":
        return "🛡️";
      default:
        return "👤";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your profile and users
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-gray-200">
            <button
              className={`px-6 py-3 font-semibold transition-all border-b-4 ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <User className="w-5 h-5 inline mr-2" />
              My Profile
            </button>

            {(me?.role === "super-admin" || me?.role === "admin") && (
              <button
                className={`px-6 py-3 font-semibold transition-all border-b-4 ${
                  activeTab === "users"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <Users className="w-5 h-5 inline mr-2" />
                All Users ({users.length})
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditUser(me)}
                  className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <Edit className="w-5 h-5" />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar Card */}
              <div className="col-span-full flex justify-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl">
                    {me?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-3 w-36 -right-2.5 px-4 py-2 bg-white rounded-full shadow-lg border-2 border-blue-500 text-sm font-bold">
                    <div className="flex items-center justify-center ">
                      {getRoleIcon(me?.role)} {me?.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Cards */}
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    Username
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 ml-11">
                  {me?.username}
                </p>
              </div>

              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    Email
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 ml-11 break-all">
                  {me?.email}
                </p>
              </div>

              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    Phone
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 ml-11">
                  {me?.phone || "Not provided"}
                </p>
              </div>

              <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    Role
                  </span>
                </div>
                <p
                  className={`text-xl font-bold ml-11 inline-block px-4 py-1 rounded-lg border-2 ${getRoleBadgeColor(
                    me?.role
                  )}`}
                >
                  {getRoleIcon(me?.role)} {me?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" &&
          (me?.role === "super-admin" || me?.role === "admin") && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  User Management
                </h2>
                {me?.role === "super-admin" && (
                  <button
                    onClick={() => setNewUser(true)}
                    className="flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Add New User
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border-2 border-gray-200">
                <table className="w-full">
                  <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((u, index) => (
                      <tr
                        key={u._id}
                        className={`transition-colors ${
                          index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {u.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {u.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {u.phone || "Not provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold border-2 ${getRoleBadgeColor(
                              u.role
                            )}`}
                          >
                            {getRoleIcon(u.role)} {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {me?.role === "admin" &&
                              u.role !== "super-admin" && (
                                <button
                                  className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                  onClick={() => setEditUser(u)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                            {me?.role === "super-admin" && u._id !== me._id && (
                              <button
                                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                onClick={() => deleteUser(u._id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg">No users found</p>
                </div>
              )}
            </div>
          )}

        {/* Edit Modal */}
        {editUser && (
          <EditUserModal
            user={editUser}
            onClose={() => setEditUser(null)}
            refresh={
              me?.role === "super-admin" || me?.role === "admin"
                ? fetchAllUsers
                : fetchMe
            }
            currentUser={me}
          />
        )}

        {/* NewUser Modal */}
        {newUser && (
          <NewUserModal
            onClose={() => setNewUser(false)}
            refresh={
              me?.role === "super-admin" || me?.role === "admin"
                ? fetchAllUsers
                : fetchMe
            }
            currentUser={me}
          />
        )}
      </div>
    </div>
  );
}

export default UserProfile;
