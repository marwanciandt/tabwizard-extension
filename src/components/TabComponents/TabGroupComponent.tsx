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
import {
  Tab as TabIcon,
  Dns as TabGroupIcon,
  Assistant as SmartGroupIcon,
  PictureInPicture as PictureInPictureIcon,
} from "@material-ui/icons";
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
  const defaultGroupData = {
    name: name,
    summary: summary,
    type: type,
    tabs: tabs,
  };

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
          <Box my="1%">
            <Typography variant="body1">{name}</Typography>
            <Typography variant="body1">{summary}</Typography>
            <Typography variant="body1">{type}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Divider />
      <List>
        {tabs.map((tab, index) => (
          <TabComponent
            title={tab.title}
            keywords={tab.keywords}
            type={tab.type}
            url={tab.url}
            key={index}
            onDelete={() => {
              console.log(`Index : ${index}`);
            }}
          />
        ))}
      </List>
    </Box>
  );
};
export default TabGroupComponent;
