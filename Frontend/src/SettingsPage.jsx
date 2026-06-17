import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { deepOrange, deepPurple } from '@mui/material/colors';


import { useSelector, useDispatch } from "react-redux";
import Avatar from "@mui/material/Avatar";

export default function SettingsPage() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Simple animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="flex min-h-screen bg-gray-100"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
      }}
    >
      {/* Sidebar */}
      <motion.aside
        className="w-64 bg-white border-r border-gray-200 flex flex-col"
        variants={fadeInUp}
      >
        <div className="p-6 flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage: `url('https://dummyimage.com/100x100/0f49bd/ffffff&text=S')`,
            }}
          ></motion.div>
          <h1 className="text-gray-800 text-lg font-bold">S.A.R.A</h1>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-2">
          {[
            { icon: "home", label: "Amendments", path: "/amendments" },
            {
              icon: "analytics",
              label: "Reports",
              path: "/amendments/comments/report",
            },
            { icon: "notifications", label: "Alerts", path: "/alerts" },
          ].map((item) => (
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.97 }}
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-white bg-[#0f49bd] rounded-md"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </motion.button>
        </nav>
        <div className="px-4 py-2">
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/help")}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <span className="material-symbols-outlined">help_outline</span>
            <span>Help and Docs</span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          <motion.h1
            className="text-4xl font-bold text-gray-800 mb-8"
            variants={fadeInUp}
          >
            Settings
          </motion.h1>

          <motion.div
            className="bg-white rounded-lg shadow-md overflow-hidden divide-y divide-gray-200"
            variants={fadeInUp}
          >
            {/* Admin Profile */}
            <motion.div className="p-6" variants={fadeInUp}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Admin Profile
              </h2>
              <div className="flex items-center gap-6">
                {user.profilePic.length > 0 ? (
                  <motion.div
                    whileHover={{ scale: 1.00 }}
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-28 h-28" // bigger size than size-20
                    style={{
                      backgroundImage: `url(${user.profilePic})`,
                    }}
                  ></motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-28 h-28 flex items-center justify-center"
                  >
                    <Avatar
                      sx={{
                        bgcolor: deepOrange[400],
                        width: "100%",
                        height: "100%",
                        fontSize: "3rem", // adjust font size for bigger initial
                      }}
                    >
                      {user.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                  </motion.div>
                )}

                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {user.fullName}
                  </p>
                  <p className="text-gray-500">{user.department}</p>
                </div>
              </div>
            </motion.div>

            {/* Password & Security */}
            <motion.div className="p-6" variants={fadeInUp}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Password &amp; Security
              </h2>
              <div className="space-y-4">
                <motion.div
                  className="flex items-center justify-between"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-gray-500">
                      lock
                    </span>
                    <p className="text-gray-700">Password Reset</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#0f49bd] rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Change
                  </motion.button>
                </motion.div>
                <motion.div
                  className="flex items-center justify-between"
                  whileHover={{ backgroundColor: "#f9fafb" }}
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-gray-500">
                      verified_user
                    </span>
                    <p className="text-gray-700">Two-Factor Authentication</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={() => setTwoFactor(!twoFactor)}
                      className="sr-only peer"
                    />
                    <motion.div
                      layout
                      className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0f49bd] after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                    ></motion.div>
                  </label>
                </motion.div>
              </div>
            </motion.div>

            {/* Export Preferences */}
            <motion.div className="p-6" variants={fadeInUp}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Export Preferences
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-gray-500">
                    description
                  </span>
                  <p className="text-gray-700">Default Export Format</p>
                </div>
                <motion.select
                  whileFocus={{ scale: 1.05 }}
                  className="w-32 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none"
                >
                  <option>PDF</option>
                  <option>CSV</option>
                </motion.select>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div className="p-6" variants={fadeInUp}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Appearance
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-gray-500">
                    contrast
                  </span>
                  <p className="text-gray-700">Theme</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setTheme("light")}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      theme === "light"
                        ? "bg-[#0f49bd] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      light_mode
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={() => setTheme("dark")}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      theme === "dark"
                        ? "bg-[#0f49bd] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="material-symbols-outlined">dark_mode</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
