EESchema Schematic File Version 4
EELAYER 30 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title "MagicBox Mainboard"
Date "2021-10-14"
Rev "v01"
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 "Author: Tanut"
$EndDescr
$Comp
L MagicBox:ESP32-circuit U?
U 1 1 616B2ED2
P 5900 3600
F 0 "U?" H 5875 4815 50  0000 C CNN
F 1 "ESP32-circuit" H 5875 4724 50  0000 C CNN
F 2 "" H 5850 3300 50  0001 C CNN
F 3 "" H 5850 3300 50  0001 C CNN
	1    5900 3600
	1    0    0    -1  
$EndComp
$Comp
L Device:R R?
U 1 1 616B950D
P 4150 3100
F 0 "R?" V 3943 3100 50  0000 C CNN
F 1 "22k" V 4034 3100 50  0000 C CNN
F 2 "" V 4080 3100 50  0001 C CNN
F 3 "~" H 4150 3100 50  0001 C CNN
	1    4150 3100
	0    1    1    0   
$EndComp
$Comp
L Device:C C?
U 1 1 616BA372
P 7350 4000
F 0 "C?" H 7465 4046 50  0000 L CNN
F 1 "C" H 7465 3955 50  0000 L CNN
F 2 "" H 7388 3850 50  0001 C CNN
F 3 "~" H 7350 4000 50  0001 C CNN
	1    7350 4000
	1    0    0    -1  
$EndComp
$Comp
L power:VCC #PWR?
U 1 1 616BC235
P 3850 2400
F 0 "#PWR?" H 3850 2250 50  0001 C CNN
F 1 "VCC" H 3865 2573 50  0000 C CNN
F 2 "" H 3850 2400 50  0001 C CNN
F 3 "" H 3850 2400 50  0001 C CNN
	1    3850 2400
	1    0    0    -1  
$EndComp
$Comp
L power:VCC #PWR?
U 1 1 616BE9EB
P 4750 2400
F 0 "#PWR?" H 4750 2250 50  0001 C CNN
F 1 "VCC" H 4765 2573 50  0000 C CNN
F 2 "" H 4750 2400 50  0001 C CNN
F 3 "" H 4750 2400 50  0001 C CNN
	1    4750 2400
	1    0    0    -1  
$EndComp
Wire Wire Line
	4750 2400 4750 2650
Wire Wire Line
	4750 2650 5600 2650
Wire Wire Line
	4300 3100 5500 3100
Wire Wire Line
	5500 3100 5500 3150
Wire Wire Line
	5500 3150 5600 3150
Wire Wire Line
	3850 2400 3850 3100
Wire Wire Line
	3850 3100 4000 3100
Wire Wire Line
	6150 3550 7350 3550
Wire Wire Line
	7350 3550 7350 3850
$Comp
L power:GND #PWR?
U 1 1 616C0AAB
P 7200 4650
F 0 "#PWR?" H 7200 4400 50  0001 C CNN
F 1 "GND" H 7205 4477 50  0000 C CNN
F 2 "" H 7200 4650 50  0001 C CNN
F 3 "" H 7200 4650 50  0001 C CNN
	1    7200 4650
	1    0    0    -1  
$EndComp
Wire Wire Line
	7350 4150 7200 4150
Wire Wire Line
	7200 4150 7200 4650
$EndSCHEMATC
