export const EV_CHROME_EXTENSION_INSTALLED: string =
  "ev_chromne_extension_installed";
export const EV_CRHOME_EXTENSION_UNINSTALLED: string =
  "ev_crhome_extension_uninstalled";
export const EV_TAB_OPENED: string = "ev_tab_opened";
export const EV_TAB_CLOSED: string = "ev_tab_closed";
export const EV_TAB_PROCESSED: string = "ev_tab_processed";
export const EV_TAB_UPDATED: string = "ev_tab_updated";
export const EV_ALARM_: string = "ev_alarm_";
export const EV_DATA_STORED_SUCCESS: string = "ev_data_stored_success";
export const EV_DATA_STORED_FAIL: string = "ev_data_stored_fail";
export const EV_TAB_GROUP_CREATED: string = "ev_tab_group_created";
export const EV_TAB_GROUP_DESTROYED: string = "ev_tab_group_destroyed";
export const EV_TAB_GROUP_UPDATED: string = "ev_tab_group_updated";
export const EV_USER_TAB_PROCESS_ACTION: string = "ev_user_tab_process_action";

export type EV_MSG_TYPE =
  | typeof EV_CHROME_EXTENSION_INSTALLED
  | typeof EV_CRHOME_EXTENSION_UNINSTALLED
  | typeof EV_TAB_OPENED
  | typeof EV_TAB_CLOSED
  | typeof EV_TAB_PROCESSED
  | typeof EV_TAB_UPDATED
  | typeof EV_ALARM_
  | typeof EV_DATA_STORED_SUCCESS
  | typeof EV_DATA_STORED_FAIL
  | typeof EV_TAB_GROUP_CREATED
  | typeof EV_TAB_GROUP_DESTROYED
  | typeof EV_TAB_GROUP_UPDATED
  | typeof EV_USER_TAB_PROCESS_ACTION;
