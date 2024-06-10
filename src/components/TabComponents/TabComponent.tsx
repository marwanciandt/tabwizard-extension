import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Link,
  ListItem,
  Typography,
} from "@material-ui/core";
import { TabType } from "../../types/TabGroupType";
import { getStoredTabsData } from "../../utils/storage";

type TabGroupState = "loading" | "error" | "ready";

const TabContainer: React.FC<{
  children: React.ReactNode;
  onDelete?: () => void;
}> = ({ children, onDelete }) => {
  return (
    <Grid container direction="column" spacing={4}>
      <Grid item>
        <Box my="1%">
          <Card>
            <CardContent>{children}</CardContent>
            <CardActions>
              {onDelete && (
                <Button color="secondary" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </CardActions>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
};

const TabComponent: React.FC<{
  title?: string;
  keywords?: string[];
  type?: TabType;
  url?: string;
  id?: number;
  index?: number;
  onDelete?: () => void;
}> = ({ title, keywords, type, url, id, index, onDelete }) => {
  const [description, setDescription] = React.useState<string>(
    "Description not set yet!"
  );

  useEffect(() => {
    console.debug("Updating description from llm");
    getStoredTabsData().then((storedTabs) => {
      storedTabs.tabs.forEach((tab, index) => {
        if (tab.id === id) {
          setDescription(tab.description);
        }
      });
      storedTabs.tabGroups.forEach((tabGroup, index) => {
        tabGroup.tabs.forEach((tab, index) => {
          if (tab.id === id) {
            setDescription(tab.description);
          }
        });
      });
    });
  }, [description]);

  return (
    <ListItem>
      <Button>
        <TabContainer onDelete={onDelete}>
          <CardContent>
            <Typography variant="h3">{index}</Typography>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="subtitle1">{keywords}</Typography>
            <Typography variant="subtitle2">{description}</Typography>
            <Typography variant="body1">{type}</Typography>
            <Typography variant="subtitle1">{id}</Typography>
            <Link href="{url}" variant="body2">
              More...
            </Link>
          </CardContent>
        </TabContainer>
      </Button>
    </ListItem>
  );
};

export default TabComponent;
