import * as React from "react";
import {
  Box,
  List,
  ListItem,
  Button,
  ListItemIcon,
  ListItemText,
  Divider,
  Icon,
  Typography,
  Grid,
  IconButton,
  Paper,
} from "@material-ui/core";
import { TabGroupType, TabType } from "../../types/TabGroupType";
import TabComponent from "./TabComponent";
import { Tab } from "../../utils/storage";

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
      <Grid container direction="column" spacing={4}>
        <Grid item>
          <Box alignContent="left" px="3%" my="3%">
            <Typography variant="h5">{name}</Typography>
            <Typography variant="caption">{summary}</Typography>
            <Typography variant="body1">{type}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Divider />
      <Grid container direction="column" spacing={4}>
        <Grid item>
          <Box my="1%">
            <List>
              {tabs.map((tab, index: number) => {
                console.log(`Index is inside map ${index}`);
                return (
                  <TabComponent
                    index={index}
                    id={tab.id}
                    title={tab.title}
                    keywords={tab.keywords}
                    type={tab.type}
                    url={tab.url}
                    windowId={tab.windowId}
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
    </Box>
  );
};
export default TabGroupComponent;
