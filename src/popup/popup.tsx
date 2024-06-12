import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./popup.css";
import "fontsource-roboto";
import WeatherCard from "../components/WeatherCard";
import { Grid, InputBase, IconButton, Paper, Box } from "@material-ui/core";
import {
  Add as AddIcon,
  PictureInPicture as PictureInPictureIcon,
} from "@material-ui/icons";
import {
  setStoredOptions,
  getStoredOptions,
  LocalStorageOptions,
} from "../utils/storage";
import { MessageRequests } from "../types/messages";

const App: React.FC<{}> = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [cityInput, setCityInput] = useState<string>("");
  const [options, setOptions] = useState<LocalStorageOptions | null>(null);

  useEffect(() => {
    getStoredOptions().then((options) => setOptions(options));
  }, []);

  const handleCityButtonClick = () => {
    if (cityInput === "") {
      return;
    }
    const updatedCities = [...cities, cityInput];
  };

  const handleToggleTempSCaleButtonClick = () => {
    const updatedOptions: LocalStorageOptions = {
      ...options,
      tempScale: options.tempScale === "metric" ? "imperial" : "metric",
    };
    setStoredOptions(updatedOptions).then(() => {
      setOptions(updatedOptions);
    });
  };

  const handleToggleAutoOverlayClick = () => {
    chrome.tabs.query(
      {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT,
      },
      (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            message: MessageRequests.REQ_TOGGLE_OVERLAY,
          });
        }
      }
    );
  };

  if (!options) {
    return null;
  }

  return (
    <Box mx="8px" my="16px">
      <Grid container justifyContent="space-evenly">
        <Grid item>
          <Paper>
            <Box py="5px">
              <IconButton onClick={handleToggleAutoOverlayClick}>
                <PictureInPictureIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <Box height="16px" />
    </Box>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
