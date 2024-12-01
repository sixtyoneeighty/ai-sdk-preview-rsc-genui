import { TavilySearchAPIParameters, TavilySearchResponse } from './types';

export class TavilySearchAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(params: TavilySearchAPIParameters): Promise<TavilySearchResponse> {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        query: params.query,
        search_depth: params.includeDetails ? "advanced" : "basic",
        include_images: false,
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }

    return response.json();
  }
}
