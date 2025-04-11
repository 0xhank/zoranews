import { newsScraper } from "./services/newsScraper";

async function testScraper() {
  console.log("Starting scraper test...");

  try {
    const articles = await newsScraper.scrapeAll();
    console.log(`Successfully scraped ${articles.length} articles`);

    if (articles.length > 0) {
      console.log("\nFirst 3 articles:");
      articles.slice(0, 3).forEach((article, index) => {
        console.log(`\n--- Article ${index + 1} ---`);
        console.log(`Headline: ${article.headline}`);
        console.log(`Summary: ${article.summary}`);
        console.log(`URL: ${article.url}`);
      });
    }
  } catch (error) {
    console.error("Error testing scraper:", error);
  }
}

testScraper();
