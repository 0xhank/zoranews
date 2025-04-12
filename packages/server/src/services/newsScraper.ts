import axios from "axios";
import crypto from "crypto";
import { XMLParser } from "fast-xml-parser";

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  url: string;
  timestamp: string;
}
/**
 * RSS Feed configuration
 */
interface RssFeed {
  name: string;
  url: string;
  itemPath: string;
  titlePath: string;
  descriptionPath: string;
  linkPath: string;
  datePath?: string;
  categoryPath?: string;
}

/**
 * List of RSS feeds to scrape
 */
const RSS_FEEDS: RssFeed[] = [
  {
    name: "CoinDesk RSS",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    itemPath: "rss.channel.item",
    titlePath: "title",
    descriptionPath: "description",
    linkPath: "link",
    datePath: "pubDate",
    categoryPath: "category",
  },
  {
    name: "NYT Economy",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    itemPath: "rss.channel.item",
    titlePath: "title",
    descriptionPath: "description",
    linkPath: "link",
    datePath: "pubDate",
    categoryPath: "category",
  },
];

// Non-news keywords to filter out
const EXCLUDED_KEYWORDS = [
  "sponsored",
  "press release",
  "partner content",
  "advertisement",
  "promoted",
  "paid content",
  "advertorial",
  "sponsored content",
  "press-release",
  "promotion",
  "partnership",
];

// Categories to exclude
const EXCLUDED_CATEGORIES = [
  "sponsored",
  "press release",
  "press-release",
  "sponsored-content",
  "partner-content",
];

// Helper function to sleep for a random interval
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * News scraper service responsible for fetching and processing news articles
 */
class NewsScraper {
  private articles: NewsArticle[] = [];
  private lastScraped: Date | null = null;
  private isScrapingInProgress = false;
  private seenUrls = new Set<string>();

  constructor() {
    // Scheduler could be implemented here to run scrapes at intervals
  }

