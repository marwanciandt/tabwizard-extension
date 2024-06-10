import { LLMResponse, queryLLM } from "../apis/llm_api";
import { Messages } from "../utils/messages";
import {
  getStoredTabsData,
  LocalStorageTabsData,
  setStoredOptions,
  setStoredTabsData,
  Tab,
} from "../utils/storage";

export async function getAllTabs(): Promise<Tab[]> {
  const current = await chrome.windows.getCurrent();
  const windowTabs = await chrome.tabs.query({ windowId: current.id });
  const collator = new Intl.Collator();
  windowTabs.sort((a, b) => collator.compare(a.title, b.title));

  const tabs: Tab[] = [];

  windowTabs.forEach((tab) => {
    const newTab: Tab = {
      id: tab.id,
      groupId: tab.groupId,
      title: tab.title,
      description: "Description not set",
      keywords: [],
      url: tab.url,
      type: "ai",
      windowId: tab.windowId,
    };
    tabs.push(newTab);
  });

  return tabs;
}

chrome.runtime.onInstalled.addListener(() => {
  // Set SidePanel click behaviour
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  (async () => {
    const res = await getAllTabs().then((tabs) => {
      setStoredTabsData({
        tabGroups: [],
        tabs: tabs,
      });
    });
  })();

  // setStoredTabsData({
  //   tabGroups: [
  //     {
  //       id: 1,
  //       name: "LLM using LangChain or LangGraph",
  //       summary: "langchain langgraph",
  //       type: "ai",
  //       tabs: [
  //         {
  //           id: 1,
  //           title: "A tab",
  //           keywords: ["llm", "langchain"],
  //           type: "ai",
  //           url: "https://wizard.com",
  //           windowId: 1,
  //         },
  //         {
  //           id: 2,
  //           title: "A second tab",
  //           keywords: ["sourdough", "baking"],
  //           type: "user",
  //           url: "https://wizard.com",
  //           windowId: 1,
  //         },
  //       ],
  //     },
  //     {
  //       id: 2,
  //       name: "How to make Sourdough",
  //       summary: "Sourdough baking",
  //       type: "user",
  //       tabs: [
  //         {
  //           id: 1,
  //           title: "A tab",
  //           keywords: ["llm", "langchain"],
  //           type: "ai",
  //           url: "https://wizard.com",
  //           windowId: 1,
  //         },
  //         {
  //           id: 2,
  //           title: "A second tab",
  //           keywords: ["sourdough", "baking"],
  //           type: "user",
  //           url: "https://wizard.com",
  //           windowId: 1,
  //         },
  //       ],
  //     },
  //   ],
  //   tabs: [
  //     {
  //       id: 1,
  //       title: "A tab",
  //       keywords: ["llm", "langchain"],
  //       type: "ai",
  //       url: "https://wizard.com",
  //       windowId: 1,
  //     },
  //     {
  //       id: 2,
  //       title: "A second tab",
  //       keywords: ["sourdough", "baking"],
  //       type: "user",
  //       url: "https://wizard.com",
  //       windowId: 1,
  //     },
  //   ],
  // });
});

async function getTopic(prompt: string): Promise<LLMResponse> {
  const res = await queryLLM(prompt);
  return res;
}

async function updateTabDescriptions(request, sender) {
  try {
    // Await directly instead of using then for the initial API call
    const res = await getTopic(request.keywords);
    console.log(res.prompt.content);

    // Await the stored tabs data retrieval
    const storedTabs = await getStoredTabsData();

    // Update the description in tabs array
    storedTabs.tabs.forEach((tab) => {
      if (tab.id === sender.tab.id) {
        tab.description = res.response;
      }
    });

    // Update the description in tabGroups array
    storedTabs.tabGroups.forEach((tabGroup) => {
      tabGroup.tabs.forEach((tab) => {
        if (tab.id === sender.tab.id) {
          tab.description = res.response;
          console.log(`Tab ${tab.id} description set to "${res.response}"`);
        }
      });
    });

    // Update the stored data once all modifications are done
    await setStoredTabsData(storedTabs);
  } catch (error) {
    console.error("Failed to update tab descriptions:", error);
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  );

  if (request.type === Messages.PROCESS_TAB_META) {
    console.log(request.keywords);
    updateTabDescriptions(request, sender);

    // (async () => {
    //   const res = await getTopic(request.keywords).then((res) => {
    //     console.log(res.prompt.content);
    //     getStoredTabsData().then((storedTabs) => {
    //       storedTabs.tabs.forEach((tab, index) => {
    //         if (tab.id === sender.tab.id) {
    //           tab.description = res.response;
    //         }
    //       });
    //       storedTabs.tabGroups.forEach((tabGroup, index) => {
    //         tabGroup.tabs.forEach((tab, index) => {
    //           if (tab.id === sender.tab.id) {
    //             tab.description = res.response;
    //             console.log(
    //               `Tab ${tab.id} desription set to \"${res.response}\"`
    //             );
    //           }
    //         });
    //       });
    //       setStoredTabsData(storedTabs);
    //     });
    //   });
    // })();
    // sendResponse({ farewell: "goodbye" });
  }
});
