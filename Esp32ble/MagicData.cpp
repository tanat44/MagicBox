#include "EEPROM.h"
#include "MagicData.h"

#define EEPROM_OFFSET 0

MagicData::MagicData() 
{
  password = "1357";
}

String MagicData::get(){
  return password;
}

void MagicData::save(){
  writeStringToEEPROM(EEPROM_OFFSET, get());
}

void MagicData::load(){
  readStringFromEEPROM(EEPROM_OFFSET, &password);  
}

void MagicData::setPassword(String p){
  password = p;
  save();
}


int MagicData::writeStringToEEPROM(int addrOffset, const String &strToWrite)
{
  byte len = strToWrite.length();
  EEPROM.write(addrOffset, len);
  for (int i = 0; i < len; i++)
  {
    EEPROM.write(addrOffset + 1 + i, strToWrite[i]);
    
  }
  EEPROM.commit();
  return addrOffset + 1 + len;
}

int MagicData::readStringFromEEPROM(int addrOffset, String *strToRead)
{
  int newStrLen = EEPROM.read(addrOffset);
  char data[newStrLen + 1];
  for (int i = 0; i < newStrLen; i++)
  {
    data[i] = EEPROM.read(addrOffset + 1 + i);
  }
  data[newStrLen] = '\0';
  *strToRead = String(data);
  return addrOffset + 1 + newStrLen;
}
