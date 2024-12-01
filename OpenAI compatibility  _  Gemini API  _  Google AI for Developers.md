11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

> OpenAI compatibility
>
> Gemini models are accessible using the OpenAI libraries (Python and
> TypeScript / Javascript) along with the REST API, by updating three
> lines of code and using your [<u>Gemini API
> key</u>](https://aistudio.google.com/apikey)
>
> [(https://aistudio.google.com/apikey)](https://aistudio.google.com/apikey).
> If you aren't already using the OpenAI libraries, we recommend that
> you call the [<u>Gemini API directl</u>y
> (https://ai.google.dev/gemini-api/docs/quickstart)](https://ai.google.dev/gemini-api/docs/quickstart).
>
> <u>Python</u> (#python)<u>Node.jsREST</u> (#rest) (#node.js)
>
> import OpenAI from "openai";
>
> const openai = new OpenAI({ apiKey: "GEMINI_API_KEY",
>
> baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
> });
>
> const response = await openai.chat.completions.create({ model:
> "gemini-1.5-flash",
>
> messages: \[
>
> { role: "system", content: "You are a helpful assistant." }, {
>
> role: "user",
>
> content: "Explain to me how AI works", },
>
> \], });
>
> console.log(response.choices\[0\].message);
>
> Streaming
>
> The Gemini API supports [<u>streaming
> responses</u>](https://ai.google.dev/gemini-api/docs/text-generation?lang=python#generate-a-text-stream)
>
> [(/gemini-api/docs/text-generation?lang=python#generate-a-text-stream).](https://ai.google.dev/gemini-api/docs/text-generation?lang=python#generate-a-text-stream)
>
> Python (#python)<u>Node.jsREST</u> (#rest) (#node.js)

https://ai.google.dev/gemini-api/docs/openai 1/7

11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

> import OpenAI from "openai";
>
> const openai = new OpenAI({ apiKey: "GEMINI_API_KEY",
>
> baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
> });
>
> async function main() {
>
> const completion = await openai.chat.completions.create({ model:
> "gemini-1.5-flash",
>
> messages: \[
>
> {"role": "system", "content": "You are a helpful assistant."},
> {"role": "user", "content": "Hello!"}
>
> \],
>
> stream: true, });
>
> for await (const chunk of completion) {
> console.log(chunk.choices\[0\].delta.content);
>
> } }
>
> main();
>
> Function calling
>
> Function calling makes it easier for you to get structured data
> outputs from generative models and is [<u>supported in the Gemini
> API</u>
> (/gemini-api/docs/function-calling/tutorial)](https://ai.google.dev/gemini-api/docs/function-calling/tutorial).
>
> Python (#python)<u>Node.jsREST</u> (#rest) (#node.js)
>
> import OpenAI from "openai";
>
> const openai = new OpenAI({ apiKey: "GEMINI_API_KEY",
>
> baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
> });

https://ai.google.dev/gemini-api/docs/openai 2/7

11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

> async function main() {
>
> const messages = \[{"role": "user", "content": "What's the weather
> like in const tools = \[
>
> {
>
> "type": "function", "function": {
>
> "name": "get_weather",
>
> "description": "Get the weather in a given location", "parameters": {
>
> "type": "object", "properties": {
>
> "location": { "type": "string",
>
> "description": "The city and state, e.g. Chicago, IL", },
>
> "unit": {"type": "string", "enum": \["celsius", "fahrenheit"\] },
>
> "required": \["location"\], },
>
> } }
>
> \];
>
> const response = await openai.chat.completions.create({ model:
> "gemini-1.5-flash",
>
> messages: messages, tools: tools, tool_choice: "auto",
>
> });
>
> console.log(response); }
>
> main();
>
> Image understanding
>
> Gemini models are natively multimodal and provide best in class
> performance on
> [<u>man</u>y](https://ai.google.dev/gemini-api/docs/vision) [<u>common
> vision tasks</u>
> (/gemini-api/docs/vision).](https://ai.google.dev/gemini-api/docs/vision)

https://ai.google.dev/gemini-api/docs/openai 3/7

11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

||
||
||
||

https://ai.google.dev/gemini-api/docs/openai 4/7

11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

> messages: messages, });
>
> console.log(response.choices\[0\]); } catch (error) {
>
> console.error("Error calling Gemini API:", error); }
>
> }
>
> main();
>
> Structured output
>
> Gemini models can output JSON objects in any [<u>structure</u> y<u>ou
> de ne</u>](https://ai.google.dev/gemini-api/docs/structured-output)
> [(/gemini-api/docs/structured-output).](https://ai.google.dev/gemini-api/docs/structured-output)
>
> Python (#python)<u>Node.js</u> (#node.js)
>
> import OpenAI from "openai";
>
> import { zodResponseFormat } from "openai/helpers/zod"; import { z }
> from "zod";
>
> const openai = new OpenAI({ apiKey: "GEMINI_API_KEY",
>
> baseURL: "https://generativelanguage.googleapis.com/v1beta/openai" });
>
> const CalendarEvent = z.object({ name: z.string(),
>
> date: z.string(),
>
> participants: z.array(z.string()), });
>
> const completion = await openai.beta.chat.completions.parse({ model:
> "gemini-1.5-flash",
>
> messages: \[
>
> { role: "system", content: "Extract the event information." },
>
> { role: "user", content: "John and Susan are going to an AI conference
> \],

https://ai.google.dev/gemini-api/docs/openai 5/7

11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

> response_format: zodResponseFormat(CalendarEvent, "event"), });
>
> const event = completion.choices\[0\].message.parsed;
> console.log(event);
>
> Embeddings
>
> Text embeddings measure the relatedness of text strings and can be
> generated using the
> [<u>the</u>](https://ai.google.dev/gemini-api/docs/embeddings)
> [<u>Gemini API</u>
> (/gemini-api/docs/embeddings)](https://ai.google.dev/gemini-api/docs/embeddings).
>
> <u>Python</u> (#python)<u>Node.jsREST</u> (#rest) (#node.js)
>
> import OpenAI from "openai";
>
> const openai = new OpenAI({ apiKey: "GEMINI_API_KEY",
>
> baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
> });
>
> async function main() {
>
> const embedding = await openai.embeddings.create({ model:
> "text-embedding-004",
>
> input: "Your text string goes here", });
>
> console.log(embedding); }
>
> main();
>
> Current limitations
>
> Support for the OpenAI libraries is still in beta while we extend
> feature support.

https://ai.google.dev/gemini-api/docs/openai 6/7

11/30/24, 8:59 PM OpenAI compatibility \| GeminiAPI \| GoogleAI for
Developers

> If you have questions about supported parameters, upcoming features,
> or run into any issues getting started with Gemini, join our
> [<u>Developer Forum</u>
> (https://discuss.ai.google.dev/c/gemini-api/4)](https://discuss.ai.google.dev/c/gemini-api/4).
>
> Except as otherwise noted, the content of this page is licensed under
> the [<u>Creative Commons Attribution 4.0
> License</u>](https://creativecommons.org/licenses/by/4.0/)
> [(https://creativecommons.org/licenses/by/4.0/)](https://creativecommons.org/licenses/by/4.0/),
> and code samples are licensed under the [<u>Apache 2.0
> License</u>](https://www.apache.org/licenses/LICENSE-2.0)
> [(https://www.apache.org/licenses/LICENSE-2.0)](https://www.apache.org/licenses/LICENSE-2.0).
> For details, see the [<u>Google Developers Site
> Policies</u>](https://developers.google.com/site-policies)
> [(https://developers.google.com/site-policies)](https://developers.google.com/site-policies).
> Java is a registered trademark of Oracle and/or its a liates.
>
> Last updated 2024-11-26 UTC.

https://ai.google.dev/gemini-api/docs/openai 7/7
