"use client";

import "@/app/globals.css";
import { useEffect, useState } from "react";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { parseMessages } from "@/lib/ui-message-utils";

import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { getRandomThinkingMessage } from "@/lib/thinking-messages";


function Chat() {
  const [input, setInput] = useState<string>("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  useEffect(() => {
    console.log("messages (parsed)", parseMessages(messages));
    console.log("messages", messages);
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || status !== "ready") return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="w-full p-6 relative size-full h-screen">
      {JSON.stringify(parseMessages(messages))}
      <div className="flex flex-col h-full">
        <Conversation className="min-h-0">
          <ConversationContent>
            {messages.map((message: any) => (
              <div key={message.id}>
                {message.parts?.map((part: any, i: number) => {
                  if (part.type === "text") {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }
                  if (part.type === "data-workflow") {
                    const steps = part.data.steps;
                    const lastStepKey = Object.keys(steps).pop();
                    const lastStep = lastStepKey ? steps[lastStepKey] : null;

                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>
                            {lastStep?.suspendPayload?.message || lastStep?.output?.message}
                          </MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {status !== "ready" && (
              <Message from="assistant">
                <MessageContent>
                  <MessageResponse>
                    {`${getRandomThinkingMessage()}...`}
                  </MessageResponse>
                </MessageContent>
              </Message>
            )}
            <ConversationScrollButton />
          </ConversationContent>
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e: any) => setInput(e.target.value)}
              className="md:leading-10"
              value={input}
              placeholder="Type your message..."
            />
          </PromptInputBody>
        </PromptInput>
      </div>
    </div>
  );
}

export default Chat;

