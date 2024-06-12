export enum MessageRequests {
  REQ_CONTENT_KEYWORDS = 1 << 0, // 1 (2^0, binary 0001)
  REQ_CONTENT_DESCRIPTION = 1 << 1, // 2 (2^1, binary 0010)
  REQ_TOGGLE_OVERLAY = 1 << 2, // 4 (2^2, binary 0100)
  REQ_PROCESS_TAB_META = 1 << 3, // 8 (2^3, binary 1000)
}

export enum MessageResponses {
  RESP_CONTENT_KEYWORDS = 1 << 0, // 1 (2^0, binary 0001)
  RESP_CONTENT_DESCRIPTION = 1 << 1, // 2 (2^1, binary 0010)
}

export const TAB_MSG_CHANNEL: string = "tab_msg_channel";

// Function to check if a specific permission is set
export function hasRequest(
  msgRequests: MessageRequests,
  request: MessageRequests
): boolean {
  return (msgRequests & request) !== 0;
}

export interface TabContentMessageData {
  tab_id: number;
  tab_url: string;
  keywords?: string[];
  description?: string;
}

export interface MessageRequest {
  msg_type: MessageRequests;
  data?: TabContentMessageData;
}

export interface MessageResponse {
  msg_type: MessageResponses;
  data: TabContentMessageData;
}
