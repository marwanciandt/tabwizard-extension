import { OpenWeatherTempScale } from "../apis/weather_api";
import { TabsData } from "../sidepanel/sidepanel";
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
  title: string;
  keywords: string[];
  type: TabType;
  url: string;
  windowId: number;
}

export interface TabGroup {
  id: number;
  name: string;
  summary: string;
  type: TabGroupType;
  tabs?: Tab[];
}

export interface LocalStorageTabsData {
  tabGroups?: TabGroup[];
  tabs?: Tab[];
}

export interface LocalStorage {
  tabsData?: LocalStorageTabsData;
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
  tabsData: LocalStorageTabsData
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

export function getStoredTabsData(): Promise<LocalStorageTabsData> {
  const keys: LocalStorageKeys[] = ["tabsData"];

  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result: LocalStorage) => {
      resolve(result.tabsData);
    });
  });
}
