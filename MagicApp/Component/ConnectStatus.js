import React, { useState, useEffect } from 'react';
import { Text, LinearProgress } from 'react-native-elements'

export const ConnectStatus = (props) => {
    return (
        <React.Fragment>
            {props.scanning && !props.connected &&  <LinearProgress color="primary" />}
            {props.connected && <Text style={{ textAlign: 'center', color: "white", backgroundColor: "springgreen"}}>Connected</Text>}
        </React.Fragment>
    );
}