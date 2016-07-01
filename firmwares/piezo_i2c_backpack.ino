#include <Wire.h>

#define DEBUG_MODE 0

// Address Pins
#define AD0 11
#define AD1 12

// I2C Configuration
#define I2C_DEFAULT_ADDRESS 0x0A
#define BUFFER_SIZE 8

// FUNCTION COMMANDS
#define NO_TONE 0x00
#define TONE 0x01

byte buffer[BUFFER_SIZE];

int addressPins[] = { AD0, AD1 };
int address = I2C_DEFAULT_ADDRESS;

void setup() {
  // Determine the I2C addresss
  // by reading the designated pins
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

  Wire.begin(address);
  Wire.onReceive(onReceive);
}

void loop() {}

void onReceive(int howMany) {

  if (howMany > BUFFER_SIZE) {
    howMany = BUFFER_SIZE;
  }

  memset(&buffer[0], 0, howMany);

  uint8_t command;
  uint8_t pin;
  uint16_t hz;
  uint32_t ms;

  for (int i = 0; i < howMany; i++) {
    buffer[i] = Wire.read();
  }

  command = buffer[0];
  pin = buffer[1];
  hz = (buffer[2] << 8) | buffer[3];

  if (howMany == 8) {
    ms = (buffer[4] << 24) | (buffer[5] << 16) | (buffer[6] << 8) | buffer[7];
  }

  #if DEBUG_MODE
    Serial.print("Bytes Received: ");
    Serial.println(howMany);
    Serial.print("command: ");
    Serial.println(command);
    Serial.print("pin: ");
    Serial.println(pin);
    Serial.print("hz: ");
    Serial.println(hz);
    Serial.print("ms: ");
    Serial.println(ms);
    Serial.println("--------------------");
  #endif

  pinMode(pin, OUTPUT);

  if (command == NO_TONE) {
    noTone(pin);
  }

  if (command == TONE) {
    if (ms == 0) {
      tone(pin, hz);
    } else {
      tone(pin, hz, ms);
    }
  }
}
