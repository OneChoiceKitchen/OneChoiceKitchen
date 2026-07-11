// OpenAI service stub
// Install the OpenAI npm package first (`npm i openai`).
import { OpenAI } from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateText(prompt: string) {
  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0].message.content;
}
