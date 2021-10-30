/**
 * @format
 */

// import {AppRegistry} from 'react-native';
// import App from './App';
import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);

import React, { Component } from "react";
import { AppRegistry } from "react-native";
import App from "./App"; //<-- simply point to the example js!

AppRegistry.registerComponent(appName, () => App);