

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#include "MagicData.h"
#include "MagicHal.h"
#include "EEPROM.h"

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer;
MagicData magicData;
MagicHal magicHal;

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
                                         CHARACTERISTIC_UUID,
                                         BLECharacteristic::PROPERTY_READ |
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic->setCallbacks(new MyCallbacks());
  pCharacteristic->setValue(magicData.get().c_str());
  pService->start();
  
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Characteristic defined! Now you can read it in your phone!");
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

void initIO(){

}

void setup() {
  Serial.begin(115200);
  initEEPROM();
  initBLE();
  initIO();
}

uint8_t debugCount = 0;
void debugLog() {
  if (debugCount > 40) {
    magicHal.printTime();
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
    Serial.print("Key Pressed : ");
    Serial.println(key);
    enterKey += key;
    magicHal.buzzerKeyTone(KEY_TONE_MS);
    
    if (enterKey.length() >=4){
      if (enterKey == magicData.get()){
        magicHal.buzzerKeyTone(UNLOCK_TONE_MS);
      } else {
        magicHal.buzzerAlarm();
      }
      enterKey = "";
    } 
  }
}
