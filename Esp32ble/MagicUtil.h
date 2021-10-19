#ifndef MagicUtil_h
#define MagicUtil_h

#include "Arduino.h"
#include "MagicHal.h"
#define SECRET "SIRLEWISHAMILTON"

class MagicUtil{
  public:
    MagicUtil(RTC_DS1307* rtc);
    String generateToken(String payload);
    String generateOtp(String pk);

  private:
    RTC_DS1307* rtc;
};

#endif
