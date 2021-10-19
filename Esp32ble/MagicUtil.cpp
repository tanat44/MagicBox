#include "MagicUtil.h"

MagicUtil::MagicUtil(RTC_DS1307* rtc) : rtc(rtc){
  
}

String MagicUtil::generateToken(String payload) {
  // TUM CODE
  return "hihi";
}

String MagicUtil::generateOtp(String pk) {
  // TUM CODE
  DateTime now = rtc->now();
  
  return "hihi";
}
