import * as React from "react";
import {
  Box,
  List,
  Divider,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@material-ui/core";
import { TabGroupType, TabType } from "../../types/TabGroupType";
import TabComponent from "./TabComponent";
import { Tab } from "../../utils/storage";
import { Add, ExpandMore } from "@material-ui/icons";

const TabGroupComponent: React.FC<{
  name: string;
  summary: string;
  type: TabGroupType;
  tabs?: Tab[];
  onDelete?: () => void;
}> = ({ name, summary, type, tabs, onDelete }) => {
  return (
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
            {name} ({tabs.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1">Summary: {summary}</Typography>
        </AccordionDetails>
        <AccordionDetails>
          <Typography variant="body1">Type: {type}</Typography>
        </AccordionDetails>
        <Divider />
        <Grid container direction="column" spacing={4}>
          <Grid item>
            <Box my="1%">
              <List>
                {tabs.map((tab, index: number) => {
                  return (
                    <TabComponent
                      id={tab.id}
                      title={tab.title}
                      keywords={tab.keywords}
                      groupId={tab.groupId}
                      type={tab.type}
                      key={index}
                      url={tab.url}
                      windowId={tab.windowId}
                      processed={tab.processed}
                      onDelete={() => {
                        console.log(`Index : ${index.valueOf()}`);
                      }}
                    />
                  );
                })}
              </List>
            </Box>
          </Grid>
        </Grid>
      </Accordion>
    </Box>
  );
};
export default TabGroupComponent;
