import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useChat } from "./hooks/use-chat";
import { ChatMessage } from "./components/ChatMessage";
import { Welcome } from "./components/Welcome";
import { appConfig } from "../config.browser";

export const App = () => {
  const [message, setMessage] = useState("");
  const { currentChat, chatHistory, sendMessage, cancel, state, clear } = useChat();
  const currentMessage = useMemo(
    () => ({ content: currentChat ?? "", role: "assistant" }),
    [currentChat],
  );
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    document.title = "Student Handbook QA";
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat, chatHistory, state]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state]);

  return (
    <main className="bg-white md:rounded-lg md:shadow-md p-6 w-full h-full flex flex-col">
      <section className="overflow-y-auto flex-grow mb-4 pb-8">
        <div className="flex flex-col space-y-4">
          {chatHistory.length === 0 ? (
            <>
              <Welcome />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appConfig.samplePhrases.map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => sendMessage(phrase, chatHistory)}
                    className="bg-gray-100 border-gray-300 border-2 rounded-lg p-4"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </>
          ) : (
            chatHistory.map((chat, i) => <ChatMessage key={i} message={chat} />)
          )}

          {currentChat ? <ChatMessage message={currentMessage} /> : null}
        </div>

        <div ref={bottomRef} />
      </section>
      <div className="flex items-center justify-center h-20">
        {state === "idle" ? null : (
          <button className="bg-gray-100 text-gray-900 py-2 px-4 my-8" onClick={cancel}>
            Stop generating
          </button>
        )}
      </div>
      <section className="bg-gray-100 rounded-lg p-2">
        <form
          className="flex"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(message, chatHistory);
            setMessage("");
          }}
        >
          {chatHistory.length > 1 ? (
            <button
              className="bg-gray-100 text-gray-600 py-2 px-4 rounded-l-lg"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                clear();
                setMessage("");
              }}
            >
              Clear
            </button>
          ) : null}
          <input
            type="text"
            ref={inputRef}
            className="w-full rounded-l-lg p-2 outline-none"
            placeholder={state === "idle" ? "Nhập câu hỏi của bạn..." : "..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={state !== "idle"}
          />
          {state === "idle" ? (
            <button className="bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg" type="submit">
              Gửi
            </button>
          ) : null}
        </form>
      </section>
    </main>
  );
};
