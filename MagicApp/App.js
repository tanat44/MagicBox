import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Alert, NativeModules, NativeEventEmitter, ActivityIndicator, Platform, PermissionsAndroid, TextInput } from 'react-native';
import { Card, ListItem, Button, Header } from 'react-native-elements'

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Buffer } from 'buffer';
import { stringToBytes } from "convert-string";
import BleManager from 'react-native-ble-manager';
import { ConnectStatus } from './Component/ConnectStatus';
import { RpcFunctionButton } from './Component/RpcFunctionButton';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BLE_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const BLE_C1_UUID      = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const BLE_C2_UUID      = "beb5483e-36e1-4688-b7f5-ea0736ac26a8";
const RPC_FUNCTION = ["TEST", "AVAL"]

const Separator = () => (
  <View style={styles.separator} />
);

const App = () => {
  // MAGIC BOX
  const [userCode, setUserCode] = useState("");
  const [inputText, setInputText] = useState("")
  const [functionIndex, setFunctionIndex] = useState(0)
  const [functionReturn, setFunctionReturn] = useState("")

  // BLE
  const [scanning, setScanning] = useState(false);
  const [devices, _setDevices] = useState([]);
  const devicesRef = React.useRef(devices);
  const setDevices = data => {
    devicesRef.current = data;
    _setDevices(data);
  };
  const [connected, setConnected] = useState(false)

  const startScan = () => {
    if (!scanning) {
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        setDevices([]);
        setScanning(true);
      }).catch(err => {
        console.error(err);
      });
    }    
  }

  const handleStopScan = () => {
    console.log('Scan stopped');
    setScanning(false);

    // Keep only unique devices
    let uniqueId = []
    let uniqueDevices = []
    devicesRef.current.map(d => {
      if (!uniqueId.includes(getDeviceId(d))) {
        uniqueDevices.push(d)
        uniqueId.push(getDeviceId(d))
      }
      return d      
    })

    if (uniqueDevices.length === 0) {
      console.log('Cant find MagicBox')
      return;
    }

    console.log('found ', uniqueDevices.length, ' magicBoxes')
    setDevices(uniqueDevices)

    // connect
    connectDevice(getDeviceId(uniqueDevices[0]))
  }

  const connectDevice = (deviceId) => {
    BleManager.connect(deviceId).then(() => {
      setTimeout(() => {
        BleManager.retrieveServices(deviceId).then((peripheralData) => {
          console.log('Peripheral Data', peripheralData)
          setDevices([peripheralData]);
        });
      }, 900);
  })}

  const handleDisconnectedPeripheral = (data) => {
    console.log("Handle disconnect", data)
    setDevices([])
    setConnected(false)
  }

  const handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  const handleDiscoverPeripheral = (peripheral) => {
    if (peripheral && peripheral.advertising && peripheral.advertising.serviceUUIDs) {
      let out = peripheral.advertising.serviceUUIDs.filter( x => x === BLE_SERVICE_UUID)
      if (out.length > 0) {
        setDevices([...devicesRef.current, peripheral])
      } 
    }
  }

  const getDeviceId = (peripheral) => {
    if (!peripheral || !peripheral.id)
      return null
    return peripheral.id
  }

  useEffect(() => {
    BleManager.start({showAlert: false});

    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
          if (result) {
            console.log("Permission is OK");
          } else {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
              if (result) {
                console.log("User accept");
              } else {
                console.log("User refuse");
              }
            });
          }
      });
    }  
    
    return (() => {
      console.log('unmount');
      bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan );
      bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
      bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
    })
  }, []);

  useEffect(()=>{
    if (devices.length === 1) {
      setConnected(true);
    }
  }, [devices])


  const mbSetUserCode = () => {
    const deviceId = getDeviceId(devices[0])
    setTimeout(() => {
      BleManager.write(deviceId, BLE_SERVICE_UUID, BLE_C1_UUID, stringToBytes(userCode)).then(() => {
        console.log('Writed');
      });
    }, 500);
  }

  const mbCallFunction = () => {
    const deviceId = getDeviceId(devices[0])
    setTimeout(() => {
      BleManager.write(deviceId, BLE_SERVICE_UUID, BLE_C2_UUID, stringToBytes(RPC_FUNCTION[functionIndex]+inputText)).then(() => {
        console.log('Writed');
        BleManager.read(deviceId, BLE_SERVICE_UUID, BLE_C2_UUID).then((readData) => {
          const buffer = Buffer.from(readData); 
          const data = buffer.toString();
          setFunctionReturn(data)
        })
        .catch((error) => {
          // Failure code
          console.log(error);
        });
      });
    }, 500);
  }

  const mbReadUserCode = () => {
    const deviceId = getDeviceId(devices[0])
    console.log('reading user code')
    setTimeout(() => {
      BleManager.read(deviceId, BLE_SERVICE_UUID, BLE_C1_UUID).then((readData) => {
        const buffer = Buffer.from(readData); 
        const data = buffer.toString();
        setUserCode(data)
      })
    }, 500);
  }

  const onUserCodeChange = (newCode) => {
    newCode = newCode.replace(/\D/g,'');
    if (newCode.length > 4) {
      newCode = newCode.substring(0,4);
    }
    setUserCode(newCode)
  }

  rpcFunctionChanged = (index) => {
    setFunctionIndex(index)
    setFunctionReturn("")
    setInputText("")
  }

  return (
  <SafeAreaProvider>
  <Header
    centerComponent={{ text: 'MagicBox', style: { color: '#fff' } }}
  />
  <View style={{flexDirection: 'column', alignItems: 'center'}}>

    <Card containerStyle={styles.card}>
      <Card.Title>Connection</Card.Title>
      <Card.Divider/>
      <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30}}>
        <View style={styles.fixToText}>
          {connected ? 
            <Button style={styles.button} title="Disconnect" onPress={()=>BleManager.disconnect(getDeviceId(devices[0]), false)} />
            :
            <Button style={styles.button} title="Connect MagicBox" onPress={()=>startScan()} />
          }
          
        </View>
        <ConnectStatus connected={connected} scanning={scanning}/>
      </View>
    </Card>

    {connected && <Card containerStyle={styles.card}>
      <Card.Title>User Code</Card.Title>
      <Card.Divider/>
      <View style={styles.row}>
        <Text>Value</Text>
        <TextInput
          style={{...styles.input, flex: 1}}
          onChangeText={onUserCodeChange}
          value={userCode}
        />
      </View>
      <View style={styles.row}>
        <View style={{...styles.fixToText, paddingHorizontal: 10}}>
          <Button style={styles.button}
              title="Update"
              onPress={()=>mbSetUserCode()}
            />
        </View>
        <View style={styles.fixToText}>
          <Button style={styles.button}
              title="Read"
              onPress={()=>mbReadUserCode()}
            />
        </View>
      </View>
    </Card>
    }

  {connected && <Card containerStyle={styles.card}>
      <Card.Title>RPC</Card.Title>
      <Card.Divider/>
      <RpcFunctionButton options={RPC_FUNCTION} onIndexChange={rpcFunctionChanged}/>
      <View style={styles.row}>
        <Text>Parameter</Text>
        <TextInput
          style={{...styles.input, flex: 1}}
          onChangeText={(text) => setInputText(text)}
          value={inputText}
        />
      </View>
      <View style={styles.row}>
        <Text>Return Value</Text>
        <TextInput
          style={{...styles.input, flex: 1}}
          value={functionReturn}
          editable={false}
        />
      </View>
      <Button style={styles.button}
          title="Call Function"
          onPress={()=>mbCallFunction()}
          disabled={!connected}
        />
    </Card>
    }

  </View>
  </SafeAreaProvider>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    backgroundColor: '#A9A9A9',
    paddingVertical: 20,
    fontSize: 20,
    width: '100%'
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  separator: {
    marginVertical: 8,
    borderBottomColor: '#737373',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  row: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 30
  },
  card: {
    width: "100%"
  }

});

export default App;