  /**
   * Scrape all configured news sources for articles
   */
  async scrapeAll(): Promise<NewsArticle[]> {
    if (this.isScrapingInProgress) {
      return this.articles;
    }

    try {
      this.isScrapingInProgress = true;
      this.seenUrls.clear(); // Reset URL cache for this scrape session

      // Collect articles from all RSS feeds
      const allArticles: NewsArticle[] = [];

      // Try all RSS feeds
      for (const feed of RSS_FEEDS) {
        try {
          // Add random delay between requests to avoid being blocked
          await sleep(Math.random() * 1000 + 500);
          const feedArticles = await this.scrapeRssFeed(feed);
          console.log(
            `Scraped ${feedArticles.length} articles from ${feed.name}`
          );
          allArticles.push(...feedArticles);
        } catch (error) {
          console.error(`Error scraping ${feed.name}:`, error);
        }
      }

      // Process and deduplicate articles
      const deduplicated = this.deduplicateArticles(allArticles);

      // Sort by timestamp (most recent first)
      const sorted = deduplicated.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Update the articles cache
      this.articles = sorted;
      this.lastScraped = new Date();

      return this.articles;
    } finally {
      this.isScrapingInProgress = false;
    }
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
   * Check if article content is news (not sponsored, etc.)
   */
  private isNewsArticle(
    title: string,
    description: string,
    categories: string[] = []
  ): boolean {
    const content = (title + " " + description).toLowerCase();

    // Check for excluded keywords in title or description
    for (const keyword of EXCLUDED_KEYWORDS) {
      if (content.includes(keyword.toLowerCase())) {
        console.log(
          `Filtering out article containing keyword "${keyword}": ${title}`
        );
        return false;
      }
    }

    // Check categories if available
    for (const category of categories) {
      if (
        category &&
        EXCLUDED_CATEGORIES.some((excluded) =>
          category.toLowerCase().includes(excluded)
        )
      ) {
        console.log(
          `Filtering out article with excluded category: ${category}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Check if article is within the 12-hour window
   */
  private isRecentArticle(publishDate: string): boolean {
    try {
      const pubDate = new Date(publishDate);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - pubDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Check if published in the last 12 hours
      const isRecent = hoursDiff <= 12;
      if (!isRecent) {
        console.log(
          `Filtering out older article from ${pubDate.toISOString()}, ${hoursDiff.toFixed(
            1
          )} hours ago`
        );
      }
      return isRecent;
    } catch (error) {
      console.error(`Error parsing date: ${publishDate}`, error);
      return false; // If we can't parse the date, assume it's not recent
    }
  }

  /**
   * Scrape articles from an RSS feed
   */
  private async scrapeRssFeed(feed: RssFeed): Promise<NewsArticle[]> {
    // Fetch the RSS XML content
    console.log(`Fetching RSS from ${feed.url}...`);
    const response = await axios.get(feed.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept: "application/rss+xml,application/xml;q=0.9",
      },
      timeout: 10000,
    });

    // Parse the XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      isArray: (name, jpath) => {
        // Force array for items that might be a single object
        if (jpath.endsWith("item") || jpath.endsWith("category")) {
          return true;
        }
        return false;
      },
    });
    const result = parser.parse(response.data) as Record<string, unknown>;

    // Get items from the feed
    const getNestedProperty = (
      obj: Record<string, unknown>,
      path: string
    ): unknown => {
      const parts = path.split(".");
      let current = obj;
      for (const part of parts) {
        if (!current[part]) return undefined;
        current = current[part] as Record<string, unknown>;
      }
      return current;
    };

    const items = getNestedProperty(result, feed.itemPath) as Record<
      string,
      unknown
    >[];
    if (!items || !Array.isArray(items)) {
      console.log(`No items found in feed: ${feed.name}`);
      return [];
    }

    const articles: NewsArticle[] = [];

    for (const item of items) {
      try {
        const typedItem = item as Record<string, unknown>;

        // Extract data with proper type assertions
        const title = (typedItem[feed.titlePath] as string) || "";
        const description =
          (typedItem[feed.descriptionPath] as string) || title;
        const link = (typedItem[feed.linkPath] as string) || "";
        const pubDate =
          (typedItem[feed.datePath || ""] as string) ||
          new Date().toISOString();

        // Extract categories if available
        let categories: string[] = [];
        if (feed.categoryPath && typedItem[feed.categoryPath]) {
          const categoryData = typedItem[feed.categoryPath];
          if (Array.isArray(categoryData)) {
            categories = categoryData.map((c) =>
              typeof c === "string" ? c : ""
            );
          } else if (typeof categoryData === "string") {
            categories = [categoryData as string];
          }
        }

        if (!title || !link) continue;

        // Filter out non-recent articles
        if (!this.isRecentArticle(pubDate)) {
          continue;
        }

        // Filter out sponsored or non-news content
        if (!this.isNewsArticle(title, description, categories)) {
          continue;
        }

        // Clean up the description (remove HTML tags)
        const cleanDescription = description.replace(/<[^>]*>/g, "").trim();

        // Skip if we've already seen this URL
        if (this.seenUrls.has(link)) {
          console.log(`Duplicate URL ${link}, skipping`);
          continue;
        }

        this.seenUrls.add(link);

        // Generate a UUID for the article ID
        const id = crypto.randomUUID();

        articles.push({
          id,
          headline: title,
          summary: cleanDescription,
          url: link,
          timestamp: new Date(pubDate).toISOString(),
        });
      } catch (error) {
        console.error(`Error processing RSS item:`, error);
      }
    }

    return articles;
  }

  /**
   * Remove duplicate articles (based on similar headlines)
   */
  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    // Group articles by similar content
    const groups: { [key: string]: NewsArticle[] } = {};

    for (const article of articles) {
      // Generate a simplified version of the headline for comparison
      const simplifiedHeadline = article.headline
        .toLowerCase()
        .replace(/[^a-z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Find the best group for this article
      let bestMatch = null;
      let bestScore = 0.4; // Minimum threshold to consider similar

      for (const groupKey in groups) {
        const similarity = this.calculateSimilarity(
          simplifiedHeadline,
          groupKey
        );
        if (similarity > bestScore) {
          bestMatch = groupKey;
          bestScore = similarity;
        }
      }

      if (bestMatch) {
        // Add to existing group
        groups[bestMatch].push(article);
      } else {
        // Create new group
        groups[simplifiedHeadline] = [article];
      }
    }

    // Select the best article from each group
    const uniqueArticles: NewsArticle[] = [];

    for (const groupKey in groups) {
      const group = groups[groupKey];

      // Select the article with the most complete information
      group.sort((a, b) => {
        // Prefer articles with both headline and summary
        const aCompleteness =
          (a.headline.length > 10 ? 2 : 0) + (a.summary.length > 20 ? 1 : 0);
        const bCompleteness =
          (b.headline.length > 10 ? 2 : 0) + (b.summary.length > 20 ? 1 : 0);

        if (aCompleteness !== bCompleteness)
          return bCompleteness - aCompleteness;

        // If equally complete, prefer the newer one
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });

      // Add the best article from this group
      uniqueArticles.push(group[0]);

      // If the group has multiple articles from different sources, add one more
      const sources = new Set(group.map((a) => a.id.split("-")[0]));
      if (sources.size > 1 && group.length > 1) {
        // Find an article from a different source
        for (const article of group) {
          if (article.id.split("-")[0] !== group[0].id.split("-")[0]) {
            uniqueArticles.push(article);
            break;
          }
        }
      }
    }

    return uniqueArticles;
  }

  /**
   * Calculate Jaccard similarity between two strings
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(" "));
    const set2 = new Set(str2.split(" "));

    // Calculate intersection
    const intersection = new Set([...set1].filter((x) => set2.has(x)));

    // Calculate union
    const union = new Set([...set1, ...set2]);

    // Calculate Jaccard similarity
    return intersection.size / union.size;
  }
}

// Export as a singleton instance
export const newsScraper = new NewsScraper();
