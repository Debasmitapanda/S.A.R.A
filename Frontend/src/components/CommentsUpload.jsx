import React, { useState } from "react";
import { ArrowForward } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCsvFile } from "../redux/csvSlice";

export default function CommentUpload({ item }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState([]);
  const [open, setOpen] = useState(false);
  const aId = item.aId;

  const hasComments = (item.comments && item.comments.length > 0) || (item.mlData && item.mlData.output_csv);

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleChange = (e) => {
    if (e.target.files.length <= 0) {
      toast.error("Please upload a file");
      return;
    }

    const selectedFile = e.target.files[0];

    if (
      selectedFile.type !== "text/csv" &&
      selectedFile.type !== "application/json" &&
      !selectedFile.name.endsWith(".csv") &&
      !selectedFile.name.endsWith(".json")
    ) {
      toast.error("Only CSV and JSON files are allowed");
      return;
    }

    setFile(selectedFile);
    localStorage.setItem("aId", aId); // Set immediately on user action

    toast.success("Upload Successful"); // ✅ Just store file now
    setOpen(true); // Show view/cancel options
  };

  const handleUploadAndNavigate = async () => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    localStorage.setItem("aId", aId); // Set immediately on user action

     try {
    // Read the file content as a string
    const fileContent = await readFileAsText(file);

    // Store file content and metadata in local storage
    localStorage.setItem("csvFileContent", fileContent);
    localStorage.setItem("csvFileName", file.name);
    localStorage.setItem("csvFileType", file.type);
    
  } catch (e) {
    toast.error("Could not read file for saving.");
    console.error("Error reading file:", e);
    return; // Stop if the file can't be read
  }
  // --- End: New code for local storage ---

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/api/comments/upload-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      toast.success("Upload Successful");
      setJsonData(data);
      localStorage.setItem("commentsData", JSON.stringify(data.data));

      const activeAId = localStorage.getItem("aId");
      if (activeAId) {
        try {
          await fetch(`http://localhost:3000/api/amend/${activeAId}/saveComments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ comments: data.data }),
          });
        } catch (dbErr) {
          console.error("Failed to save comments in DB on upload:", dbErr);
        }
      }

      navigate("/amendments/comments", {
        state: {
          comments: data.data, // backend response
          csvFile: file, // actual File object
          Id: activeAId,
        },
      });
    } catch (e) {
      toast.error("Upload failed, try again");
      console.error("Comments failed ", e);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOpen(false); // ✅ Reset back to Upload state
    setJsonData([]);
  };

  return (
    <div className="flex items-center space-x-2">
      <Toaster position="top-center" reverseOrder={false} />
      {hasComments ? (
        <button
          onClick={() => {
            localStorage.setItem("aId", aId);
            navigate("/amendments/comments");
          }}
          className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-900 hover:bg-blue-200"
        >
          View Comments
        </button>
      ) : !open ? (
        <label className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer">
          Upload comments
          <input
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".csv,.json"
          />
        </label>
      ) : (
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="text-red-500 hover:text-red-700 flex items-center bg-red-100 hover:bg-red-200 px-2 py-2 rounded-md"
          >
            <CloseIcon fontSize="small" />
          </button>
          <button
            className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-900 hover:bg-blue-200"
            onClick={handleUploadAndNavigate}
          >
            View Comments
          </button>
        </div>
      )}
    </div>
  );
}
