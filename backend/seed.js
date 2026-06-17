require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./database');
const Amendment = require('./Schemas/report');

const sampleAmendments = [
  {
    aId: "A-101",
    title: "Companies Act Amendment 2025 (Section 135 - CSR compliance)",
    mlData: {
      output_csv: "/outputs/A-101/predicted_comments.csv",
      sentiment_counts: {
        positive: 150,
        neutral: 85,
        negative: 45
      },
      summaries: {
        positive: "Most stakeholders appreciate the streamlined digital compliance framework, stating that it reduces administrative friction and simplifies filing processes.",
        neutral: "Some respondents recommend providing clearer definitions and guidelines on documentation requirements, expressing a wait-and-see attitude.",
        negative: "A few small businesses raised concerns regarding compliance costs and tight deadlines, urging for extra transitional relief."
      },
      wordclouds: {
        positive: "/outputs/A-101/positive_wc.png",
        neutral: "/outputs/A-101/neutral_wc.png",
        negative: "/outputs/A-101/negative_wc.png"
      },
      lastUpdated: new Date()
    }
  },
  {
    aId: "A-102",
    title: "Digital India Act Consultation (Feedback on intermediary liability)",
    mlData: {
      output_csv: "",
      sentiment_counts: {
        positive: 0,
        neutral: 0,
        negative: 0
      },
      summaries: {
        positive: "",
        neutral: "",
        negative: ""
      },
      wordclouds: {
        positive: "",
        neutral: "",
        negative: ""
      },
      lastUpdated: new Date()
    }
  }
];

async function seed() {
  try {
    // Wait a brief moment to ensure DB connection is ready
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Cleaning existing amendments...");
    await Amendment.deleteMany({});

    console.log("Seeding sample amendments...");
    await Amendment.insertMany(sampleAmendments);
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seed();
