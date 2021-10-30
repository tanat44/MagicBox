import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, View, SafeAreaView, Text, Alert, NativeModules, NativeEventEmitter, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';

export const ConnectStatus = (props) => {
    return (
        <View style={{ justifyContent: 'center', alignItem: 'center', backgroundColor: `${props.connected ? "green" : "none"}`, flex: 1 }}>
            {props.scanning ?
                <ActivityIndicator size="large" color="#0000ff" />
                :
                <Text style={{ textAlign: 'center', color: `${props.connected ? "white" : "gray"}`}}>{props.connected ? "Device connected" : "No connection"} </Text>
            }

        </View>
    );
}