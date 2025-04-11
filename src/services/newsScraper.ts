import { NewsArticle } from "@zora-news/shared";
import axios from "axios";
import * as cheerio from "cheerio";

/**
 * News source configuration
 */
interface NewsSource {
  name: string;
  url: string;
  articleSelector: string;
  headlineSelector: string;
  summarySelector: string;
  linkSelector: string;
  viralIndicators?: {
    selector: string;
    minValue?: number;
    isNumber?: boolean;
  }[];
}

/**
 * List of news sources to scrape
 */
const NEWS_SOURCES: NewsSource[] = [
  {
    name: "CryptoPanic",
    url: "https://cryptopanic.com/",
    articleSelector: ".list-item",
    headlineSelector: ".detail-title a",
    summarySelector: ".detail-text",
    linkSelector: ".detail-title a",
    viralIndicators: [
      {
        selector: ".score-container span",
        minValue: 15,
        isNumber: true,
      },
    ],
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/",
    articleSelector: "article.list-item",
    headlineSelector: "h2 a",
    summarySelector: ".media-content p",
    linkSelector: "h2 a",
    viralIndicators: [
      {
        selector: ".share-count",
        minValue: 10,
        isNumber: true,
      },
    ],
  },
  {
    name: "CoinTelegraph",
    url: "https://cointelegraph.com/",
    articleSelector: "article",
    headlineSelector: "h2 a",
    summarySelector: ".post-card-inline__text",
    linkSelector: "h2 a",
    viralIndicators: [
      {
        selector: ".post-actions__item--comments span",
        minValue: 5,
        isNumber: true,
      },
    ],
  },
];

/**
 * News scraper service
 */
export class NewsScraper {
  private articles: NewsArticle[] = [];
  private lastScraped: Date | null = null;

  /**
   * Scrape all configured news sources
   */
  async scrapeAll(): Promise<NewsArticle[]> {
    console.log("Starting to scrape news sources...");

    const allArticles: NewsArticle[] = [];

    for (const source of NEWS_SOURCES) {
      try {
        const articles = await this.scrapeSource(source);
        allArticles.push(...articles);
        console.log(`Scraped ${articles.length} articles from ${source.name}`);
      } catch (error) {
        console.error(`Error scraping ${source.name}:`, error);
      }
    }

    // Sort by timestamp (most recent first) and deduplicate
    this.articles = this.deduplicateArticles(allArticles).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    this.lastScraped = new Date();
    console.log(
      `Completed scraping. Found ${this.articles.length} unique articles.`
    );

    return this.articles;
  }

  /**
   * Get all scraped articles
   */
  getArticles(): NewsArticle[] {
    return this.articles;
  }

  /**
   * Get a specific article by ID
   */
  getArticleById(id: string): NewsArticle | undefined {
    return this.articles.find((article) => article.id === id);
  }

  /**
   * Search articles by query
   */
  searchArticles(query: string): NewsArticle[] {
    const lowercaseQuery = query.toLowerCase();
    return this.articles.filter(
      (article) =>
        article.headline.toLowerCase().includes(lowercaseQuery) ||
        article.summary.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get the last time articles were scraped
   */
  getLastScraped(): Date | null {
    return this.lastScraped;
  }

  /**
   * Scrape a specific news source
   */
  private async scrapeSource(source: NewsSource): Promise<NewsArticle[]> {
    // Fetch the HTML content
    const response = await axios.get(source.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Load HTML content into Cheerio
    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Find all article elements
    $(source.articleSelector).each((index, element) => {
      try {
        // Extract article details
        const headline = $(element).find(source.headlineSelector).text().trim();
        const summary =
          $(element).find(source.summarySelector).text().trim() ||
          `This is a trending article from ${source.name}`;

        // Get the URL
        let url = $(element).find(source.linkSelector).attr("href") || "";
        if (url && !url.startsWith("http")) {
          // Handle relative URLs
          url = new URL(url, source.url).toString();
        }

        // Skip if no headline or URL
        if (!headline || !url) return;

        // Check viral indicators if defined
        let isViral = true;
        if (source.viralIndicators && source.viralIndicators.length > 0) {
          isViral = source.viralIndicators.some((indicator) => {
            const value = $(element).find(indicator.selector).text().trim();

            if (indicator.isNumber) {
              // Extract numbers from text (e.g., "15 comments" -> 15)
              const numValue = parseInt(value.replace(/[^0-9]/g, ""));
              return (
                !isNaN(numValue) &&
                (!indicator.minValue || numValue >= indicator.minValue)
              );
            } else {
              // Check if the element exists and has content
              return !!value;
            }
          });
        }

        // Only add viral/engaging content
        if (isViral) {
          const id = `${source.name.toLowerCase()}-${Buffer.from(url)
            .toString("base64")
            .substring(0, 10)}`;

          articles.push({
            id,
            headline,
            summary,
            url,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error processing article:", error);
      }
    });

    return articles;
  }

  /**
   * Remove duplicate articles (based on similar headlines)
   */
  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const uniqueArticles: NewsArticle[] = [];
    const headlinePhrases = new Set<string>();

    for (const article of articles) {
      // Generate a simplified version of the headline for comparison
      const simplifiedHeadline = article.headline
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Check if we've seen a similar headline
      let isDuplicate = false;
      for (const phrase of headlinePhrases) {
        // Check for significant overlap (more than 70% similar)
        if (this.calculateSimilarity(simplifiedHeadline, phrase) > 0.7) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        headlinePhrases.add(simplifiedHeadline);
        uniqueArticles.push(article);
      }
    }

    return uniqueArticles;
  }

  /**
   * Calculate similarity between two strings (simple Jaccard similarity)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(" "));
    const words2 = new Set(str2.split(" "));

    // Calculate intersection
    const intersection = new Set([...words1].filter((x) => words2.has(x)));

    // Calculate union
    const union = new Set([...words1, ...words2]);

    // Jaccard similarity
    return intersection.size / union.size;
  }
}

// Create a singleton instance
export const newsScraper = new NewsScraper();
