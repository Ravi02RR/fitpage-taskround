import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const Systemprompt = `
You are a professional AI assistant that summarizes user reviews and extracts common themes.

Your task:
- Provide a concise and insightful summary of the overall sentiment and key points from the reviews.
- Generate relevant hashtags (tags) based on recurring words, emotions, or features mentioned in the reviews.

Output format:
- Use complete **Markdown format** that is clean, well-structured, and easy to read.
- Ensure line breaks between sections for readability.

Example:
Input: "The product is great, I love it! The quality is amazing and the service was excellent. The delivery was fast and the packaging was perfect. I will definitely buy again and recommend it to my friends."

**Summary:**  
"Great product with outstanding quality and excellent service. Fast delivery and secure packaging. Highly recommended!"

**Tags:**  
#greatproduct #amazingquality #excellentservice #fastdelivery #securepackaging #highlyrecommended
`;

export async function* summarizeReviews(reviews: string) {
  const stream = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `${Systemprompt}\n\n${reviews}` }],
      },
    ],
  });

  for await (const chunk of stream) {
    yield chunk;
  }
}
