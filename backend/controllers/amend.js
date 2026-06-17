const connectDB = require("../database");
const Amendment = require("../Schemas/report");

const addAmendment = async (req, res) => {
  const { title, aId } = req.body;

  try {
    await connectDB();

    // check separately for unique fields
    let existingTitle = await Amendment.findOne({ title });
    if (existingTitle) {
      return res.status(400).json({ message: "Title already exists" });
    }

    let existingAId = await Amendment.findOne({ aId });
    if (existingAId) {
      return res.status(400).json({ message: "aId already exists" });
    }

    let data = new Amendment({ title, aId });
    await data.save();

    res.status(201).json({ message: "Data added successfully" });
  } catch (e) {
    console.error("Error while adding amendment:", e); // 👈 log actual error
    res.status(500).json({ message: "Error occured", error: e.message });
  }
};


const getAmend = async (req, res) => {
  try {
    await connectDB();

    const val = await Amendment.find().sort({"mlData.lastUpdated":-1});

    res.status(200).json(val || []);
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};


const saveMLResult = async(req,res)=>{
  const {aId} = req.params;
  const  mlResult = req.body;

  try{
    await connectDB();
    const existing = await Amendment.findOne({aId:aId});
    if(!existing){
      return res.status(404).json({error:"No such Ammendment found"})
    }
   // Flatten wordclouds to strings
    const wordclouds = {
      positive: mlResult.wordclouds?.positive?.url || "",
      neutral: mlResult.wordclouds?.neutral?.url || "",
      negative: mlResult.wordclouds?.negative?.url || "",
    };

    // Save the ML data safely
    existing.mlData = {
      ...mlResult,
      wordclouds,          // replace nested objects with strings
      lastUpdated: new Date(),
    };
    await existing.save();
    return res.status(200).json({
      message: "ML Result saved successfully",
      amendment: existing
    });


  }
  catch(e){
    
    console.error("❌ Error in saveMLResult:", e);
  return res.status(500).json({ error: "Error saving ML result", details: e.message });

  }
  
}

const getMlResult = async (req, res) => {
  const { Id } = req.params; // get aId from params

  try {
    await connectDB();
    const result = await Amendment.findOne({ aId: Id });

    if (!result) {
      return res.status(404).json({ message: "Amendment not found" });
    }

    res.status(200).json(result);
  } catch (e) {
    console.error("Error fetching ML result:", e);
    res.status(500).json({ message: e.message });
  }
};



module.exports = { addAmendment, getAmend,saveMLResult,getMlResult };
