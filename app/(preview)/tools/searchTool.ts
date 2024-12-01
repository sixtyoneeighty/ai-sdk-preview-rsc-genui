import { z } from "zod";

// Define the search parameters schema
export const searchParameters = z.object({
  query: z.string().describe("What's the latest scene drama or release you need to verify?"),
  search_depth: z.enum(["basic", "advanced"])
    .optional()
    .default("basic")
    .describe("How deep in the scene archives should we dig?"),
  include_answer: z.boolean()
    .optional()
    .default(true)
    .describe("Want PunkBot's hot take on this?"),
  include_raw_content: z.boolean()
    .optional()
    .default(false)
    .describe("Include the full scene report?"),
  category: z.enum([
    "news",
    "releases",
    "tours",
    "drama",
    "all"
  ])
    .optional()
    .default("all")
    .describe("What kind of scene info are you looking for?")
});

// Define the tool interface
export type SearchToolArgs = z.infer<typeof searchParameters>;

// Define the search function separately
export async function executeSearch(args: SearchToolArgs) {
  const { 
    query, 
    search_depth = "basic",
    include_answer = true,
    include_raw_content = false,
    category = "all"
  } = args;

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("Dude, where's your API key? Can't check the scene without backstage access!");
  }

  // Enhance query based on category
  let enhancedQuery = query;
  if (category !== "all") {
    enhancedQuery += ` ${category} punk rock music scene latest`;
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        query: enhancedQuery,
        search_depth: search_depth === "advanced" ? "advanced" : "basic",
        include_answer,
        include_raw_content
      })
    });

    if (!response.ok) {
      throw new Error("Scene's dead tonight. Try again later.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Search failed:", error);
    throw new Error("Couldn't get the scene report. The underground's gone dark.");
  }
}

// Export the tool definition without execute
export const searchTool = {
  description: "Check the scene for latest drops, drama, and who sold out this week",
  parameters: searchParameters,
  execute: executeSearch
};
