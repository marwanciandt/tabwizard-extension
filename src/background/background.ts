import { LLMResponse, queryLLM } from "../apis/llm_api";
import { Messages } from "../utils/messages";
import { setStoredOptions, setStoredCities } from "../utils/storage";

chrome.runtime.onInstalled.addListener(() => {
  setStoredCities([]);
  setStoredOptions({
    hasAutoOverlay: false,
    homeCity: "",
    tempScale: "metric",
  });
});

async function getTopic(prompt: string): Promise<LLMResponse> {
  const res = await queryLLM(prompt);
  return res;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  if (request.type === Messages.PROCESS_TAB_META) {
    console.log(request.keywords);

    (async () => {
      const res = await getTopic(request.keywords).then((res) => {
        console.log(res.prompt.content);
        console.log(`Suggested topic name: ${res.response}`);
      });
      sendResponse({ farewell: "goodbye" });
    })();
  }
});
