#include <Keypad.h>
#define BUZZER_PIN 23
#define KEY_TONE_MS 100
#define UNLOCK_TONE_MS 500

#define PASSWORD "1357"

String enterKey = "";

const byte ROWS = 4; // Four rows
const byte COLS = 4; // Three columns

char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

byte rowPins[ROWS] = { 25,26,27,14 };
byte colPins[COLS] = { 12,13,32,33 }; 

Keypad kpd = Keypad( makeKeymap(keys), rowPins, colPins, ROWS, COLS );

void setup()
{
  Serial.begin(115200);
  Serial.println("Starting");
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);   // LOW to on the buzzer
}

void playKeyTone(int ms){
  digitalWrite(BUZZER_PIN, LOW);
  delay(ms);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(ms);
}

void alarm(){
  for (uint8_t i=0; i < 10; ++i){
    playKeyTone(KEY_TONE_MS); 
  }
}

void loop()
{
  char key = kpd.getKey();
  if(key)  // Check for a valid key.
  {
    Serial.println(key);
    enterKey += key;
    playKeyTone(KEY_TONE_MS);
    
    if (enterKey.length() >=4){
      if (enterKey == PASSWORD){
        playKeyTone(UNLOCK_TONE_MS);
      } else {
        alarm();
      }
      enterKey = "";
    } 
  }
  delay(50);
}


///*
//    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleServer.cpp
//    Ported to Arduino ESP32 by Evandro Copercini
//    updates by chegewara
//*/
//
//#include <BLEDevice.h>
//#include <BLEUtils.h>
//#include <BLEServer.h>
//
//#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
//#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
//
//void setup() {
//  Serial.begin(115200);
//  Serial.println("Starting BLE work!");
//
//  BLEDevice::init("Long name works now");
//  BLEServer *pServer = BLEDevice::createServer();
//  BLEService *pService = pServer->createService(SERVICE_UUID);
//  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
//                                         CHARACTERISTIC_UUID,
//                                         BLECharacteristic::PROPERTY_READ |
//                                         BLECharacteristic::PROPERTY_WRITE
//                                       );
//
//  pCharacteristic->setValue("Hello World says Neil");
//  pService->start();
//  // BLEAdvertising *pAdvertising = pServer->getAdvertising();  // this still is working for backward compatibility
//  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
//  pAdvertising->addServiceUUID(SERVICE_UUID);
//  pAdvertising->setScanResponse(true);
//  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issue
//  pAdvertising->setMinPreferred(0x12);
//  BLEDevice::startAdvertising();
//  Serial.println("Characteristic defined! Now you can read it in your phone!");
//}
//
//void loop() {
//  // put your main code here, to run repeatedly:
//  delay(2000);
//}
