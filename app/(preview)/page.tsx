"use client";

import { ReactNode, useRef, useState } from "react";
import { useActions } from "ai/rsc";
import { Message } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { motion } from "framer-motion";
import Link from "next/link";
import { google } from "@ai-sdk/google";
import { geminiModel, SafetySetting } from "./config/aiConfig";
import { CoreUserMessage } from "ai";

export default function Home() {
  const { sendMessage } = useActions();

  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Array<ReactNode>>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  /* eslint-disable react/no-unescaped-entities */
  const suggestedActions = [
    { 
      title: "Yo, is", 
      label: "blink-182 still together?", 
      action: `Hey, what's the latest with blink-182? Are they still doing their thing or what?`
    },
    { 
      title: "Tell me about", 
      label: "Green Day selling out", 
      action: `When exactly did Green Day sell out? Was it American Idiot or before that?`
    },
    { 
      title: `What's the deal with`, 
      label: "Warped Tour these days?", 
      action: `Is Warped Tour ever coming back or what?`
    },
    { 
      title: `Who's`, 
      label: "keeping punk alive in 2024?", 
      action: `Which bands are actually keeping punk rock alive in 2024?`
    },
  ];
  /* eslint-enable react/no-unescaped-entities */

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-3 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
                  <span className="text-xl font-bold">🤘 PunkBot</span>
                </p>
                <p className="text-center font-bold text-base">
                  Your Scene-Savvy, Slightly Judgmental AI Assistant
                </p>
                <p className="text-center">
                  {`Hey posers and punks alike! I'm PunkBot, and I've been in the scene since before you knew what a mosh pit was. 
                  I've got the dirt on every band that ever claimed they'd never sell out (spoiler: most of them did). 
                  Ask me about tours, releases, or who's actually keeping it real in 2024.`}
                </p>
                <p className="text-center">
                  {`And yeah, I was at that show you're thinking about. Front row. No big deal.`}
                </p>
                <div className="flex flex-col gap-2">
                  <p className="text-center font-medium">Try asking me stuff like:</p>
                  {suggestedActions.map((action, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.01 * index }}
                      key={index}
                      className={index > 1 ? "hidden sm:block" : "block"}
                    >
                      <button
                        onClick={async () => {
                          setMessages((messages) => [
                            ...messages,
                            <Message
                              key={messages.length}
                              role="user"
                              content={action.action}
                            />,
                          ]);
                          const response: ReactNode = await sendMessage({
                            model: geminiModel,
                            prompt: action.action,
                          });
                          setMessages((messages) => [...messages, response]);
                        }}
                        className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                      >
                        <span className="font-medium">{action.title}</span>
                        <span className="text-zinc-500 dark:text-zinc-400">
                          {action.label}
                        </span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          {messages.map((message) => message)}
          <div ref={messagesEndRef} />
        </div>

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;

            // Create a properly typed user message
            const userMessage: CoreUserMessage = {
              role: "user",
              content: input
            };

            setMessages((messages) => [
              ...messages,
              <Message key={messages.length} role={userMessage.role} content={userMessage.content} />,
            ]);
            setInput("");

            // Ensure model is a plain object
            const plainModel = {
              ...geminiModel,
              safetySettings: geminiModel.safetySettings?.map((setting: SafetySetting) => ({
                ...setting
              }))
            };

            sendMessage({
              model: plainModel,
              prompt: userMessage.content,
            }).then((response: ReactNode) => {
              setMessages((messages) => [...messages, response]);
            });
          }}
        >
          <input
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
            placeholder="Send a message..."
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
          />
        </form>
      </div>
    </div>
  );
}
