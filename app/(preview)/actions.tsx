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
import { SafetySetting } from "./config/aiConfig";
import { searchTool } from "./tools/searchTool";

// Define message role type
type MessageRole = CoreMessage['role'];

// Define base message type
interface BaseMessage {
  role: MessageRole;
  content: string | ToolContent;
}

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

  // Map messages to their proper types with type checking
  const plainMessages: CoreMessage[] = currentMessages.map((msg: BaseMessage): CoreMessage => {
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
        // Type guard to ensure all cases are handled
        const _exhaustiveCheck: never = msg.role;
        throw new Error(`Invalid message role: ${_exhaustiveCheck}`);
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
