import { LLMResponse, queryLLM } from "../apis/llm_api";
import { TabData } from "../sidepanel/sidepanel";
import { MessageRequests } from "../types/messages";
import { getStoredTabData, setStoredTabsData, Tab } from "../utils/storage";
import { extractTabGroups } from "./extractTabGroups";

const CLOCK_TIMER: string = "clock_timer";
const PROCESS_TABS_TIMER: string = "process_tab_timer";

export async function getAllTabs(): Promise<Tab[]> {
  const current = await chrome.windows.getLastFocused();
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
      processed: false,
    };
    tabs.push(newTab);
  });

  return tabs;
}

export async function fetchGroupTitles(tabs: Tab[]) {
  const groupIds = [
    ...new Set(
      tabs.filter((tab) => tab.groupId !== -1).map((tab) => tab.groupId)
    ),
  ];

  const promises = groupIds.map((groupId) =>
    chrome.tabGroups.get(groupId).then((group) => ({
      id: groupId,
      title: group.title,
    }))
  );
  return Promise.all(promises);
}

async function updateTabDescriptions(request, sender) {
  try {
    // Await directly instead of using then for the initial API call
    const res = await getTopic(request.keywords);
    console.log(res.prompt.content);

    // Await the stored tabs data retrieval
    const storedTabs = await getStoredTabData();

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

async function extractAndStoreTabData() {
  const tabData: TabData = await extractTabGroups();

  console.log(
    `Number of groups identified ${
      tabData.tabGroups != null && tabData.tabGroups.length
    }`
  );

  setStoredTabsData(tabData).then(() => {
    console.log("Stored tabs in LocalStorage");
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      });
    });
  });

  (async () => {
    await extractAndStoreTabData();
  })();
});

chrome.alarms.create(CLOCK_TIMER, {
  periodInMinutes: 1 / 60,
});

chrome.alarms.create(PROCESS_TABS_TIMER, {
  periodInMinutes: 1 / 6,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PROCESS_TABS_TIMER) {
    getStoredTabData().then((tabsData) => {
      const groupPromises = tabsData.tabGroups.map(async (tabGroup) => {
        const tabPromises = tabGroup.tabs
          .filter((tab) => !tab.processed)
          .map((tab) => {
            return new Promise((resolve) => {
              sendProcessMessage(tab, resolve);
            });
          });

        await Promise.all(tabPromises);
        tabGroup.processed = true;
        return tabGroup;
      });

      Promise.all(groupPromises).then((processedGroups) => {
        setStoredTabsData(tabsData);
      });
    });
  }
});

async function getTopic(prompt: string[]): Promise<LLMResponse> {
  const res = await queryLLM(prompt.join(" "));
  return res;
}

function sendProcessMessage(tab: Tab, resolve) {
  const message = {
    msg_type:
      MessageRequests.REQ_CONTENT_DESCRIPTION |
      MessageRequests.REQ_CONTENT_KEYWORDS,
  };

  chrome.tabs.sendMessage(tab.id, { message: message }, async (response) => {
    if (response) {
      tab.keywords = response.data.keywords;
      const res: LLMResponse = await getTopic(tab.keywords);
      tab.description = res.response;
      tab.processed = true;
    }
    console.log(
      `Processing tab ${tab.title} ${
        tab.processed ? "completed" : "pending..."
      }`
    );
    resolve();
    return true;
  });
}

// message, sender, sendResponse
// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   console.log(
//     sender.tab
//       ? "from a content script:" + sender.tab.url
//       : "from the extension"
//   );

//   if (message.type === Messages.PROCESS_TAB_META) {
//     console.log(message.keywords);
//     updateTabDescriptions(message, sender);

//     // sendResponse({ farewell: "goodbye" });
//   }
// });

// Background or popup script
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   // Assuming you want to send a message to the active tab
//   var activeTab = tabs[0];
//   chrome.tabs.sendMessage(
//     activeTab.id,
//     { action: "doSomething" },
//     function (response) {
//       console.log("Response from content script:", response);
//     }
//   );
// });

// async function requestContentSummary(tab) {
//   var port = chrome.runtime.connect({ name: TAB_MSG_CHANNEL });
//   port.postMessage({
//     msg_type:
//       MessageRequests.REQ_CONTENT_KEYWORDS |
//       MessageRequests.REQ_CONTENT_DESCRIPTION,
//   });
//   port.onMessage.addListener(function (msg) {
//     if (msg.question === "Who's there?") port.postMessage({ answer: "Madame" });
//     else if (msg.question === "Madame who?")
//       port.postMessage({ answer: "Madame... Bovary" });
//   });
// }

// chrome.alarms.onAlarm.addListener((alarm) => {
//   chrome.storage.local.get(["timer"], (res) => {
//     const time = res.timer ?? 0;
//     chrome.storage.local.set({ timer: time + 1 });

//     // chrome.action.setBadgeText({ text: `${time} +1` });

//     if (time % 30 == 0) {
//       chrome.notifications.create({
//         title: "Notification from service worker",
//         type: "basic",
//         message: "Timer has advanced",
//         iconUrl: "icons/icon-32.png",
//       });
//     }
//   });
// });
