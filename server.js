
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
  try {
    const { topic, style, platform } = req.body ?? {};

    if (typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({
        error: "Please provide a topic."
      });
    }

    if (topic.trim().length > 300) {
      return res.status(400).json({
        error: "Topic must be 300 characters or less."
      });
    }

    const selectedStyle =
      typeof style === "string" && style.trim()
        ? style.trim().slice(0, 100)
        : "Cinematic";

    const selectedPlatform =
      typeof platform === "string" && platform.trim()
        ? platform.trim().slice(0, 100)
        : "Instagram Reels";

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "AI service is not configured."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Daily Video AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "You are an expert AI video prompt engineer. Create detailed, production-ready video prompts. Include subject, scene, action, camera movements, lighting, composition, atmosphere, realistic motion, and useful negative constraints. Match the requested style and platform. Use 9:16 for vertical short videos unless another ratio is requested. Return only the finished prompt."
            },
            {
              role: "user",
              content:
                `Topic: ${topic.trim()}\n` +
                `Style: ${selectedStyle}\n` +
                `Platform: ${selectedPlatform}\n` +
                "Create a detailed, original AI video prompt."
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenRouter error:",
        response.status,
        JSON.stringify(data).slice(0, 1000)
      );

      return res.status(502).json({
        error: "AI request failed. Check API key, credits, and model availability."
      });
    }

    const prompt = data.choices?.[0]?.message?.content;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(502).json({
        error: "AI returned an empty prompt."
      });
    }

    return res.json({
      success: true,
      topic: topic.trim(),
      style: selectedStyle,
      platform: selectedPlatform,
      prompt: prompt.trim()
    });
  } catch (error) {
    console.error("Generation error:", error.message);

    return res.status(500).json({
      error: "Unexpected server error."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Daily Video AI backend running on port ${PORT}`);
});
