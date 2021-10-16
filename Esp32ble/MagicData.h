#ifndef MagicData_h
#define MagicData_h

#include "Arduino.h"

class MagicData {
  public:
    MagicData();
    String get();
    void setPassword(String p);

    void save();
    void load();
    static int writeStringToEEPROM(int addrOffset, const String &strToWrite);
    static int readStringFromEEPROM(int addrOffset, String *strToRead);

  private:
    String password;
};

#endif
