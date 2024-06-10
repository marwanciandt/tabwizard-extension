import { LLMResponse, queryLLM } from "../apis/llm_api";
import { Messages } from "../utils/messages";
import { setStoredOptions, setStoredTabsData } from "../utils/storage";

chrome.runtime.onInstalled.addListener(() => {
  // Set SidePanel click behaviour
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  setStoredOptions({
    hasAutoOverlay: false,
    homeCity: "",
    tempScale: "metric",
    excludeList: [],
    useLLM: true,
    updateFrequency: 1,
  });

  setStoredTabsData({
    tabGroups: [
      {
        id: 1,
        name: "LLM using LangChain or LangGraph",
        summary: "langchain langgraph",
        type: "ai",
        tabs: [
          {
            id: 1,
            title: "A tab",
            keywords: ["llm", "langchain"],
            type: "ai",
            url: "https://wizard.com",
            windowId: 1,
          },
          {
            id: 2,
            title: "A second tab",
            keywords: ["sourdough", "baking"],
            type: "user",
            url: "https://wizard.com",
            windowId: 1,
          },
        ],
      },
      {
        id: 2,
        name: "How to make Sourdough",
        summary: "Sourdough baking",
        type: "user",
        tabs: [
          {
            id: 1,
            title: "A tab",
            keywords: ["llm", "langchain"],
            type: "ai",
            url: "https://wizard.com",
            windowId: 1,
          },
          {
            id: 2,
            title: "A second tab",
            keywords: ["sourdough", "baking"],
            type: "user",
            url: "https://wizard.com",
            windowId: 1,
          },
        ],
      },
    ],
    tabs: [
      {
        id: 1,
        title: "A tab",
        keywords: ["llm", "langchain"],
        type: "ai",
        url: "https://wizard.com",
        windowId: 1,
      },
      {
        id: 2,
        title: "A second tab",
        keywords: ["sourdough", "baking"],
        type: "user",
        url: "https://wizard.com",
        windowId: 1,
      },
    ],
  });
});

async function getAllTabs() {
  const current = await chrome.windows.getCurrent();

  const allTabs = await chrome.tabs.query({});

  allTabs.forEach((tab) => {
    // if (tab.windowId != current.id) {
    //   chrome.tabs.move(tab.id, {
    //     windowId: current.id,
    //     index: tab.index,
    //   });
    console.log(tab.title);
  });

  const collator = new Intl.Collator();
  allTabs.sort((a, b) => collator.compare(a.title, b.title));

  return true;
}

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
