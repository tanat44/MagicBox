

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#include "MagicData.h"
#include "MagicHal.h"
#include "MagicUtil.h"
#include "EEPROM.h"

#define COMMAND_LEN 4


// BLE 
#define SERVICE_UUID  "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define C1_UUID       "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define C2_UUID       "beb5483e-36e1-4688-b7f5-ea0736as26a8"
BLEServer* pServer;

MagicData magicData;
MagicHal magicHal;
MagicUtil magicUtil(magicHal.getRtcPointer());

class MyCallbacks: public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    std::string value = pCharacteristic->getValue();
    String v (value.c_str());

    if (value.length() > 0)
    {
      Serial.print("BLE set value: ");
      Serial.println(v);
      magicData.setPassword(v);
    }
  }
};

class RpcCallbacks: public BLECharacteristicCallbacks
{
  void onWrite(BLECharacteristic *pCharacteristic)
  {
    std::string value = pCharacteristic->getValue();
    String str (value.c_str());
   
    if (str.length() == COMMAND_LEN)
    {
      String command = str.substring(0,COMMAND_LEN);
      String response = "";
      if (command == "TEST"){
        response = "RES|Rpc Working";
      }

      pCharacteristic->setValue(response.c_str());
      pCharacteristic->notify();
    } 
    else if (str.length() > COMMAND_LEN)
    {
      String command = str.substring(0, COMMAND_LEN);
      String value = str.substring(COMMAND_LEN, str.length());
      String response = "";
      // Add value
      if (command == "AVAL"){
        int v = value.toInt();
        response = "RES|" + String(v+1);
      }
      
      pCharacteristic->setValue(response.c_str());
      pCharacteristic->notify();
    } 
    else 
    {
      pCharacteristic->setValue(String("ERR|Command Error").c_str());
      pCharacteristic->notify();
    }
  }
};

class MyServerCallbacks: public BLEServerCallbacks
{
  void onDisconnect(BLEServer* pServer)
  {
    Serial.println("Disconnected");
    BLEDevice::startAdvertising();
  }
};

void initBLE() {
  Serial.println("Starting BLE work!");

  BLEDevice::init("MagicBox");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  
  BLEService *pService = pServer->createService(SERVICE_UUID);
  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         C1_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

 
  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->setValue(magicData.get().c_str());

  BLECharacteristic *characteristicRpc = pService->createCharacteristic(
                                       C2_UUID,
                                       BLECharacteristic::PROPERTY_READ |
                                       BLECharacteristic::PROPERTY_WRITE |
                                       BLECharacteristic::PROPERTY_NOTIFY
                                     );
  characteristicRpc->setCallbacks(new RpcCallbacks());
  characteristicRpc->setValue(String("Unknown").c_str());

  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
}

void initEEPROM() {
  while (!EEPROM.begin(1000)) {
    Serial.println("Failed to initialise EEPROM");
    Serial.println("Restarting...");
    delay(1000);
  }
  Serial.println("EEPROM initilize success");  
  magicData.load();
}

void setup() {
  setCpuFrequencyMhz(80);       // to reduce power consumption, default is at 240Mhz
  Serial.begin(115200);
  initEEPROM();
  initBLE();
}

uint8_t debugCount = 0;
uint8_t v = 50;

void debugLog() {
  
  if (debugCount > 40) {
    Serial.print("Connected Devices : ");
    Serial.println(pServer->getConnectedCount());
    Serial.println(magicData.get());
    debugCount = 0;
  } else {
    ++debugCount;
  }
}

String enterKey = "";

void loop() {
  delay(50);
  debugLog();
  
  char key = magicHal.keypad.getKey();
  if(key)
  {

    if (key == 'B'){
      magicHal.setLock(true);
    } else if (key == 'C') {
      magicHal.setLock(false);
    }
    
    Serial.print("Key Pressed : ");
    Serial.println(key);
    enterKey += key;
    magicHal.buzzerKeyTone(KEY_TONE_MS);
    
    if (enterKey.length() >=4){

      
      // UNLOCK
      if (enterKey == magicData.get()){
        magicHal.buzzerKeyTone(UNLOCK_TONE_MS);
        magicHal.setLock(false);
        
      // WRONG PASSWORD
      } else {
        magicHal.buzzerAlarm();
      }
      enterKey = "";
    } 
  }
}
