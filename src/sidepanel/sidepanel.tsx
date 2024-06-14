import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./sidepanel.css";
import "fontsource-roboto";
import { Box, Divider, TextField } from "@material-ui/core";
import {
  getStoredOptions,
  LocalStorageOptions,
  TabGroup,
  Tab,
  getStoredTabData,
  LocalStorageTabData,
} from "../utils/storage";
import { TabGroupComponent } from "../components/TabComponents";

export interface TabData {
  tabGroups: TabGroup[];
}

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null);
  const [tabData, setTabData] = useState<LocalStorageTabData>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    getStoredTabData()
      .then((tabData) => {
        setTabData(tabData);
      })
      .catch((error) => {
        console.error("Failed to load options:", error);
      });
  }, [tabData]);

  if (!tabData) {
    return null;
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filtering tab groups and tabs within each group
  const filteredTabGroups = tabData.tabGroups
    .map((tabGroup) => ({
      ...tabGroup,
      tabs: tabGroup.tabs.filter((tab) =>
        tab.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((tabGroup) => tabGroup.tabs.length > 0);

  return (
    <Box>
      <Box>
        <TextField
          label="Search Tabs"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          margin="normal"
        />
      </Box>
      {filteredTabGroups.map((tabGroup, index) => (
        <React.Fragment key={index}>
          <TabGroupComponent
            name={tabGroup.name}
            summary={tabGroup.summary}
            type={tabGroup.type}
            tabs={tabGroup.tabs}
            key={index}
            onDelete={() => {
              console.log(`Index groups in sidePanel : ${index}`);
            }}
          />
          {index < tabData.tabGroups.length - 1 && <Divider />}
        </React.Fragment>
      ))}
      <Box height="16px" />
    </Box>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
