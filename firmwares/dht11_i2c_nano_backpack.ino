#include <Wire.h>
#include "DHT.h"

#define DEBUG_MODE 0

// Address Pins
#define AD0 11
#define AD1 12

// DHT
#define DHTPIN 2
#define DHTTYPE DHT11
//#define DHTTYPE DHT22
//#define DHTTYPE DHT21


// I2C Defaults
#define I2C_DEFAULT_ADDRESS 0x0A
#define I2C_BUFFER_SIZE 4
//
// 0 H LSB
// 1 H MSB
// 2 T LSB
// 3 T MSB
//
byte buffer[I2C_BUFFER_SIZE];

int addressPins[] = { AD0, AD1 };
int address = I2C_DEFAULT_ADDRESS;
int pin = 2;

void resetState() {
  digitalWrite(pin, LOW);
  pinMode(pin, INPUT);
}

DHT dht(DHTPIN, DHTTYPE);

void setup() {

  int offset = 0;

  for (int i = 0; i < 2; i++) {
    pinMode(addressPins[i], INPUT);
    if (digitalRead(addressPins[i])) {
      offset |= 1 << i;
    }
  }

  address += offset;

  #if DEBUG_MODE
    Serial.begin(9600);
  #endif

  resetState();

  dht.begin();

  Wire.begin(address);
  Wire.onRequest(onRequest);
}

void loop() {

  int h = (int)((float)dht.readHumidity() * 100);
  int c = (int)((float)dht.readTemperature() * 100);

  buffer[0] = h >> 8;
  buffer[1] = h & 0xFF;
  buffer[2] = c >> 8;
  buffer[3] = c & 0xFF;

  delay(250);
}

void onRequest() {
  Wire.write(buffer, I2C_BUFFER_SIZE);
}
