import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, View, SafeAreaView, Text, Alert, NativeModules, NativeEventEmitter, ActivityIndicator, Platform, PermissionsAndroid, TextInput } from 'react-native';

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

    console.log(devicesRef.current)

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
          console.log("p", peripheralData)
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
    if (userCode.length != 4){
      alert("User code must be 4 digits")
      return
    }

  }

  const mbCallFunction = () => {
    const deviceId = getDeviceId(devices[0])
    setTimeout(() => {
      BleManager.write(deviceId, BLE_SERVICE_UUID, "beb5483e-36e1-4688-b7f5-ea0736ac26a8", stringToBytes(RPC_FUNCTION[functionIndex]+inputText)).then(() => {
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
    // setTimeout(() => {
    //   BleManager.startNotification(deviceId, BLE_SERVICE_UUID, "beb5483e-36e1-4688-b7f5-ea0736ac26a8").then(() => {
    //     console.log('Started notification');
    //     setTimeout(() => {
    //       BleManager.write(deviceId, BLE_SERVICE_UUID, "beb5483e-36e1-4688-b7f5-ea0736ac26a8", stringToBytes(inputText)).then(() => {
    //         console.log('Writed');
    //       });
    //     }, 500);
    //   }).catch((error) => {
    //     console.log('Notification error', error);
    //   });
    // }, 200);
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
  <View style={{flexDirection: 'column', alignItems: 'center'}}>
    <Text style={styles.title}>BLE Connection</Text>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 20, alignItems: "stretch"}}>
      <View style={styles.fixToText}>
        {connected ? 
          <Button style={styles.button} title="Disconnect" onPress={()=>BleManager.disconnect(getDeviceId(devices[0]), false)} />
          :
          <Button style={styles.button} title="Connect MagicBox" onPress={()=>startScan()} />
        }
        
      </View>
      <ConnectStatus connected={connected} scanning={scanning}/>
    </View>

    <Text style={styles.title}>MagicBox Function</Text>


    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30}}>
      <Text>New User Code</Text>
      <TextInput
        style={{...styles.input, flex: 1}}
        onChangeText={onUserCodeChange}
        value={userCode}
      />
    </View>
    <View style={styles.fixToText} pointerEvents={connected ? 'none':'auto'}>
      <Button style={styles.button}
          title="Set User Code"
          onPress={()=>mbSetUserCode()}
          disabled={!connected}
        />
    </View>
    <Separator/>

    <RpcFunctionButton options={RPC_FUNCTION} onIndexChange={rpcFunctionChanged}/>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30}}>
      <Text>Parameter</Text>
      <TextInput
        style={{...styles.input, flex: 1}}
        onChangeText={(text) => setInputText(text)}
        value={inputText}
      />
    </View>
    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30}}>
      <Text>Return</Text>
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

});

export default App;