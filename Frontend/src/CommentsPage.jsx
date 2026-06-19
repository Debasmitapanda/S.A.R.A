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
  const [comments, setComments] = useState([]);
  const [num, setNum] = useState(10);
  const [reduced, setReduced] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding comment
  const [author, setAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentDate, setCommentDate] = useState("");

  const aId = localStorage.getItem("aId") || "A-101";

  // Fetch comments from MongoDB or fallback
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/api/amend/${aId}/getMlResult`);
        if (res.status === 200) {
          const amendData = await res.json();
          if (amendData.comments && amendData.comments.length > 0) {
            setComments(amendData.comments);
            setNum(amendData.comments.length);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error loading comments from DB:", e);
      }

      // Fallback to location state or localStorage
      const stateComments = location.state?.comments;
      if (stateComments && stateComments.length > 0) {
        setComments(stateComments);
        setNum(stateComments.length);
      } else {
        try {
          const stored = JSON.parse(localStorage.getItem("commentsData")) || [];
          setComments(stored);
          setNum(stored.length);
        } catch {
          setComments([]);
        }
      }
      setLoading(false);
    };

    fetchComments();
  }, [location.state, aId]);

  useEffect(() => {
    // Whenever num or comments change, update reduced list
    if (num === "All" || num >= comments.length) {
      setReduced(comments);
    } else {
      setReduced(comments.slice(0, Number(num)));
    }
  }, [num, comments]);

  const handleChange = (e) => {
    e.preventDefault();
    let val = e.target.value;
    if (val === "All") {
      setNum(comments.length);
    } else {
      setNum(Number(val));
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      Author: author.trim() || "Anonymous",
      Comment: commentText.trim(),
      Date: commentDate || new Date().toISOString().split("T")[0],
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    setNum(updatedComments.length);
    
    // Save JSON locally
    localStorage.setItem("commentsData", JSON.stringify(updatedComments));

    // Convert comments to CSV for ML report generation pipeline
    const headers = ["Author", "Date", "Comment"];
    const rows = updatedComments.map(c => {
      const auth = (c.Author || "Anonymous").replace(/"/g, '""');
      const dt = (c.Date || "").replace(/"/g, '""');
      const content = (c.Comment || c.tweet || "").replace(/"/g, '""');
      return `"${auth}","${dt}","${content}"`;
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    localStorage.setItem("csvFileContent", csvContent);
    localStorage.setItem("csvFileName", "comments.csv");
    localStorage.setItem("csvFileType", "text/csv");

    // Save to MongoDB
    try {
      await fetch(`http://localhost:3000/api/amend/${aId}/saveComments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments: updatedComments }),
      });
    } catch (err) {
      console.error("Failed to save comments list to MongoDB:", err);
    }

    // Reset form and close modal
    setAuthor("");
    setCommentText("");
    setCommentDate("");
    setIsAddModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-bg p-6 rounded-lg border border-gray-200/80 shadow-md bg-white relative"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        View All Comments
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <span className="text-gray-500">Loading comments...</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Show</span>
              <select
                onChange={handleChange}
                name="num"
                value={num}
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
                      <div>{c.Comment || c.tweet}</div>
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

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                setCommentDate(new Date().toISOString().split("T")[0]);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-md shadow-md transition-all"
            >
              <span className="font-bold text-base">+</span> Add Comment
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-md shadow-md">
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal for adding comment */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[95%] max-w-md p-6 relative border border-gray-150">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">+</span>
              Add New Comment
            </h3>
            
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Author Name</label>
                <input
                  type="text"
                  placeholder="Anonymous"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={commentDate}
                  onChange={(e) => setCommentDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Comment</label>
                <textarea
                  placeholder="Type the comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-28 bg-white text-slate-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md"
                >
                  Add Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
