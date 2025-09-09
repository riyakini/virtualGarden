const express = require("express");
const router = express.Router();

// Mock database of herbs
// Mock herbal DB
const herbsDB = [
  { name: "Turmeric", benefit: "Helps with inflammation, joint pain, and boosts immunity", conditions: ["inflammation", "joint pain", "arthritis", "cold", "wound"] },
  { name: "Ginger", benefit: "Good for nausea, digestion, sore throat, and improves circulation", conditions: ["nausea", "digestion", "sore throat", "cold", "vomiting"] },
  { name: "Tulsi (Holy Basil)", benefit: "Supports immunity, cough, stress relief, and fever reduction", conditions: ["cough", "stress", "cold", "flu", "fever"] },
  { name: "Aloe Vera", benefit: "Heals skin issues, burns, and supports digestion", conditions: ["skin", "burn", "acne", "constipation", "digestion"] },
  { name: "Neem", benefit: "Purifies blood, treats acne, and boosts skin health", conditions: ["skin", "acne", "eczema", "infection"] },
  { name: "Ashwagandha", benefit: "Reduces stress, improves sleep, and boosts energy", conditions: ["stress", "anxiety", "fatigue", "insomnia"] },
  { name: "Peppermint", benefit: "Relieves headaches, improves digestion, and eases nausea", conditions: ["headache", "migraine", "digestion", "nausea"] },
  { name: "Cinnamon", benefit: "Controls blood sugar, improves digestion, and reduces inflammation", conditions: ["diabetes", "digestion", "cold", "inflammation"] },
  { name: "Fenugreek", benefit: "Helps with diabetes, boosts lactation, and improves digestion", conditions: ["diabetes", "digestion", "lactation", "cholesterol"] },
  { name: "Garlic", benefit: "Boosts heart health, reduces cholesterol, and fights infection", conditions: ["cholesterol", "blood pressure", "heart", "infection", "cold"] },
  { name: "Coriander", benefit: "Improves digestion, detoxifies body, and helps with urinary infections", conditions: ["digestion", "urinary", "detox"] },
  { name: "Mint", benefit: "Relieves indigestion, nausea, and headaches", conditions: ["digestion", "nausea", "headache", "cold"] },
  { name: "Lemon", benefit: "Rich in Vitamin C, boosts immunity, and helps with sore throat", conditions: ["immunity", "sore throat", "cold", "flu"] },
  { name: "Giloy (Amruthaballi)", benefit: "Boosts immunity, reduces fever, and fights infections", conditions: ["fever", "cold", "flu", "immunity"] },
  { name: "Shankhapushpi", benefit: "Improves memory, concentration, and reduces stress", conditions: ["memory", "concentration", "stress", "anxiety"] },
  { name: "Brahmi", benefit: "Boosts brain function, reduces anxiety, and improves sleep", conditions: ["memory", "concentration", "anxiety", "insomnia"] },
  { name: "Hibiscus", benefit: "Good for hair, controls blood pressure, and improves heart health", conditions: ["hair", "blood pressure", "heart"] },
  { name: "Curry Leaves", benefit: "Improves digestion, controls diabetes, and strengthens hair", conditions: ["digestion", "diabetes", "hair"] },
  { name: "Jasmine", benefit: "Reduces stress, improves mood, and helps with headaches", conditions: ["stress", "headache", "anxiety", "mood"] },
  { name: "Guava Leaves", benefit: "Controls diabetes, improves digestion, and helps with diarrhea", conditions: ["diabetes", "digestion", "diarrhea"] },
  { name: "Papaya Leaves", benefit: "Boosts platelets, fights dengue, and supports liver health", conditions: ["dengue", "platelets", "liver"] },
  { name: "Amla (Indian Gooseberry)", benefit: "Boosts immunity, improves eyesight, and controls cholesterol", conditions: ["immunity", "eyes", "cholesterol", "diabetes"] },
];


// AI helper with mock fallback
// AI helper using Groq API
async function askAI(symptom) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("❌ Missing Groq API Key");

  console.log("🔑 Using Groq API Key:", apiKey.slice(0, 8) + "...");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant", // Updated model ID
      messages: [
        { role: "system", content: "You are an Ayurvedic herbal advisor. Suggest medicinal plants for a user’s symptoms." },
        { role: "user", content: `Suggest 3 herbs for symptom: ${symptom}. Include herb name and short benefit.` }
      ],
      max_tokens: 200
    })
  });

  const data = await response.json();
  console.log("📡 Groq raw response:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data.error?.message || "Groq API request failed");
  }

  return data.choices[0].message.content;
}


// API route
router.post("/health", async (req, res) => {
  const { symptom } = req.body;
  if (!symptom) return res.status(400).json({ error: "No symptom provided" });

  // 1. Try matching with DB
  const results = herbsDB.filter(herb =>
    herb.conditions.some(c => symptom.toLowerCase().includes(c))
  );

  if (results.length > 0) {
    return res.json({ herbs: results });
  }

  // 2. Fallback to AI (Groq)
  try {
    const aiResponse = await askAI(symptom);
    res.json({
      herbs: [{ name: "AI Recommendation", benefit: aiResponse }]
    });
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    res.status(500).json({ error: "AI service failed", details: err.message });
  }
});

module.exports = router;