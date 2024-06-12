import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./contentScript.css";
import { getStoredOptions, LocalStorageOptions } from "../utils/storage";
import {
  extractKeywords,
  extractTextContent,
  preprocessText,
} from "../utils/webcontent";
import {
  MessageRequest,
  MessageRequests,
  MessageResponse,
  MessageResponses,
  TAB_MSG_CHANNEL,
  TabContentMessageData,
  hasRequest,
} from "../types/messages";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const data: TabContentMessageData = {
    keywords: [],
    description: "",
    tab_id: -1,
    tab_url: "",
  };

  const message: MessageRequest = request.message;

  console.log(`Received message ${message.msg_type} from ${sender.id}`);
  if (hasRequest(message.msg_type, MessageRequests.REQ_CONTENT_KEYWORDS)) {
    // Get keywords
    data.keywords = ["keyword1", "keyword2"];
  } else if (
    hasRequest(message.msg_type, MessageRequests.REQ_CONTENT_DESCRIPTION)
  ) {
    // Get description
    data.description = "LLM provided description";
  }

  const response: MessageResponse = {
    msg_type:
      MessageResponses.RESP_CONTENT_DESCRIPTION |
      MessageResponses.RESP_CONTENT_KEYWORDS,
    data: {
      keywords: data.keywords,
      description: data.description,
      tab_id: 1,
      tab_url: "https://url.com",
    },
  };
  sendResponse(response);

  return true;
});

// const App: React.FC<{}> = () => {
//   const [options, setOptions] = useState<LocalStorageOptions | null>(null);
//   const [isActive, setIsActive] = useState<boolean>(false);

//   useEffect(() => {
//     getStoredOptions().then((options) => {
//       setOptions(options);
//       setIsActive(options.hasAutoOverlay);
//     });
//   }, []);

// useEffect(() => {
//   chrome.runtime.onMessage.addListener(handleMessages);
//   return () => {
//     // clean up event listener, bug fix from: https://www.udemy.com/course/chrome-extension/learn/#questions/14694484/
//     chrome.runtime.onMessage.removeListener(handleMessages);
//   };
// }, [isActive]);

// (async () => {
//   const pageText = extractKeywords(preprocessText(extractTextContent()));

//   const pageMetaElement: Element = document.querySelector(
//     'head meta[name="description"]'
//   );

//   const metaDescription = extractKeywords(
//     preprocessText(pageMetaElement["content"])
//   );

//   const keywords = pageText.join(", ") + " " + metaDescription.join(", ");

//   console.log(`Sending PROCESS_TAB_META message with keywords; ${keywords}`);
// })

// const root = document.createElement("div");
// document.body.appendChild(root);
// ReactDOM.render(<App />, root);

// chrome.runtime.onConnect.addListener(function (port) {
//   console.assert(port.name === TAB_MSG_CHANNEL);
//   port.onMessage.addListener(function (msg) {
//     port.postMessage(message);
//   });
// });
