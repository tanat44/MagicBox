#include "mbedtls/md.h"

// ref: https://techtutorialsx.com/2018/01/25/esp32-arduino-applying-the-hmac-sha-256-mechanism/

void setup() {

  Serial.begin(115200);
  char *key = "1UGhxzO8KB3O87kYpqJh04GY6sKuWrgAz3K0D850IqwtvbkMiqXx7AOreBaGCCfiVY7yHzmC8gM0EUDjUkOukbQmS98z7S7uVp4pIAIjAklMgUbQ0zk86boErNtnQ2STrsRmlxZZRbIE0jYe2pIUqdMwSJi8wwUYKPOC7xmRH8gG8oaDLXztPkyXQrOXtBbt6lEvrToecxRSho9CrkNaSlZtHBqgfibxuy4AVu20svMQnmgdPX9qxWVxraSymWe0";
  char *payload = "20211010";

  const uint8_t OTPLength = 6;
  char OTP[OTPLength];
  
  genOTP_SHA1(key, payload, OTP, OTPLength);

  Serial.print("OTP: ");
  Serial.print(OTP);

}

void loop() {
  // put your main code here, to run repeatedly:

}

void genOTP_SHA1(char * key, char * payload, char * OTP, const uint8_t OTPLength){

  byte hmacResult[20];
  
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA1;

  const size_t payloadLength = strlen(payload);
  const size_t keyLength = strlen(key);

  mbedtls_md_init(&ctx);

  // add error handler later, return 0 if success
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 1);

  // add error handler later, return 0 if success
  mbedtls_md_hmac_starts(&ctx, (const unsigned char *) key, keyLength);

  // add error handler later, return 0 if success
  mbedtls_md_hmac_update(&ctx, (const unsigned char *) payload, payloadLength);

  // add error handler later, return 0 if success
  mbedtls_md_hmac_finish(&ctx, hmacResult); 

  mbedtls_md_free(&ctx);

  Serial.print("Hash: ");
  for(int i= 0; i< sizeof(hmacResult); i++){
      char str[3];
 
      sprintf(str, "%02x", (int)hmacResult[i]);
      Serial.print(str);
  }
  Serial.print("\n");
  
  //from hash, generate OTP

  uint64_t offset = hmacResult[19] & 0x0f;
  uint32_t bin_code;

  bin_code = (hmacResult[offset]  & 0x7f) << 24
      | (hmacResult[offset+1] & 0xff) << 16
      | (hmacResult[offset+2] & 0xff) <<  8
      | (hmacResult[offset+3] & 0xff);

  uint32_t power = pow(10,OTPLength);

  uint32_t otp = bin_code % power;
  
//  Serial.print(otp);
//  Serial.print("\n");

  sprintf(OTP, "%d", otp);
}
