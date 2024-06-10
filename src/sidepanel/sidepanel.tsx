import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./sidepanel.css";
import "fontsource-roboto";
// import SidePanel from "../components/SidePanelList";
import {
  Grid,
  InputBase,
  IconButton,
  Paper,
  Box,
  Divider,
  Button,
} from "@material-ui/core";
import {
  setStoredOptions,
  getStoredOptions,
  LocalStorageOptions,
  TabGroup,
  Tab,
  getStoredTabsData,
  LocalStorageTabsData,
} from "../utils/storage";

import { TabComponent, TabGroupComponent } from "../components/TabComponents";

export interface TabsData {
  tabGroups: TabGroup[];
  tabs: Tab[];
}

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null);
  const [tabsData, setTabsData] = useState<LocalStorageTabsData>(null);

  useEffect(() => {
    console.log("Fetching stored options...");
    getStoredOptions()
      .then((options) => {
        console.log("Options fetched:", options);
        setOptions(options);
      })
      .catch((error) => {
        console.error("Failed to load options:", error);
      });
  }, []);

  useEffect(() => {
    console.log("Fetching stored tabs data...");
    getStoredTabsData()
      .then((tabsData) => {
        console.log("Setting tab data:");
        setTabsData(tabsData);
      })
      .catch((error) => {
        console.error("Failed to load options:", error);
      });
  }, [tabsData]);

  if (!options || !tabsData) {
    return null;
  }

  return (
    <Box>
      {tabsData.tabGroups.map((tabGroup, index) => (
        <Button>
          <TabGroupComponent
            name={tabGroup.name}
            summary={tabGroup.summary}
            type={tabGroup.type}
            tabs={tabGroup.tabs}
            key={index}
            onDelete={() => {
              console.log(`Index : ${index}`);
            }}
          />
        </Button>
      ))}
      <Divider />
      {tabsData.tabs.map((tab, index) => (
        <TabComponent
          title={tab.title}
          id={tab.id}
          keywords={tab.keywords}
          type={tab.type}
          url={tab.url}
          key={index}
          onDelete={() => {
            console.log(`Index : ${index}`);
          }}
        />
      ))}
      <Box height="16px" />
    </Box>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
