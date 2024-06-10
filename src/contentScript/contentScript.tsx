import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import WeatherCard from "../components/WeatherCard";
import "./contentScript.css";
import { Card } from "@material-ui/core";
import { getStoredOptions, LocalStorageOptions } from "../utils/storage";
import { Messages } from "../utils/messages";
import {
  extractKeywords,
  extractTextContent,
  preprocessText,
} from "../utils/webcontent";

const App: React.FC<{}> = () => {
  const [options, setOptions] = useState<LocalStorageOptions | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    getStoredOptions().then((options) => {
      setOptions(options);
      setIsActive(options.hasAutoOverlay);
    });
  }, []);

  const handleMessages = (msg: Messages) => {
    if (msg === Messages.TOGGLE_OVERLAY) {
      setIsActive(!isActive);
    }
  };

  useEffect(() => {
    chrome.runtime.onMessage.addListener(handleMessages);
    return () => {
      // clean up event listener, bug fix from: https://www.udemy.com/course/chrome-extension/learn/#questions/14694484/
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, [isActive]);

  (async () => {
    const pageText = extractKeywords(preprocessText(extractTextContent()));

    const pageMetaElement: Element = document.querySelector(
      'head meta[name="description"]'
    );

    const metaDescription = extractKeywords(
      preprocessText(pageMetaElement["content"])
    );

    const keywords = pageText.join(", ") + " " + metaDescription.join(", ");

    console.log(`Sending PROCESS_TAB_META message with keywords; ${keywords}`);

    const response = await chrome.runtime.sendMessage({
      type: Messages.PROCESS_TAB_META,
      keywords: keywords,
    });

    console.log(response);
  })();

  if (!options) {
    return null;
  }

  return (
    <>
      {/* {isActive && (
        <Card className="overlayCard">
          <WeatherCard
            city={options.homeCity}
            tempScale={options.tempScale}
            onDelete={() => setIsActive(false)}
          />
        </Card>
      )} */}
    </>
  );
};

const root = document.createElement("div");
document.body.appendChild(root);
ReactDOM.render(<App />, root);
