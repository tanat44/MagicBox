#include "MagicHal.h"

char MagicHal::keys[KEYPAD_ROW][KEYPAD_COL] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

byte MagicHal::rowPins[KEYPAD_ROW] = { 25,26,27,14 };
byte MagicHal::colPins[KEYPAD_COL] = { 12,13,32,33 }; 

MagicHal::MagicHal() : keypad(makeKeymap(keys), rowPins, colPins, KEYPAD_ROW, KEYPAD_COL)
{
  // BUZZER
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH);   // LOW to on the buzzer  

  // SERVO
  servo.attach(SERVO_PIN);
  
  // RTC
  rtc.begin();  
  rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
}

void MagicHal::buzzerKeyTone(int ms){
  digitalWrite(BUZZER_PIN, LOW);
  delay(ms);
  digitalWrite(BUZZER_PIN, HIGH);
  delay(ms);
}

void MagicHal::buzzerAlarm(){
  for (uint8_t i=0; i < 10; ++i){
    buzzerKeyTone(KEY_TONE_MS); 
  }
}

void MagicHal::printTime() {
    DateTime now = rtc.now();

    Serial.print(now.year(), DEC);
    Serial.print('/');
    Serial.print(now.month(), DEC);
    Serial.print('/');
    Serial.print(now.day(), DEC);
    Serial.print(' ');
    Serial.print(now.hour(), DEC);
    Serial.print(':');
    Serial.print(now.minute(), DEC);
    Serial.print(':');
    Serial.print(now.second(), DEC);
    Serial.println();

    Serial.print(" since midnight 1/1/1970 = ");
    Serial.print(now.unixtime());
    Serial.print("s = ");
    Serial.print(now.unixtime() / 86400L);
    Serial.println("d");
}


void MagicHal::setTime(DateTime t) {
  rtc.adjust(t);
}

void MagicHal::servoWrite(uint8_t angle){
  servo.write(angle);
}

void MagicHal::setLock(bool lock){
  servo.write(lock ? 60 : 120);
}
