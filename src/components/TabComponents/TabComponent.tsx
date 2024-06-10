import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  ListItem,
  Typography,
} from "@material-ui/core";
import { queryLLM } from "../../apis/llm_api";
import { TabType } from "../../types/TabGroupType";

type TabGroupState = "loading" | "error" | "ready";

const TabContainer: React.FC<{
  children: React.ReactNode;
  onDelete?: () => void;
}> = ({ children, onDelete }) => {
  return (
    <Box mx={"4px"} my={"16px"}>
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
  );
};

const TabComponent: React.FC<{
  title?: string;
  keywords?: string[];
  type?: TabType;
  url?: string;
  onDelete?: () => void;
}> = ({ title, keywords, type, url, onDelete }) => {
  const [cardState, setCardState] = useState<TabGroupState>("loading");

  useEffect(() => {
    queryLLM("weather holiday greece flight ticket sunscreen boat trip")
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <ListItem>
      <Button>
        <TabContainer onDelete={onDelete}>
          <CardContent>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body1">{keywords}</Typography>
            <Typography variant="body1">{type}</Typography>
            <Typography variant="body1">{url}</Typography>
          </CardContent>
        </TabContainer>
      </Button>
    </ListItem>
  );
};

export default TabComponent;
