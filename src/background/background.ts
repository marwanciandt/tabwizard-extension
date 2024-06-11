import { LLMResponse, queryLLM } from "../apis/llm_api";
import { TabsData } from "../sidepanel/sidepanel";
import { Messages } from "../utils/messages";
import {
  getStoredTabsData,
  LocalStorageTabsData,
  setStoredOptions,
  setStoredTabsData,
  Tab,
  TabGroup,
} from "../utils/storage";

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

  (async () => {
    await setTabData();
  })();
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
