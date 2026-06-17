import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Dashboard, Assessment, Settings } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";


// const comments = [
//     { id: 1, text: "This is a great initiative! I fully support it.", author: "John Doe", date: "2024-01-15" },
//     { id: 2, text: "I have some concerns about the potential impact on local businesses.", author: "Jane Smith", date: "2024-01-16" },
//     { id: 3, text: "More information is needed before I can form an opinion.", author: "Local Business Owner", date: "2024-01-17" },
//     { id: 4, text: "Excellent work! Keep up the good efforts.", author: "Community Leader", date: "2024-01-18" },
//     { id: 5, text: "I'm not sure about this. It seems like a waste of resources.", author: "Concerned Citizen", date: "2024-01-19" }
// ];

function Sidebar() {
    const location = useLocation();
  const { csvFile }= location.state || [];
  return (
    <aside className="w-64 flex-shrink-0 sidebar-bg border-r border-gray-200/50 flex flex-col shadow-lg">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200/50 bg-white">
        <div className="size-8 text-blue-600">
          <Dashboard />
        </div>
        <h2 className="text-gray-900 text-lg font-bold">S.A.R.A.</h2>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 bg-white">
        <Link
          to="/amendments"
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md shadow-md"
        >
          <Dashboard fontSize="small" /> All Comments
        </Link>

        <Link
          to="/amendments/comments/report"
          state={{ csvFile: csvFile }} // pass the actual File here
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/50 rounded-md"
        >
          <Assessment fontSize="small" /> Generate Report with AI
        </Link>

        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200/50 rounded-md"
        >
          <Settings fontSize="small" /> Settings
        </Link>
      </nav>
    </aside>
  );
}

function Header() {
  const {user} = useSelector((state)=>state.auth)
  return (
    <header className="flex items-center justify-between h-16 px-10 header-bg border-b border-gray-200/50 shadow-sm  bg-white">
      <h1 className="text-xl font-semibold text-gray-900">
        Comments & AI Report
      </h1>
       {user.profilePic.length > 0 ? (
            <Avatar
              alt="Travis Howard"
              sx={{ fontSize: "large" }}
              src={user.profilePic}
            />
          ) : (
            <AccountCircleIcon fontSize="large" />
          )}
    </header>
  );
}

function CommentsTable() {
  const location = useLocation();
 // Safely parse localStorage
  const storedComments = (() => {
    try {
      return JSON.parse(localStorage.getItem("commentsData")) || [];
    } catch {
      return [];
    }
  })();

  const comments = location.state?.comments || storedComments;
  const [num, setNum] = useState(comments.length);
  const [reduced, setReduced] = useState([]);
  const handleChange = (e) => {
    e.preventDefault();
    let val = e.target.value;
    if (val != "All") {
      setNum(Number(val));
    } else {
      setNum(comments.length);
    }
  };
  const getComments = (comments) => {
    return comments.slice(0, num);
  };

  useEffect(() => {
    setReduced(getComments(comments));
  }, [num]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-bg p-6 rounded-lg border border-gray-200/80 shadow-md bg-white"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        View All Comments
      </h2>

      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span>Show</span>
          <select
            onChange={handleChange}
            name="num"
            className="border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
          >
            <option value="All">All</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-blue-100/70">
            <tr>
              <th className="px-6 py-3">Serial No.</th>
              <th className="px-6 py-3 min-w-[300px]">Comment</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
        <tbody>
  {reduced.map((c, index) => (
    <tr
      key={index}
      className={`border-b border-gray-200/80 hover:bg-gray-50/70 ${
        index % 2 === 1 ? "bg-blue-50/70" : "bg-white/50"
      }`}
    >
      <td className="px-6 py-4 font-medium text-gray-900">
        {index + 1}
      </td>
      <td className="px-6 py-4">
        <div>{c.Comment}</div>
        <div className="text-xs text-gray-800 mt-1 font-bold">
          by {c.Author}
        </div>
      </td>
      <td className="px-6 py-4">{c.Date}</td>
    </tr>
  ))}
</tbody>


        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md shadow-md">
          Next
        </button>
      </div>
    </motion.div>
  );
}

export default function CommentsPage() {
  return (
    <div
      className="bg-gradient-futuristic bg-blue-50 text-gray-800 min-h-screen flex"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <Sidebar />
      <main className="flex-1">
        <Header />
        <div className="p-10 grid grid-cols-1">
          <CommentsTable />
        </div>
      </main>
    </div>
  );
}
