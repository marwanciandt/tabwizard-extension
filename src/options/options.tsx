import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "fontsource-roboto";
import "./options.css";
import {
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Switch,
} from "@material-ui/core";
import {
  LocalStorageOptions,
  getStoredOptions,
  setStoredOptions,
} from "../utils/storage";

type FormState = "ready" | "saving";

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null);
  const [formState, setFormState] = useState<FormState>("ready");

  useEffect(() => {
    getStoredOptions().then((options) => setOptions(options));
  }, []);

  const handleHomeCityChange = (homeCity: string) => {
    setOptions({
      ...options,
      homeCity,
    });
  };

  const handleAutoOverlayChange = (hasAutoOverlay: boolean) => {
    setOptions({
      ...options,
      hasAutoOverlay,
    });
  };

  const handleSaveButtonClick = () => {
    setFormState("saving");
    setStoredOptions(options).then(() => {
      setTimeout(() => {
        setFormState("ready");
      }, 250);
    });
  };

  if (!options) {
    return null;
  }

  const isFieldsDisabled = formState === "saving";

  return (
    <Box mx="10%" my="2%">
      <Card>
        <CardContent>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Typography variant="h3">Weather Extension Options</Typography>
            </Grid>
            <Grid item>
              <Box my="1%">
                <Typography variant="body1">Home City</Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your home city..."
                  value={options.homeCity}
                  onChange={(event) => handleHomeCityChange(event.target.value)}
                  disabled={isFieldsDisabled}
                />
              </Box>
            </Grid>
            <Grid item>
              <Box my="1%">
                <Typography variant="body1">AutoOverlay</Typography>
                <Switch
                  color="primary"
                  onChange={(event, checked) =>
                    handleAutoOverlayChange(checked)
                  }
                  disabled={isFieldsDisabled}
                  checked={options.hasAutoOverlay}
                />
              </Box>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveButtonClick}
                disabled={isFieldsDisabled}
              >
                {formState === "ready" ? "Save" : "Saving..."}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
