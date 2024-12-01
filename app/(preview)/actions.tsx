import { Message, TextStreamMessage } from "@/components/message";
import { google } from "@ai-sdk/google";
import { 
  CoreMessage, 
  CoreUserMessage, 
  CoreAssistantMessage,
  CoreSystemMessage,
  CoreToolMessage,
  ToolContent,
  UserContent,
  TextPart$1,
  ImagePart,
  FilePart,
} from "ai";
import {
  createAI,
  createStreamableValue,
  getMutableAIState,
  streamUI,
} from "ai/rsc";
import { SafetySetting } from "./config/aiConfig";
import { searchTool } from "./tools/searchTool";

// Define message content types
type MessageContent = string | { type: string; content: any } | (TextPart$1 | ImagePart | FilePart)[];

// Define base message type
interface BaseMessage {
  role: CoreMessage['role'];
  content: MessageContent;
}

// Define serializable model config type
interface SerializableModelConfig {
  modelName: string;
  configuration: {
    safetySettings: SafetySetting[];
  };
}

function processUserContent(content: MessageContent): UserContent {
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }] as UserContent;
  }
  if (Array.isArray(content)) {
    return content as UserContent;
  }
  return [{ type: 'text', text: JSON.stringify(content) }] as UserContent;
}

function processToolContent(content: MessageContent): ToolContent {
  if (typeof content === 'string') {
    return { name: 'search', content } as ToolContent;
  }
  if (Array.isArray(content)) {
    return { 
      name: 'search', 
      content: content.map(part => 
        typeof part === 'string' ? part : JSON.stringify(part)
      ).join(' ')
    } as ToolContent;
  }
  return content as ToolContent;
}

const sendMessage = async ({ model, prompt }: { model: SerializableModelConfig; prompt: string }) => {
  "use server";

  const messages = getMutableAIState<typeof AI>("messages");
  const currentMessages = messages.get() as CoreMessage[];

  // Map messages to their proper types with content processing
  const plainMessages: CoreMessage[] = currentMessages.map((msg: BaseMessage): CoreMessage => {
    switch (msg.role) {
      case "user":
        return {
          role: "user",
          content: processUserContent(msg.content)
        } as CoreUserMessage;
      case "assistant":
        return {
          role: "assistant",
          content: typeof msg.content === 'string' 
            ? msg.content 
            : Array.isArray(msg.content)
              ? msg.content.map(part => 
                  typeof part === 'string' ? part : JSON.stringify(part)
                ).join(' ')
              : JSON.stringify(msg.content)
        } as CoreAssistantMessage;
      case "system":
        return {
          role: "system",
          content: typeof msg.content === 'string'
            ? msg.content
            : JSON.stringify(msg.content)
        } as CoreSystemMessage;
      case "tool":
        return {
          role: "tool",
          content: processToolContent(msg.content)
        } as CoreToolMessage;
      default:
        // Type guard to ensure all cases are handled
        const _exhaustiveCheck: never = msg.role;
        throw new Error(`Invalid message role: ${_exhaustiveCheck}`);
    }
  });

  const userMessage: CoreUserMessage = {
    role: "user",
    content: [{ type: 'text', text: prompt }] as UserContent
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
      search: searchTool
    }
  });

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
