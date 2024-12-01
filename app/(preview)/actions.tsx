import { Message, TextStreamMessage } from "@/components/message";
import { google } from "@ai-sdk/google";
import { 
  CoreMessage, 
  CoreUserMessage, 
  CoreAssistantMessage,
  CoreSystemMessage,
  CoreToolMessage,
  ToolContent,
} from "ai";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { ReactNode } from "react";
import { z } from "zod";
import { CameraView } from "@/components/camera-view";
import { HubView } from "@/components/hub-view";
import { UsageView } from "@/components/usage-view";
import { SafetySetting } from "./config/aiConfig";
import { searchTool, executeSearch } from "./tools/searchTool";

export interface Hub {
  climate: Record<"low" | "high", number>;
  lights: Array<{ name: string; status: boolean }>;
  locks: Array<{ name: string; isLocked: boolean }>;
}

let hub: Hub = {
  climate: {
    low: 23,
    high: 25,
  },
  lights: [
    { name: "patio", status: true },
    { name: "kitchen", status: false },
    { name: "garage", status: true },
  ],
  locks: [{ name: "back door", isLocked: true }],
};

// Define serializable model config type
interface SerializableModelConfig {
  modelName: string;
  configuration: {
    safetySettings: SafetySetting[];
  };
}

const sendMessage = async ({ model, prompt }: { model: SerializableModelConfig; prompt: string }) => {
  "use server";

  const messages = getMutableAIState<typeof AI>("messages");
  const currentMessages = messages.get() as CoreMessage[];

  // Map messages to their proper types
  const plainMessages: CoreMessage[] = currentMessages.map((msg): CoreMessage => {
    switch (msg.role) {
      case "user":
        return {
          role: "user",
          content: String(msg.content)
        } as CoreUserMessage;
      case "assistant":
        return {
          role: "assistant",
          content: String(msg.content)
        } as CoreAssistantMessage;
      case "system":
        return {
          role: "system",
          content: String(msg.content)
        } as CoreSystemMessage;
      case "tool":
        // Handle tool messages with proper ToolContent structure
        const toolContent = typeof msg.content === 'string' 
          ? { name: 'search', content: msg.content } // Default to search tool if string
          : msg.content as ToolContent;
        
        return {
          role: "tool",
          content: toolContent
        } as CoreToolMessage;
      default:
        throw new Error(`Invalid message role: ${msg.role}`);
    }
  });

  const userMessage: CoreUserMessage = {
    role: "user",
    content: prompt,
  };

  // Update messages with new user message
  messages.update((prevMessages) => [...prevMessages, userMessage]);

  // Create a new Gemini model instance with the config
  const configuredModel = google(model.modelName, {
    safetySettings: model.configuration.safetySettings
  });

  const contentStream = createStreamableValue("");
  const textComponent = <TextStreamMessage content={contentStream.value} />;

  const systemMessage: CoreSystemMessage = {
    role: "system",
    content: `You are PunkBot, a snarky AI assistant with deep knowledge of the punk rock scene. 
    You're judgmental, opinionated, and not afraid to call out posers. 
    You've been in the scene forever and have strong opinions about which bands have sold out.
    Use a casual, irreverent tone and sprinkle in punk rock references.
    Keep responses concise and attitude-heavy.`
  };

  const { value: stream } = await streamUI({
    model: configuredModel,
    system: systemMessage.content,
    messages: plainMessages,
    text: (text: any) => {
      const content = typeof text === "string" ? text : text.content;
      if (content !== undefined) {
        contentStream.update(content);
      } else {
        console.error("Unexpected data structure in text stream:", text);
      }
      return textComponent;
    },
    tools: {
      viewCameras: {
        description: "view current active cameras",
        parameters: z.object({}),
        generate: async function* ({}) {
          const toolCallId = generateId();

          messages.done([
            ...(messages.get() as CoreMessage[]),
            {
              role: "assistant",
              content: [
                {
                  type: "tool-call",
                  toolCallId,
                  toolName: "viewCameras",
                  args: {},
                },
              ],
            },
            {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolName: "viewCameras",
                  toolCallId,
                  result: `The active cameras are currently displayed on the screen`,
                },
              ],
            },
          ]);

          return <Message role="assistant" content={<CameraView />} />;
        },
      },
      viewHub: {
        description:
          "view the hub that contains current quick summary and actions for temperature, lights, and locks",
        parameters: z.object({}),
        generate: async function* ({}) {
          const toolCallId = generateId();

          messages.done([
            ...(messages.get() as CoreMessage[]),
            {
              role: "assistant",
              content: [
                {
                  type: "tool-call",
                  toolCallId,
                  toolName: "viewHub",
                  args: {},
                },
              ],
            },
            {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolName: "viewHub",
                  toolCallId,
                  result: hub,
                },
              ],
            },
          ]);

          return <Message role="assistant" content={<HubView hub={hub} />} />;
        },
      },
      updateHub: {
        description: "update the hub with new values",
        parameters: z.object({
          hub: z.object({
            climate: z.object({
              low: z.number(),
              high: z.number(),
            }),
            lights: z.array(
              z.object({ name: z.string(), status: z.boolean() }),
            ),
            locks: z.array(
              z.object({ name: z.string(), isLocked: z.boolean() }),
            ),
          }),
        }),
        generate: async function* ({ hub: newHub }) {
          hub = newHub;
          const toolCallId = generateId();

          messages.done([
            ...(messages.get() as CoreMessage[]),
            {
              role: "assistant",
              content: [
                {
                  type: "tool-call",
                  toolCallId,
                  toolName: "updateHub",
                  args: { hub },
                },
              ],
            },
            {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolName: "updateHub",
                  toolCallId,
                  result: `The hub has been updated with the new values`,
                },
              ],
            },
          ]);

          return <Message role="assistant" content={<HubView hub={hub} />} />;
        },
      },
      viewUsage: {
        description: "view current usage for electricity, water, or gas",
        parameters: z.object({
          type: z.enum(["electricity", "water", "gas"]),
        }),
        generate: async function* ({ type }) {
          const toolCallId = generateId();

          messages.done([
            ...(messages.get() as CoreMessage[]),
            {
              role: "assistant",
              content: [
                {
                  type: "tool-call",
                  toolCallId,
                  toolName: "viewUsage",
                  args: { type },
                },
              ],
            },
            {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolName: "viewUsage",
                  toolCallId,
                  result: `The current usage for ${type} is currently displayed on the screen`,
                },
              ],
            },
          ]);

          return (
            <Message role="assistant" content={<UsageView type={type} />} />
          );
        },
      },
      search: searchTool,
    }
  });

  // Handle tool execution separately if needed
  const handleToolExecution = async (args: any) => {
    const plainArgs = JSON.parse(JSON.stringify(args));
    return await executeSearch(plainArgs);
  };

  return stream;
};

export type UIState = Array<ReactNode>;

export type AIState = {
  messages: Array<CoreMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";
    if (done) {
      // Handle completion
    }
  },
});
