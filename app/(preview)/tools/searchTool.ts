import { z } from "zod";

export const searchTool = {
  description: "Check the scene for latest drops, drama, and who sold out this week",
  parameters: z.object({
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
      .describe("What kind of scene intel are we after?"),
  }),
  execute: async ({ 
    query, 
    search_depth = "basic",
    include_answer = true,
    include_raw_content = false,
    category = "all"
  }: z.infer<typeof searchTool.parameters>) => {
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
          "api-key": apiKey,
        },
        body: JSON.stringify({
          query: enhancedQuery,
          search_depth,
          include_answer,
          include_raw_content,
        }),
      });

      if (!response.ok) {
        throw new Error(`Scene's dead tonight: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        answer: data.answer,
        results: data.results?.map((result: any) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          // Add some punk attitude to the results
          punkCred: Math.floor(Math.random() * 100), // Totally scientific punk credibility score
          selloutFactor: Math.floor(Math.random() * 100), // How mainstream is this info?
        })),
      };
    } catch (error) {
      console.error("Shit's fucked up:", error);
      throw new Error("Scene check failed. Probably because the mainstream media doesn't care about real punk.");
    }
  },
};
