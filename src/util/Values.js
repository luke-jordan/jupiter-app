import Constants from 'expo-constants';

export const Colors = {
  BLACK : "#000000",
  PURPLE : "#5353A1",
  PURPLE_TRANSPARENT : "#5353A122",
  LIGHT_BLUE : "#35BAD5",
  GRAY : "#D8D8D8",
  DARK_GRAY : "#4D565B",
  MEDIUM_GRAY : "#787F83",
  LIGHT_GRAY : "#EDEDF5",
  YELLOW : "#FBC943",
  RED : "#CE0D25",
  BACKGROUND_GRAY : "#F4F6F8",
  TRANSPARENT_BACKGROUND : "#212C3299",
  WHITE : '#FFFFFF'
};

export const Sizes = {
  VISIBLE_NAVIGATION_BAR_HEIGHT : 50,
  NAVIGATION_BAR_HEIGHT : 80,
};

const isMaster = Constants.manifest.releaseChannel == "master";

export const Endpoints = isMaster ? {
  //MASTER
  AUTH : "https://master-auth.jupiterapp.net/",
  CORE : "https://master.jupiterapp.net/",
  SENTRY : "https://db1d92497e7f4c9ba161dedad72db0ac@sentry.io/1803441",
  AMPLITUDE : "1ffeafa710818ebcbf1942bf26620f49",
} : {
  //STAGING
  AUTH : "https://staging-auth.jupiterapp.net/",
  CORE : "https://staging.jupiterapp.net/",
  SENTRY : "https://10565b8e18354b6ebd0a767b7a0e1f19@sentry.io/1546052",
  AMPLITUDE : "80b9b8a9b4bf0b6c4bdff7782cf85af2",
}
