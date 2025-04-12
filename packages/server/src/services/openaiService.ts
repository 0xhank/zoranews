import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "OPENAI_API_KEY environment variable not set. OpenAI features will be disabled."
  );
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * Generates coin metadata (name, description) based on news article content.
 * @param articleContent - The content or summary of the news article.
 * @returns A promise resolving to an object containing the generated name and description.
 */
export async function generateCoinMetadata(
  articleContent: string
): Promise<{ name: string; description: string }> {
  if (!openai) {
    throw new Error("OpenAI API key not configured.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or another suitable model
      messages: [
        {
          role: "system",
          content:
            'You are an AI assistant designed to create a catchy social post based on news articles. Given the article content, generate a clear, specific, short, catchy, and relevant title (max 30 chars) and a witty description (max 1000 chars). Format the output as JSON with keys "name" and "description".',
        },
        { role: "user", content: articleContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1200,
    });

    const result = completion.choices[0]?.message?.content;
    console.log("Generated metadata:", result);
    if (!result) {
      throw new Error("Failed to generate metadata from OpenAI.");
    }

    const parsedResult = JSON.parse(result);
    // Basic validation
    if (!parsedResult.name || !parsedResult.description) {
      throw new Error("Invalid metadata format received from OpenAI.");
    }
    if (
      parsedResult.name.length > 30 ||
      parsedResult.description.length > 100
    ) {
      console.warn(
        "OpenAI generated metadata exceeding length limits. Truncating."
      );
      parsedResult.name = parsedResult.name.substring(0, 30);
      parsedResult.description = parsedResult.description.substring(0, 100);
    }

    return parsedResult as { name: string; description: string };
  } catch (error) {
    console.error("Error generating coin metadata with OpenAI:", error);
    throw new Error("Failed to generate coin metadata.");
  }
}

/**
 * Generates an image URL based on a news headline using DALL-E.
 * @param headline - The news headline to visualize.
 * @returns A promise resolving to the URL of the generated image.
 */
export async function generateImageFromHeadline(
  headline: string
): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key not configured.");
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3", // Or dall-e-2 if preferred
      prompt: `Create a visually striking, slightly absurd, meme-style image representing this news headline: "${headline}"`,
      n: 1,
      size: "1024x1024", // Standard size for DALL-E 3
      response_format: "url",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error("Failed to generate image URL from OpenAI.");
    }
    return imageUrl;
  } catch (error) {
    console.error("Error generating image with OpenAI DALL-E:", error);
    throw new Error("Failed to generate image.");
  }
}

/**
 * Downloads image data from a URL.
 * @param url - The URL of the image to download.
 * @returns A promise resolving to the image data as a Buffer.
 */
export async function downloadImage(url: string): Promise<Buffer> {
  try {
    // We need an HTTP client library like axios or node-fetch
    // Let's assume axios is installed or add it
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data, "binary");
  } catch (error) {
    console.error("Error downloading image:", error);
    throw new Error("Failed to download generated image.");
  }
}
