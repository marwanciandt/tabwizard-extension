import { OpenWeatherTempScale } from "../apis/weather_api";
import { TabData } from "../sidepanel/sidepanel";
import { TabGroupType, TabType } from "../types/TabGroupType";

export interface LocalStorageOptions {
  hasAutoOverlay: boolean;
  homeCity: string;
  tempScale: OpenWeatherTempScale;
  excludeList?: string[];
  useLLM: boolean;
  updateFrequency: number;
}

export interface Tab {
  id: number;
  groupId: number;
  title: string;
  keywords: string[];
  description: string;
  type: TabType;
  url: string;
  windowId: number;
  processed: boolean;
}

export function convertToEntity(tab: chrome.tabs.Tab): Tab {
  return {
    id: tab.id,
    groupId: tab.groupId,
    title: tab.title,
    keywords: [],
    description: "",
    type: "user",
    url: tab.url,
    windowId: tab.windowId,
    processed: false,
  };
}

export interface TabGroup {
  id: number;
  windowId: number;
  name: string;
  summary: string;
  type: TabGroupType;
  tabs?: Tab[];
  processed: boolean;
}

export interface LocalStorageTabData {
  tabGroups?: TabGroup[];
  // tabs?: Tab[];
}

export interface LocalStorage {
  tabsData?: LocalStorageTabData;
  options?: LocalStorageOptions;
}

export type LocalStorageKeys = keyof LocalStorage;

export function setStoredOptions(options: LocalStorageOptions): Promise<void> {
  const vals: LocalStorage = {
    options,
  };
  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
}

export function getStoredOptions(): Promise<LocalStorageOptions> {
  const keys: LocalStorageKeys[] = ["options"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result: LocalStorage) => {
      resolve(result.options);
    });
  });
}

export function setStoredTabsData(
  tabsData: LocalStorageTabData
): Promise<void> {
  const vals: LocalStorage = {
    tabsData,
  };
  return new Promise((resolve) => {
    chrome.storage.local.set(vals, () => {
      resolve();
    });
  });
}

export function getStoredTabData(): Promise<LocalStorageTabData> {
  const keys: LocalStorageKeys[] = ["tabsData"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result: LocalStorage) => {
      resolve(result.tabsData);
    });
  });
}
