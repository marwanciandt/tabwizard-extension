import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./sidepanel.css";
import "fontsource-roboto";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Grid,
  List,
  Typography,
} from "@material-ui/core";
import {
  getStoredOptions,
  LocalStorageOptions,
  TabGroup,
  Tab,
  getStoredTabsData,
  LocalStorageTabsData,
} from "../utils/storage";
import { TabComponent, TabGroupComponent } from "../components/TabComponents";
import { ExpandMore } from "@material-ui/icons";

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
        console.log(tabsData);
      })
      .catch((error) => {
        console.error("Failed to load options:", error);
      });
  }, [tabsData]);

  if (!tabsData) {
    return null;
  }

  return (
    <Box>
      {tabsData.tabGroups.map((tabGroup, index) => (
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
          {index < tabsData.tabGroups.length - 1 && <Divider />}
        </React.Fragment>
      ))}
      <Divider />
      <Box
        sx={{
          width: "100%",
          bgcolor: "background.paper",
          border: "2px",
          borderRadius: "15px",
        }}
      >
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography variant="h5">
              Standalone ({tabsData.tabs.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">Default group</Typography>
          </AccordionDetails>
          <Divider />
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Box my="1%">
                <List>
                  {tabsData.tabs.map((tab, index) => (
                    <TabComponent
                      title={tab.title}
                      id={tab.id}
                      keywords={tab.keywords}
                      type={tab.type}
                      url={tab.url}
                      index={index}
                      groupId={tab.groupId}
                      processed={tab.processed}
                      windowId={tab.windowId}
                      onDelete={() => {
                        console.log(`Index tabs in sidePanel : ${index}`);
                      }}
                    />
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Accordion>
      </Box>
      <Box height="16px" />
    </Box>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
