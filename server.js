import express from "express";

const app = express();
app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.json({
    app: "Daily Video AI",
    status: "online"
  });
});

app.post("/api/generate", async (req, res) => {
  const { topic, style, platform } = req.body ?? {};

  if (typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({
      error: "Please provide a topic."
    });
  }

  if (topic.length > 300) {
    return res.status(400).json({
      error: "Topic must be 300 characters or less."
    });
  }

  res.json({
    success: true,
    topic: topic.trim(),
    style: typeof style === "string" ? style : "Cinematic",
    platform: typeof platform === "string" ? platform : "Instagram Reels",
    prompt: `Create a high-quality ${typeof style === "string" ? style : "Cinematic"} video about ${topic.trim()}. Optimize for ${typeof platform === "string" ? platform : "Instagram Reels"}. Include detailed visual direction, camera movements, lighting, composition, and realistic motion.`
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Daily Video AI backend running on port ${PORT}`);
});
