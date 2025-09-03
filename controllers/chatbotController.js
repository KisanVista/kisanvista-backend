const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handleChatbot = async (req, res) => {
  try {
    let userMessage = req.body.message || "";
    let parts = [];

    // If file is uploaded
    if (req.file) {
      // Handle image
      if (req.file.mimetype.startsWith("image/")) {
        const imageBase64 = req.file.buffer.toString("base64");
        parts.push({
          inlineData: {
            mimeType: req.file.mimetype,
            data: imageBase64,
          },
        });
      }
      // Handle PDF
      else if (req.file.mimetype === "application/pdf") {
        const PDFParser = (await import("pdf2json")).default;
        const pdfParser = new PDFParser();
        const pdfText = await new Promise((resolve, reject) => {
          pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            const text = pdfData.Pages.map((page) =>
              page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" ")
            ).join("\n");
            resolve(text);
          });
          pdfParser.parseBuffer(req.file.buffer);
        });
        userMessage += "\n\n" + pdfText;
      }
      // Handle DOCX
      else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const fs = require("fs");
        const path = require("path");
      } else {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        return res.status(400).json({ error: "Unsupported file type" });
      }
    }

    // Always add the user message as text part
    parts.unshift({ text: userMessage });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    res.json({ answer: result.response.text() });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Failed to get response from AI." });
  }
};