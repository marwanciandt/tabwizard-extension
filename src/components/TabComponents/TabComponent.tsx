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
  processed: boolean;
  description: string;
  windowId?: number;
  groupId?: number;
  id?: number;
  tabIndex?: number;
  onDelete?: () => void;
}> = ({
  title,
  keywords,
  type,
  url,
  groupId,
  processed,
  description,
  windowId,
  id,
  tabIndex,
  onDelete,
}) => {
  // useEffect(() => {
  //   console.debug("Updating description from llm");
  //   getStoredTabsData().then((storedTabs) => {
  //     storedTabs.tabs.forEach((tab, index) => {
  //       if (tab.id === id) {
  //         setDescription(tab.description);
  //       }
  //     });
  //     storedTabs.tabGroups.forEach((tabGroup, index) => {
  //       tabGroup.tabs.forEach((tab, index) => {
  //         if (tab.id === id) {
  //           setDescription(tab.description);
  //         }
  //       });
  //     });
  //   });
  // }, []);

  return (
    <ListItem>
      <TabContainer onDelete={onDelete}>
        <CardContent>
          <Typography variant="subtitle1">Index: {tabIndex}</Typography>
          <Typography variant="h5">Title: {title}</Typography>
          <Typography variant="subtitle1">
            Processed: {processed && "true"}
          </Typography>
          <Typography variant="subtitle1">Groupid: {groupId}</Typography>
          <Typography variant="subtitle1">TabId: {id}</Typography>
          <Typography variant="subtitle1">
            Keywords: {keywords.join(",")}
          </Typography>
          <Typography variant="subtitle2">
            Description: {description}
          </Typography>
          <Typography variant="subtitle2">WindowId: {windowId}</Typography>
          <Typography variant="body1">Type: {type}</Typography>
          <Typography variant="body1">Link: {url}</Typography>
          {/* <Link href="{url}" variant="body2">
              More...
            </Link> */}
        </CardContent>
      </TabContainer>
    </ListItem>
  );
};

export default TabComponent;
