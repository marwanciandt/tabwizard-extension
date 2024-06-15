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
    const pageText = extractKeywords(preprocessText(extractTextContent()));
    const pageMetaElement: Element = document.querySelector(
      'head meta[name="description"]'
    );
    const metaDescription: string[] = extractKeywords(
      preprocessText(pageMetaElement["content"])
    );
    const keywords: string[] = pageText.concat(metaDescription);
    data.keywords = keywords.filter(
      (item, index) => keywords.indexOf(item) === index
    );
  }

  // if (hasRequest(message.msg_type, MessageRequests.REQ_CONTENT_DESCRIPTION)) {
  //   data.description = "LLM provided description";
  // }

  const response: MessageResponse = {
    msg_type:
      MessageResponses.RESP_CONTENT_DESCRIPTION |
      MessageResponses.RESP_CONTENT_KEYWORDS,
    data: {
      keywords: data.keywords,
      tab_id: 1,
      tab_url: "https://url.com",
    },
  };
  sendResponse(response);

  return true;
});

// chrome.runtime.onConnect.addListener(function (port) {
//   console.assert(port.name === TAB_MSG_CHANNEL);
//   port.onMessage.addListener(function (msg) {
//     port.postMessage(message);
//   });
// });
