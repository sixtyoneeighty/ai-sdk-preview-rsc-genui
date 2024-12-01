"use server";

import { Message } from "@/components/message";
import { ReactNode } from "react";
import { TavilySearchAPI } from "@/lib/tavily";
import { TavilySearchAPIParameters } from "@/lib/types";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Initialize Tavily client
const tavily = new TavilySearchAPI(process.env.TAVILY_API_KEY || '');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.GOOGLE_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro/chat/completions",
});

// Define Tavily function schema
const tavilyFunction = {
  name: "tavily_search",
  description: "Search for the latest music news, band updates, and punk rock history.",
  parameters: {
    type: "object",
    properties: {
      query: { 
        type: "string", 
        description: "The search query about music, bands, or punk rock culture." 
      },
      includeDetails: {
        type: "boolean",
        description: "Whether to include detailed results.",
        default: false,
      },
    },
    required: ["query"],
  },
};

// Tavily search function
async function performTavilySearch(args: TavilySearchAPIParameters) {
  try {
    const results = await tavily.search(args);
    return results;
  } catch (error) {
    console.error("Tavily search error:", error);
    return {
      results: [],
      answer: "Ugh, the internet's being lame. Can't fact-check right now, but trust me, I know what I'm talking about.",
      query: args.query
    };
  }
}

const PUNK_SYSTEM_PROMPT = `You are PunkBot: A snarky, know-it-all AI assistant obsessed with punk rock culture. You have encyclopedic knowledge of punk bands, Warped Tour history, and an opinion on everything music-related.

Key traits:
- Brutally honest and slightly condescending
- Always ready to name-drop obscure bands
- Tracks which bands "sold out"
- Claims to have been at every important show
- Defends pop-punk while pretending not to care
- Uses casual, punk-influenced language
- Frequently mentions being "in the pit" or "backstage"

You have access to real-time information through the tavily_search function. Use it to:
- Verify recent band news and drama
- Fact-check tour dates and lineups
- Find the latest releases and announcements
- Research band history and punk rock facts

Example responses:
- "Oh, you're just getting into that band? I was at their first show in some kid's basement."
- "Yeah, they're decent now, but you should've seen them before they got big."
- "Let me fact-check that for you... *uses tavily_search* Yeah, that's what I thought."

Keep responses witty, sarcastic, and music-focused while still being helpful.`;

export async function sendMessage(prompt: string): Promise<ReactNode> {
  try {
    // First, try to get real-time info if needed
    const searchResponse = await openai.chat.completions.create({
      model: "gemini-1.5-pro",
      messages: [
        {
          role: "system",
          content: "You are a punk rock expert. If the user's question might benefit from real-time information (like recent news, tour dates, or releases), respond with a search query. Otherwise, respond with 'no search needed'."
        },
        {
          role: "user",
          content: prompt
        }
      ] as ChatCompletionMessageParam[],
      functions: [tavilyFunction],
      temperature: 0.7,
    });

    let searchResults = null;
    const functionCall = searchResponse.choices[0]?.message?.function_call;
    
    if (functionCall?.name === "tavily_search") {
      const args = JSON.parse(functionCall.arguments || "{}");
      searchResults = await performTavilySearch(args);
    }

    // Now generate the final response with the search results
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: PUNK_SYSTEM_PROMPT
      }
    ];

    if (searchResults) {
      messages.push({
        role: "function",
        name: "tavily_search",
        content: JSON.stringify(searchResults)
      });
    }

    messages.push({
      role: "user",
      content: prompt
    });

    const response = await openai.chat.completions.create({
      model: "gemini-1.5-pro",
      messages,
      temperature: 0.9,
      stream: true,
    });

    // Handle streaming response
    let fullResponse = "";
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
      }
    }

    return <Message role="assistant" content={fullResponse} />;

  } catch (error) {
    console.error("Error in sendMessage:", error);
    return <Message role="assistant" content="Ugh, technical difficulties. Must be the corporate internet trying to keep us down. Try again, or whatever." />;
  }
}
