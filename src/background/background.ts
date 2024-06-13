import { LLMResponse, queryLLM } from "../apis/llm_api";
import { TabsData } from "../sidepanel/sidepanel";
import {
  MessageRequest,
  MessageRequests,
  MessageResponse,
  TAB_MSG_CHANNEL,
  TabContentMessageData,
} from "../types/messages";
import {
  getStoredTabsData,
  setStoredTabsData,
  Tab,
  TabGroup,
} from "../utils/storage";

const CLOCK_TIMER: string = "clock_timer";
const PROCESS_TABS_TIMER: string = "process_tab_timer";

async function getAllTabs(): Promise<Tab[]> {
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

async function fetchGroupTitles(tabs: Tab[]) {
  const groupIds = [
    ...new Set(
      tabs.filter((tab) => tab.groupId !== -1).map((tab) => tab.groupId)
    ),
  ];

  const promises = groupIds.map((groupId) =>
    chrome.tabGroups
      .get(groupId)
      .then((group) => ({
        id: groupId,
        title: group.title,
      }))
      .catch((error) => ({
        id: groupId,
        title: "Untitled Group", // Fallback title in case of an error
        error,
      }))
  );
  return Promise.all(promises);
}

async function processTabs(): Promise<TabsData> {
  const groups: TabGroup[] = [];
  const defaultGroup: Tab[] = [];

  const tabs = await getAllTabs();
  const groupData = await fetchGroupTitles(tabs);

  tabs.forEach((tab, index) => {
    if (tab.groupId === -1) {
      console.log(`Adding standalone tab ${tab.id}`);
      defaultGroup.push(tab);
    } else {
      const group = groups.find((group) => group.id === tab.groupId);
      if (group !== undefined) {
        console.log(`Pushing tab ${tab.id} to existing group ${group.id}`);
        group.tabs.push(tab);
      } else {
        const title = groupData.find((g) => g.id === tab.groupId).title;

        const newGroup: TabGroup = {
          id: tab.groupId,
          windowId: tab.windowId,
          name: title,
          summary: "Default summary.",
          type: "user",
          tabs: [tab], // Start with the current tab
          processed: false,
        };

        console.log(`Pushing new group to array ${newGroup.id}`);
        groups.push(newGroup);
      }
    }
  });
  return {
    tabGroups: groups,
    tabs: defaultGroup,
  };
}

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

async function setTabData() {
  const tabsData: TabsData = await processTabs();

  console.log(
    `Number of groups identified ${
      tabsData.tabGroups != null && tabsData.tabGroups.length
    }`
  );
  console.log(
    `Number of standalone tabs identified ${
      tabsData.tabs != null && tabsData.tabs.length
    }`
  );

  console.log(tabsData);

  setStoredTabsData(tabsData).then(() => {
    console.log("Stored tabs in LocalStorage");
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
    // Adjust the URL pattern as necessary
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      });
    });
  });

  (async () => {
    await setTabData();
  })();
});

chrome.alarms.create(CLOCK_TIMER, {
  periodInMinutes: 1 / 60,
});

chrome.alarms.create(PROCESS_TABS_TIMER, {
  periodInMinutes: 1 / 6,
});

// chrome.alarms.onAlarm.addListener((alarm) => {
//   if (alarm.name === CLOCK_TIMER) {
//     chrome.storage.local.get(["timer"], (res) => {
//       const time = res.timer ?? 0;
//       chrome.storage.local.set({ timer: time + 1 });
//     });
//   } else if (alarm.name === PROCESS_TABS_TIMER) {
//     const tabsData = getStoredTabsData().then((tabsData) => {
//       const unprocessedGroups: TabGroup[] = tabsData.tabGroups.filter(
//         (group) => !group.processed
//       );

//       const unprocessedTabs: Tab[] = tabsData.tabs.filter(
//         (tab) => !tab.processed
//       );

//       console.log(`Groups to be processed ${unprocessedGroups.length}`);

//       tabsData.tabGroups.forEach((tabGroup, index) => {
//         if (!tabGroup.processed) {
//           // Send message to each tab in the TabGroup
//           tabGroup.tabs.forEach((tab, index) => {
//             if (!tab.processed) {
//               sendProcessMessage(tab);
//             }
//           });
//           tabGroup.summary = "New Summary";
//           tabGroup.processed = true;
//         }
//       });

//       console.log(`Tabs to be processed ${unprocessedTabs.length}`);

//       tabsData.tabs.forEach((tab, index) => {
//         if (!tab.processed) {
//           sendProcessMessage(tab);
//           tab.processed = true;
//         }
//       });

//       setStoredTabsData(tabsData);
//     });
//   }
// });

// function sendProcessMessage(tab: Tab) {
//   const message: MessageRequest = {
//     msg_type:
//       MessageRequests.REQ_CONTENT_DESCRIPTION |
//       MessageRequests.REQ_CONTENT_KEYWORDS,
//   };

//   console.log(`Sending message ${message} to tab ${tab.title}`);

//   chrome.tabs.sendMessage(
//     tab.id,
//     { message: message },
//     function (response: MessageResponse) {
//       tab.description = response.data.description;
//       tab.keywords = response.data.keywords;
//       tab.processed = true;
//       console.log(`Response from tab ${tab.title} content script`);
//     }
//   );
// }

// Update PROCESS_TABS_TIMER to handle promises
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PROCESS_TABS_TIMER) {
    getStoredTabsData().then((tabsData) => {
      const processingPromises = [];

      tabsData.tabGroups.forEach((tabGroup) => {
        if (!tabGroup.processed) {
          console.log(
            `Analyzing group ${tabGroup.name} with ${tabGroup.tabs.length}`
          );
          tabGroup.tabs.forEach((tab) => {
            if (!tab.processed) {
              const promise = new Promise((resolve) => {
                sendProcessMessage(tab, resolve);
              });
              processingPromises.push(promise);
            }
          });
        }
      });

      console.log(`Analyzing ${tabsData.tabs.length} standalone tabs`);
      tabsData.tabs.forEach((tab) => {
        if (!tab.processed) {
          const promise = new Promise((resolve) => {
            sendProcessMessage(tab, resolve);
          });
          processingPromises.push(promise);
        }
      });

      Promise.all(processingPromises).then(() => {
        setStoredTabsData(tabsData); // Save all changes after all processing is done
      });
    });
  }
});

function sendProcessMessage(tab: Tab, resolve) {
  const message = {
    msg_type:
      MessageRequests.REQ_CONTENT_DESCRIPTION |
      MessageRequests.REQ_CONTENT_KEYWORDS,
  };

  chrome.tabs.sendMessage(tab.id, { message: message }, (response) => {
    if (response) {
      tab.description = response.data.description;
      tab.keywords = response.data.keywords;
      tab.processed = true;
    }
    console.log(
      `Processing tab ${tab.title} ${
        tab.processed ? "completed" : "pending..."
      }`
    );
    resolve(); // Resolve the promise after processing
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
