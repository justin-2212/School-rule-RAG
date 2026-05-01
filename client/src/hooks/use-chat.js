import { useMemo, useState } from "react";
import { appConfig } from "../../config.browser";

const API_PATH = appConfig.apiPath;

function streamAsyncIterator(stream) {
  const reader = stream.getReader();
  return {
    next() {
      return reader.read();
    },
    return() {
      reader.releaseLock();
      return {
        value: {},
      };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
}

export function useChat() {
  const [currentChat, setCurrentChat] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [state, setState] = useState("idle");

  const abortController = useMemo(() => new AbortController(), []);

  function cancel() {
    setState("idle");
    abortController.abort();
    if (currentChat) {
      const newHistory = [...chatHistory, { role: "user", content: currentChat }];
      setChatHistory(newHistory);
      setCurrentChat("");
    }
  }

  function clear() {
    setChatHistory([]);
  }

  const sendMessage = async (message, previousHistory) => {
    setState("waiting");
    let chatContent = "";
    const newHistory = [...previousHistory, { role: "user", content: message }];

    setChatHistory(newHistory);
    const body = JSON.stringify({
      messages: newHistory.slice(-appConfig.historyLength),
    });

    const decoder = new TextDecoder();
    const res = await fetch(API_PATH, {
      body,
      method: "POST",
      signal: abortController.signal,
    });

    setCurrentChat("...");

    if (!res.ok || !res.body) {
      setState("idle");
      return;
    }

    for await (const event of streamAsyncIterator(res.body)) {
      setState("loading");
      const data = decoder.decode(event).split("\n");
      for (const chunk of data) {
        if (!chunk) continue;
        const parsed = JSON.parse(chunk);
        if (parsed?.role === "assistant") {
          chatContent = "";
          continue;
        }
        const content = parsed?.choices?.[0]?.delta?.content;
        if (content) {
          chatContent += content;
          setCurrentChat(chatContent);
        }
      }
    }

    setChatHistory((curr) => [...curr, { role: "assistant", content: chatContent }]);
    setCurrentChat(null);
    setState("idle");
  };

  return { sendMessage, currentChat, chatHistory, cancel, clear, state };
}
