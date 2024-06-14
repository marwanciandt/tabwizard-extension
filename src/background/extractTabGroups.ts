import { TabData } from "../sidepanel/sidepanel";
import { STANDALONE_GROUP_NAME } from "../types/constants";
import { TabGroup } from "../utils/storage";
import { getAllTabs, fetchGroupTitles } from "./background";

export async function extractTabGroups(): Promise<TabData> {
  const groups: TabGroup[] = [];
  const tabs = await getAllTabs();
  const groupData = await fetchGroupTitles(tabs);
  groupData.push({ id: -1, title: STANDALONE_GROUP_NAME });

  tabs.forEach((tab, index) => {
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
        tabs: [tab],
        processed: false,
      };

      console.log(`Pushing new group to array ${newGroup.id}`);
      groups.push(newGroup);
    }
  });

  groups.sort((a, b) => b.id - a.id);

  return {
    tabGroups: groups,
  };
}
