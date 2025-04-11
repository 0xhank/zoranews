import { Buffer } from "buffer"; // Import Buffer
import dotenv from "dotenv";
import { beforeAll, describe, expect, it } from "vitest";
import {
  downloadImage,
  generateCoinMetadata,
  generateImageFromHeadline,
} from "../services/openaiService";

// Load environment variables
dotenv.config({ path: ".env" });

describe("OpenAI Service", () => {
  beforeAll(() => {
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY environment variable is not set. Please configure it in your .env file to run these integration tests."
      );
    }
  });

  it("should generate coin metadata from article content", async () => {
    const articleContent =
      "Researchers discover a new species of glowing fungus in the Amazon rainforest. The mushroom emits a faint green light, attracting insects for spore dispersal. It has been named Mycena illuminos.";

    const metadata = await generateCoinMetadata(articleContent);

    expect(metadata).toBeDefined();
    expect(metadata).toHaveProperty("name");
    expect(metadata).toHaveProperty("description");
    expect(typeof metadata.name).toBe("string");
    expect(typeof metadata.description).toBe("string");
    expect(metadata.name.length).toBeGreaterThan(0);
    expect(metadata.name.length).toBeLessThanOrEqual(30); // Check against limit
    expect(metadata.description.length).toBeGreaterThan(0);
    expect(metadata.description.length).toBeLessThanOrEqual(100); // Check against limit
  }, 60000); // Increase timeout for OpenAI API call

  it("should generate an image URL from a headline", async () => {
    const headline = "Robot Dog Wins Local Surfing Competition";

    const imageUrl = await generateImageFromHeadline(headline);

    expect(imageUrl).toBeDefined();
    expect(typeof imageUrl).toBe("string");
    expect(imageUrl).toMatch(/^https?:\/\//); // Check if it looks like a URL
    console.log("Generated Image URL (for manual check):", imageUrl);
  }, 60000); // Increase timeout for DALL-E API call

  it("should download an image from a URL", async () => {
    // First, generate an image URL
    const headline = "Cat Accidentally Elected Mayor of Small Town";
    let imageUrl;
    try {
      imageUrl = await generateImageFromHeadline(headline);
      console.log("Generated Image URL for download test:", imageUrl);
    } catch (error) {
      console.error(
        "Skipping download test as image generation failed:",
        error
      );
      // Explicitly fail the test if image generation fails
      throw new Error("Prerequisite image generation failed");
    }

    // Then, download the image
    const imageBuffer = await downloadImage(imageUrl);

    expect(imageBuffer).toBeDefined();
    expect(imageBuffer).toBeInstanceOf(Buffer);
    expect(imageBuffer.length).toBeGreaterThan(0); // Check if buffer is not empty
    console.log("Downloaded image size:", imageBuffer.length, "bytes");
  }, 90000); // Increase timeout further for both generation and download
});
