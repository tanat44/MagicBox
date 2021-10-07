# Magic Box

MagicApp is developed using React Native Framework. Esp32ble is an Arduino project

 ## OTP
 
otp1 = Hash(pk1, ts)
...
otp_n = Hash(pk_n, ts)

## Authentication Predecure

1. mcu is ble server (called it device)
1. user pair a phone with the device
1. user input device's serial number
1. device check s/n againt it's EEPROM
1. for the firsttime (or upon reset), user's app generate 10pks (each pk is 256 long of random char), app save pk in phone's storage
1. app send 10pks to the device, device store pk in EEPROM
1. sync time

## How to run on Android

1. Install NodeJs
1. Install Android Studio
    1. Tools > SDK Manager > Android SDK. Make sure one of the SDK Platforms is checked. If not, check one > Apply > follow installation steps.
1. Phone Setting > Additional Setting > Developer Option (Some steps are somewhat special requirements for Xiaomi phone)
    1. Turn on **USB debugging**
    1. Turn on **Install via USB**
    1. Turn on **USB debugging (Security Setting)** 
    1. Turn off **Turn on MIUI optimization**
1. Run the following cmd
    ```
    npx react-native run-android
    ```

# ESP32

| Left Pin | Right Pin |
| - | - |
| Vcc | Gnd |
| - | Buzzer |
| - | RTC SCL |
| - | - |
| - | - |
| - | RTC SDA |
| Keypad C3 | - |
| Keypad C4 | - |
| Keypad R1 | - |
| Keypad R2 | - |
| Keypad R3 | - |
| Keypad R4 | - |
| Keypad C1 | - |
| - | - |
| Keypad C2 | - |
| - | - |
| - | - |
| - | - |
| - | - |
*Micro USB Header is here!*

![Pin Diagram](doc/ESP32-38 PIN-DEVBOARD.png)