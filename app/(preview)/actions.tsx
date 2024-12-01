import { Message, TextStreamMessage } from "@/components/message";
import { google } from "@ai-sdk/google";
import { 
  CoreMessage, 
  CoreUserMessage, 
  CoreAssistantMessage,
  CoreSystemMessage,
  generateId 
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
import { searchTool } from "./tools/searchTool";

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

const sendMessage = async ({ model, prompt }: { model: any; prompt: string }) => {
  "use server";

  const messages = getMutableAIState<typeof AI>("messages");
  const currentMessages = messages.get() as CoreMessage[];

  // Ensure we're working with properly typed messages
  const plainMessages: CoreMessage[] = currentMessages.map(msg => {
    switch (msg.role) {
      case "user":
        return {
          role: "user",
          content: msg.content
        } as CoreUserMessage;
      case "assistant":
        return {
          role: "assistant",
          content: msg.content
        } as CoreAssistantMessage;
      case "system":
        return {
          role: "system",
          content: msg.content
        } as CoreSystemMessage;
      default:
        throw new Error(`Unsupported message role: ${msg.role}`);
    }
  });

  // Create a properly typed user message
  const userMessage: CoreUserMessage = {
    role: "user",
    content: prompt
  };

  messages.update([
    ...plainMessages,
    userMessage
  ]);

  const contentStream = createStreamableValue("");
  const textComponent = <TextStreamMessage content={contentStream.value} />;

  // Ensure model is a plain object before passing to streamUI
  const plainModel = {
    ...model,
    safetySettings: model.safetySettings?.map((setting: SafetySetting) => ({
      ...setting
    }))
  };

  const systemMessage: CoreSystemMessage = {
    role: "system",
    content: `You are PunkBot, a snarky AI assistant with deep knowledge of the punk rock scene. 
    You're judgmental, opinionated, and not afraid to call out posers. 
    You've been in the scene forever and have strong opinions about which bands have sold out.
    Use a casual, irreverent tone and sprinkle in punk rock references.
    Keep responses concise and attitude-heavy.`
  };

  // Define type for text stream data
  type StreamText = {
    content: string;
    delta: string;
    done: boolean;
  };

  const { value: stream } = await streamUI({
    model: plainModel,
    system: systemMessage.content,
    messages: plainMessages,
    text: (text: StreamText | string) => {
      // Handle both string and object formats safely
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
      search: {
        ...searchTool,
        description: "Check the scene for latest drops, drama, and who sold out this week",
        execute: async (args) => {
          // Ensure args is a plain object
          const plainArgs = JSON.parse(JSON.stringify(args));
          return await searchTool.execute(plainArgs);
        }
      }
    }
  });

  return stream;
};

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<CoreMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }) => {
    "use server";

    if (done) {
      // save to database
    }
  },
});
