import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, View, SafeAreaView, Text, Alert, NativeModules, NativeEventEmitter, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { ButtonGroup, ThemeProvider } from 'react-native-elements/dist/buttons/ButtonGroup';


export const RpcFunctionButton = ({options, onIndexChange, ...props}) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    updateIndex = (r) => {
        setSelectedIndex(r)
        onIndexChange(r)
    }

    return (
        <ButtonGroup
            onPress={updateIndex}
            selectedIndex={selectedIndex}
            buttons={options}
            textStyle={{color: "#909090"}}
            selectedTextStyle={{color: "black"}}
            // containerStyle={{height: 30}}
        />
    );
}