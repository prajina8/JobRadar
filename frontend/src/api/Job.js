const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "Remote" },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    source: {
      type: String,
      required: true,
      enum: ["remoteok", "himalayas", "merojob", "linkedin", "othersource"],
    },
    
    sourceId: { type: String, required: true },
    tags: [{ type: String }],
    salary: { type: String, default: null },
    postedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One job per (source, sourceId) — re-running the aggregator won't duplicate.
jobSchema.index({ source: 1, sourceId: 1 }, { unique: true });

module.exports = mongoose.model("Job", jobSchema);
