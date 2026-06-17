const mongoose = require('mongoose');

const AmendmentSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // Amendment title
  aId: { type: String, required: true, unique: true },   // Amendment ID

  mlData: {
    output_csv: { type: String, default: "" }, // Path or CSV string

    sentiment_counts: {
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      positive: { type: Number, default: 0 },
    },

    summaries: {
      negative: { type: String, default: "" },
      neutral: { type: String, default: "" },
      positive: { type: String, default: "" },
    },

    wordclouds: {
      negative: { type: String, default: "" }, // Store only URL string
      neutral: { type: String, default: "" },
      positive: { type: String, default: "" },
    },

    lastUpdated: { type: Date, default: Date.now },
  },
},
{
  timestamps: true, // automatically adds createdAt and updatedAt fields
});



const Amndement = mongoose.model("Amendment",AmendmentSchema);
module.exports= Amndement;