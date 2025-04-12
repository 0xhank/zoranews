import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY environment variable not set.");
}

const openai = new OpenAI({ apiKey });

/**
 * Generates coin metadata (name, description) based on news article content.
 * @param articleContent - The content or summary of the news article.
 * @returns A promise resolving to an object containing the generated name and description.
 */
export async function generateCoinMetadata(
  articleContent: string
): Promise<{ name: string; description: string; symbol: string }> {
  if (!openai) {
    throw new Error("OpenAI API key not configured.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or another suitable model
      messages: [
        {
          role: "system",
          content: `You are an AI assistant designed to create elements for a catchy social media post based on news articles or short news snippets. Your goal is to capture the essence and potential market sentiment of the news in a way that's engaging for a 'degen' audience interested in memecoins.

Given the article content or news snippet, generate:
1.  **Symbol:** A short, relevant ticker symbol (3-5 uppercase letters).
2.  **Name:** A clear, specific, short, catchy, and relevant title (max 30 chars).
3.  **Description:** A witty, concise description (max 1000 chars) summarizing the news's core point and potential impact, often with a slightly humorous or exaggerated tone suitable for social media.

Format the output strictly as JSON with keys "symbol", "name", and "description".

---
**Examples of Symbol Outputs:**

*   STBLZ
*   INFL8
*   PEACE
*   JOKE
*   TRFF
*   NODLY
*   BLUFF
---

**Examples of Name Outputs:**

*   FED STABILIZE NOW
*   BLACKROCK INFLATION CALL
*   XI'S TARIFF PEACE
*   CHINA CALLS USA JOKE
*   TRUMP TARIFF TACTICS
*   NO TARIFF DELAY
*   BESSENT'S 2S BLUFF
---

**Examples of Description Outputs:**

*   JUST IN: 🇺🇸 Top Fed official says the Federal Reserve is ready to help stabilize the market if needed.
*   JUST IN: 🇺🇸 BlackRock CEO Larry Fink says there will be much greater inflation in the United States.
*   JUST IN: 🇨🇳 Chinese President Xi Jinping says "there are no winners in tariff wars, going against the world will only lead to self isolation."
*   JUST IN: 🇨🇳🇺🇸 China says the United States is "weaponizing tariffs as a tool of bullying and coercion, turning itself into a joke."
*   JUST IN: Sources close to the Trump White House say they are pressing on with their tariff plan based on this calculation: that the tumult in on Wall Street in stock market, while significant, will not be matched by a similar tumult in the main street economy"
*   JUST IN: White House confirms President Trump "is not considering an extension or delay [of the tariffs]... it's about time we have a president in the Oval Office who is putting the world on notice.
*   JUST IN: U.S. Treasury Secretary Scott Bessent says "I think it was a big mistake, this Chinese escalation, because they are playing with a pair of 2s"
---
`,
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
    if (
      !parsedResult.name ||
      !parsedResult.description ||
      !parsedResult.symbol
    ) {
      throw new Error("Invalid metadata format received from OpenAI.");
    }

    return parsedResult as {
      name: string;
      description: string;
      symbol: string;
    };
  } catch (error) {
    console.error("Error generating coin metadata with OpenAI:", error);
    throw new Error("Failed to generate coin metadata: " + error);
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
