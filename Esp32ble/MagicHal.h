#ifndef MagicHal_h
#define MagicHal_h

#define BUZZER_PIN 23
#define KEY_TONE_MS 100
#define UNLOCK_TONE_MS 500
#define KEYPAD_ROW 4
#define KEYPAD_COL 4

#include <RTClib.h>
#include <Keypad.h>
#include "Arduino.h"


class MagicHal {
  public:
    MagicHal();
    
    void buzzerKeyTone(int ms);
    void buzzerAlarm();    
    void printTime();
    void setTime(DateTime t);

    Keypad keypad;

  private:
    RTC_DS1307 rtc;
    static char keys[KEYPAD_ROW][KEYPAD_COL];
    static byte rowPins[KEYPAD_ROW];
    static byte colPins[KEYPAD_COL];
    
};

#endif
