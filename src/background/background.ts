import { LLMResponse, queryLLM } from "../apis/llm_api";
import { LLM_TEMPLATE, TOKEN_SEPARATOR } from "../prompts/templates";
import { TabData } from "../sidepanel/sidepanel";
import { MessageRequests } from "../types/messages";
import {
  convertToEntity,
  getStoredTabData,
  LocalStorageTabData,
  setStoredTabsData,
  Tab,
  TabGroup,
} from "../utils/storage";
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
      description: "",
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
      const groupPromises: Promise<TabGroup>[] = tabsData.tabGroups
        .filter((group) => !group.processed)
        .map(async (tabGroup) => {
          if (tabGroup.id !== -1) {
            chrome.tabGroups.update(tabGroup.id, {
              collapsed: false,
            });
          }
          const tabPromises = tabGroup.tabs
            .filter((tab) => !tab.processed)
            .map((tab) => {
              return new Promise((resolve) => {
                sendProcessMessage(tab, resolve);
              });
            });

          await Promise.all(tabPromises);
          return tabGroup;
        });

      processGroupsAndUpdateData(groupPromises, tabsData);
    });
  }
});

async function processGroupsAndUpdateData(
  groupPromises: Promise<TabGroup>[],
  tabsData: LocalStorageTabData
) {
  try {
    const processedGroups: TabGroup[] = await Promise.all(groupPromises);
    for (let group of processedGroups) {
      const descriptions: string[] = group.tabs
        .map((tab: Tab) => tab.description)
        .filter((desc: string) => desc.trim() !== "");

      if (descriptions.length > 0) {
        // Call getCompletion asynchronously and wait for the result
        const summary = await getCompletion(
          LLM_TEMPLATE.GROUP_LABEL,
          descriptions,
          TOKEN_SEPARATOR.PERIOD
        );
        group.summary = summary.response;
        group.processed = group.summary !== "" ? true : false;
        if (group.id !== -1) {
          chrome.tabGroups.update(group.id, {
            collapsed: true,
          });
        }
        console.log(`Group ${group.name} labelled as ${group.summary}`);
      }
    }

    // Save the updated groups data
    setStoredTabsData(tabsData);
  } catch (error) {
    console.error("Failed to process groups or update data:", error);
  }
}

async function getCompletion(
  template: LLM_TEMPLATE,
  input: string[],
  separator: TOKEN_SEPARATOR
): Promise<LLMResponse> {
  const res = await queryLLM(template, input.join(separator));
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
      const res: LLMResponse = await getCompletion(
        LLM_TEMPLATE.TAB_DESCRIPTION,
        tab.keywords,
        TOKEN_SEPARATOR.COMMA
      );
      tab.description = res.response;
      tab.processed = tab.description !== "" ? true : false;
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

chrome.tabs.onRemoved.addListener(function (tabId, removed) {
  getStoredTabData().then((tabsData) => {
    tabsData.tabGroups.forEach((group) => {
      group.tabs = group.tabs.filter((tab) => tab.id !== tabId);
    });
    setStoredTabsData(tabsData);
  });
});

chrome.tabs.onCreated.addListener(function (tab: chrome.tabs.Tab) {
  getStoredTabData().then((tabsData) => {
    const group: TabGroup = tabsData.tabGroups.filter(
      (group) => group.id === tab.groupId
    )[0];
    group.tabs.push(convertToEntity(tab));
    setStoredTabsData(tabsData);
  });
});

chrome.tabs.onMoved.addListener(function (tabId) {
  updateTabGroupOnMove(tabId);
});

async function updateTabGroupOnMove(tabId: number) {
  const tabsData: LocalStorageTabData = await getStoredTabData();

  // Find the tab and its current group
  let currentGroup: TabGroup = null;
  let newGroup: TabGroup = null;
  let tabToUpdate: Tab = null;
  let oldGroupId: number = null;

  for (const group of tabsData.tabGroups) {
    const foundTab: Tab = group.tabs.find((tab) => tab.id === tabId);
    if (foundTab) {
      currentGroup = group;
      tabToUpdate = foundTab;
      oldGroupId = foundTab.groupId;
      break;
    }
  }

  if (tabToUpdate && currentGroup) {
    // Fetch the latest group ID from the Chrome API
    chrome.tabs.get(tabId, async function (tab) {
      const newGroupId = tab.groupId;

      // If the group ID has changed
      if (newGroupId !== oldGroupId) {
        // Remove tab from the old group
        currentGroup.tabs = currentGroup.tabs.filter((tab) => tab.id !== tabId);

        // Find or create the new group
        let newGroup = tabsData.tabGroups.find((g) => g.id === newGroupId);
        if (newGroup != null) {
          tabToUpdate.groupId = newGroupId;
          newGroup.tabs.push(tabToUpdate);
        }

        // Save the updated data
        setStoredTabsData(tabsData);
      }
    });
  }
}
