import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, Button, Menu, MenuItem, Pagination } from "@mui/material";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// /* ---------- SAMPLE DATA ---------- */
// const commentsData = [
//   {
//     id: 1,
//     name: "John D.",
//     date: "2024-05-10",
//     avatar:
//       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80&auto=format&fit=crop",
//     text: "This amendment is a fantastic step forward for our economy. It promises to create jobs and stimulate growth where it's needed most. I fully support this initiative and believe it will bring significant benefits to our community. It's a well-thought-out plan for a brighter future.",
//   },
//   {
//     id: 2,
//     name: "Sarah K.",
//     date: "2024-05-10",
//     avatar:
//       "https://images.unsplash.com/photo-1545996124-6d6a7a7d0a9b?w=200&q=80&auto=format&fit=crop",
//     text: "I'm thrilled to see such a crucial amendment being passed. The focus on fairness and development is exactly what we need. This is a clear indication that our leaders are listening to the people. This will be a huge benefit for everyone.",
//   },
//   {
//     id: 3,
//     name: "Michael B.",
//     date: "2024-05-09",
//     avatar:
//       "https://images.unsplash.com/photo-1545996126-9d0b50f3f8c7?w=200&q=80&auto=format&fit=crop",
//     text: "Finally, a policy that supports small businesses and encourages local investment. This amendment is important for the future of our state's economy. I strongly believe this will lead to sustainable growth and prosperity.",
//   },
//   {
//     id: 4,
//     name: "Emily R.",
//     date: "2024-05-09",
//     avatar:
//       "https://images.unsplash.com/photo-1545996125-0a8f7b6f3f9f?w=200&q=80&auto=format&fit=crop",
//     text: "This is a major win for our community. The amendment addresses key issues and provides a clear path forward. It's a testament to what can be achieved when we work together. Excellent news!",
//   },
// ];

/* ---------- SMALL SUB-COMPONENTS ---------- */
function Header({ total, sentiment }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
        {sentiment === "positive" && "Positive Comments"}
        {sentiment === "negative" && "Negative Comments"}
        {sentiment === "neutral" && "Neutral Comments"}
      </h1>
      <p className="text-base text-gray-500">
        Showing {total} comments expressing {sentiment} sentiment.
      </p>
    </div>
  );
}

function CommentCard({ c }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.22 }}
      className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            alt={c.Author}
            src="https://images.unsplash.com/photo-1545996126-9d0b50f3f8c7?w=200&q=80&auto=format&fit=crop"
            sx={{ width: 44, height: 44 }}
            className="!rounded-full"
          />
          <div>
            <p className="font-bold text-gray-900 ">{c.Author}</p>
            <p className="text-sm text-gray-500">Posted on: {c.Date}</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm sm:text-base text-gray-700">{c.tweet}</p>
    </motion.div>
  );
}

/* ---------- MAIN DASHBOARD ---------- */
export default function CommentsDashboard({ sentiment, data }) {
  const comments = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    if (sentiment === "positive") {
      return data.filter((c) => c.label === "2" || c.label === 2);
    }
    if (sentiment === "negative") {
      return data.filter((c) => c.label === "0" || c.label === 0);
    }
    if (sentiment === "neutral") {
      return data.filter((c) => c.label === "1" || c.label === 1);
    }
    return [];
  }, [data, sentiment]);
  console.log("The data is ",data)
  const [anchorFilter, setAnchorFilter] = useState(null);
  const [anchorSort, setAnchorSort] = useState(null);

  const [page, setPage] = useState(1);

  const pageSize = 4;

  const positiveComments = data.filter((c) => c.label === "2" || c.label === 2);
  const negativeComments = data.filter((c) => c.label === "0" || c.label === 0);
  const neutralComments = data.filter((c) => c.label === "1" || c.label === 1);



  const totalPages = Math.max(1, Math.ceil(comments.length / pageSize));

  const visibleComments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return comments.slice(start, start + pageSize);
  }, [comments, page]);

  return (
    <main
      className="flex-1 px-6 py-8 bg-gray-50 min-h-full overflow-y-auto"
      style={{ fontFamily: "'Public Sans', 'Noto Sans', sans-serif" }}
    >
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <Header total={comments.length || "—"} sentiment={sentiment} />

        {/* Comments list */}
        <div className="grid grid-cols-1 gap-6">
          {visibleComments.map((c) => (
            <CommentCard key={c.id} c={c} />
          ))}
        </div>
        {/* {sentiment==="Positive" &&  <div className="grid grid-cols-1 gap-6">
          {positiveComments.map((c) => (
            <CommentCard key={c.id} c={c} />
          ))}
        </div>} */}

        {/* Pagination */}
        <nav className="flex items-center justify-between pt-4">
          <div>
            <Button
              variant="outlined"
              startIcon={<FiChevronLeft />}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
              size="small"
            />
          </div>
          <div>
            <Button
              variant="outlined"
              endIcon={<FiChevronRight />}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </nav>
      </div>
    </main>
  );
}
