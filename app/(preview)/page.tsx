"use client";

import { ReactNode, useRef, useState } from "react";
import { Message } from "@/components/message";
import { motion } from "framer-motion";
import { sendMessage } from "./actions";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Array<ReactNode>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedActions = [
    { 
      title: "Tell me about", 
      label: "Warped Tour 2002", 
      action: "What was the Warped Tour lineup like in 2002?" 
    },
    { 
      title: "Did", 
      label: "Blink-182 sell out?", 
      action: "Give me your honest opinion on whether Blink-182 sold out" 
    },
    {
      title: "What's your take on",
      label: "modern pop-punk?",
      action: "What do you think about modern pop-punk bands?",
    },
    {
      title: "Name some",
      label: "underrated punk bands",
      action: "Tell me about some underrated punk bands that deserve more recognition",
    },
  ];

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4">
        <div
          className="flex flex-col gap-3 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && (
            <motion.div className="h-[350px] px-4 w-full md:w-[500px] md:px-0 pt-20">
              <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
                <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
                  <span className="text-xl font-bold">🤘 PunkBot 🎸</span>
                </p>
                <p>
                  Yo! I'm PunkBot, your resident know-it-all for all things punk rock.
                  Been in the scene since forever, seen every band worth seeing, and
                  probably moshed at your first show.
                </p>
                <p>
                  Hit me up about anything punk - from old school to pop-punk (yeah,
                  whatever, I'll talk about it). Just don't expect me to be nice about
                  your taste in music.
                </p>
              </div>
            </motion.div>
          )}
          {messages.map((message, index) => (
            <div key={index}>{message}</div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px] mb-4">
          {messages.length === 0 &&
            suggestedActions.map((action, index) => (
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
                    const response = await sendMessage(action.action);
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

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={async (event) => {
            event.preventDefault();

            setMessages((messages) => [
              ...messages,
              <Message key={messages.length} role="user" content={input} />,
            ]);
            setInput("");

            const response = await sendMessage(input);
            setMessages((messages) => [...messages, response]);
          }}
        >
          <input
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-2 py-1.5 w-full outline-none dark:bg-zinc-700 text-zinc-800 dark:text-zinc-300 md:max-w-[500px] max-w-[calc(100dvw-32px)]"
            placeholder="Ask me about punk rock (if you dare)..."
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
