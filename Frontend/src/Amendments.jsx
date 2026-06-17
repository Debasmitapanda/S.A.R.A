import { motion } from "framer-motion";
import { Notifications } from "@mui/icons-material";
import CommentUpload from "./components/CommentsUpload";
import CommentsPage from "./CommentsPage";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Avatar from "@mui/material/Avatar";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress"; // Material-UI loader
import Box from "@mui/material/Box"; // For centering


export default function Amendments() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  // const {amendments,setAmendments} = useState([])

  const [amendments, setAmendments] = useState([]);
  const [verified, setVerified] = useState(
    JSON.parse(localStorage.getItem("savedResults")) || {}
  );
  const [loader, setLoader] = useState(false);

  const getAmends = async () => {
    try {
      setLoader(true);
      const res = await fetch("http://localhost:3000/api/amend/getAmend"); // GET request
      const data = await res.json();
      if (res.status === 200) {
        setAmendments(data);
      }
    } catch (e) {
      toast.error("Error occurred: " + e.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    getAmends();
  }, []);

  const getMlResults = async (aId) => {
    try {
      const result = await fetch(
        `http://localhost:3000/api/amend/${aId}/getMlResult`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      const data = await result.json();
      console.log("The ml result is ", result);
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  const downloadPDF = async (title, aId) => {
    try {
      const mlResult = await getMlResults(aId);
      // <-- await here
      if (!mlResult) {
        console.error("No ML result available for PDF");
        return;
      }
      // Derived values (null until data is ready)
      const positive = mlResult?.mlData.sentiment_counts?.positive ?? null;
      const negative = mlResult?.mlData.sentiment_counts?.negative ?? null;
      const neutral = mlResult?.mlData.sentiment_counts?.neutral ?? null;
      const total =
        positive !== null && negative !== null && neutral !== null
          ? positive + negative + neutral
          : null;

      const Pp = total ? ((positive / total) * 100).toFixed(2) : null;
      const Np = total ? ((negative / total) * 100).toFixed(2) : null;
      const Nup = total ? ((neutral / total) * 100).toFixed(2) : null;

      const payload = {
        amendmentId: aId,
        amendmentTitle: title,
        totalComments: mlResult.mlData.sentiment_counts?.total ?? 0,
        counts: mlResult.mlData.sentiment_counts,
        percentages: {
          positive: Pp ?? 0,
          negative: Np ?? 0,
          neutral: Nup ?? 0,
        },
        keywords: mlResult.mlData.keywords ?? ["economy", "jobs", "growth"],
        summaries: mlResult.mlData.summaries,
      };

      const res = await fetch("http://localhost:5000/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      // Download the PDF
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${aId}_AmendmentReport.pdf`;
      document.body.appendChild(a); // ensure in DOM
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-inter">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
              <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
              <polyline points="16.5 19.79 16.5 14.6 21 12"></polyline>
              <polyline points="12 12.01 12 22.42"></polyline>
              <line x1="12" x2="3" y1="12" y2="12"></line>
              <line x1="12" x2="21" y1="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900">S.A.R.A.</h1>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <button
            onClick={() => navigate("/amendments")}
            className="font-semibold text-blue-600"
          >
            Amendments
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="text-slate-600 hover:text-slate-900"
          >
            Settings
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-slate-100">
            <Notifications className="text-slate-500" />
          </button>
          {user.profilePic.length > 0 ? (
            <Avatar
              alt="Travis Howard"
              sx={{ fontSize: "large" }}
              src={user.profilePic}
            />
          ) : (
            <AccountCircleIcon fontSize="large" />
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Amendments
              </h2>
              <p className="text-sm text-slate-500">
                Review and manage proposed amendments.
              </p>
            </div>
            <a
              href="https://www.mca.gov.in/content/mca/global/en/home.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:to-indigo-600 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              <OpenInNewIcon fontSize="small" />
              <span>Go to MCA Portal</span>
            </a>
          </div>

          <motion.div
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {loader ? (
              // Loader Section (centered)
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "300px", // adjust based on layout
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              // Table Section
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  {/* Table Head */}
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-600 sm:pl-6">
                        Amendment ID
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-600">
                        Title
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-600">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-600">
                        Date Submitted
                      </th>
                      <th className="relative py-3.5 pl-3 pr-4 font-semibold sm:pr-6 text-center text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {amendments.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        {/* Amendment ID */}
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-500 sm:pl-6">
                          {item.aId}
                        </td>

                        {/* Title */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                          {item.title}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {item.mlData?.summaries?.neutral?.length === 0 ? (
                            <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium bg-yellow-200">
                              Not Reviewed
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium bg-green-200">
                              Reviewed
                            </span>
                          )}
                        </td>

                        {/* Date Submitted */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {item.mlData?.lastUpdated
                            ? new Date(item.mlData.lastUpdated).toLocaleString()
                            : "N/A"}
                        </td>

                        {/* Actions Column */}

                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex gap-2 justify-end">
                          <CommentUpload aId={item.aId} />
                          <button
                            onClick={() => downloadPDF(item.title, item.aId)}
                            disabled={item.mlData?.summaries?.neutral?.length === 0}
                            className={`inline-flex items-center gap-1.5 w-fit p-2 rounded-lg transition-all 
      ${item.mlData?.summaries?.neutral?.length === 0
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600 text-white"}`
                            }
                          >
                            Download Report
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            )}

            <nav
              aria-label="Pagination"
              className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6"
            >
              <div className="hidden sm:block">
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">5</span> of{" "}
                  <span className="font-medium">20</span> results
                </p>
              </div>
              <div className="flex flex-1 justify-between sm:justify-end">
                <a
                  href="#"
                  className="relative inline-flex items-center rounded-md border  border-blue-500 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Previous
                </a>
                <a
                  href="#"
                  className="relative ml-3 inline-flex items-center rounded-md border  border-blue-500 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Next
                </a>
              </div>
            </nav>
          </motion.div>
        </div>
      </main>
    </div>
  );
}





