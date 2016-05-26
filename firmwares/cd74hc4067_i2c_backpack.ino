#include <Wire.h>

#define DEBUG_MODE 0
#define DEBUG_MODE_RAW 0

// Address Pins
#define AD0 11
#define AD1 12

// Select Pins
#define S0 2 // A
#define S1 3 // B
#define S2 4 // C
#define S3 5 // D

// Common Input/Output
#define COM 7

// I2C Configuration
#define I2C_DEFAULT_ADDRESS 0x0A
#define BUFFER_SIZE 32

byte buffer[BUFFER_SIZE];

int addressPins[] = { AD0, AD1 };
int address = I2C_DEFAULT_ADDRESS;

int selectPins[] = { S0, S1, S2, S3 };
int muxChannels[16][4] = {
  /*  0 */ { 0, 0, 0, 0 },
  /*  1 */ { 1, 0, 0, 0 },
  /*  2 */ { 0, 1, 0, 0 },
  /*  3 */ { 1, 1, 0, 0 },
  /*  4 */ { 0, 0, 1, 0 },
  /*  5 */ { 1, 0, 1, 0 },
  /*  6 */ { 0, 1, 1, 0 },
  /*  7 */ { 1, 1, 1, 0 },
  /*  8 */ { 0, 0, 0, 1 },
  /*  9 */ { 1, 0, 0, 1 },
  /* 10 */ { 0, 1, 0, 1 },
  /* 11 */ { 1, 1, 0, 1 },
  /* 12 */ { 0, 0, 1, 1 },
  /* 13 */ { 1, 0, 1, 1 },
  /* 14 */ { 0, 1, 1, 1 },
  /* 15 */ { 1, 1, 1, 1 },
};

byte reporting[16];

void resetSelectPins() {
  for (int i = 0; i < 4; i++) {
    pinMode(selectPins[i], OUTPUT);
    digitalWrite(selectPins[i], LOW);
  }
}

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

  resetSelectPins();

  Wire.begin(address);
  Wire.onRequest(onRequest);
  Wire.onReceive(onReceive);
}

#if DEBUG_MODE
uint16_t anData[16];
int rows = 0;
void header() {
  for (int x = 0; x < 16; x++) { =
    if (reporting[x] == 1) {
      Serial.print("*");
    }
    if (x < 15) {
      Serial.print("A");
      Serial.print(x);
      Serial.print("\t");
    } else {
      Serial.print("A");
      Serial.println(x);
    }
  }
}
#endif

void loop() {

  for (int i = 0; i < 16; i++) {
    int index = i * 2;
    int val = 0;

    if (reporting[i] == 1) {
      val = readChannel(i);
    }

    buffer[index] = val >> 8;
    buffer[index + 1] = val & 0xFF;

    #if DEBUG_MODE
      anData[i] = val;
    #endif
  }


  #if DEBUG_MODE
    if (rows == 10) {
      header();
      rows = 0;
    }

    for (int x = 0; x < 16; x++) {
      if (x < 15) {
        Serial.print(anData[x]);
        Serial.print("\t");
      } else {
        Serial.println(anData[x]);
      }
    }

    #if DEBUG_MODE_RAW
      for (int x = 0; x < 16; x++) {
        int j = x * 2;
        if (x < 15) {
          Serial.print(buffer[j]);
          Serial.print(", ");
          Serial.print(buffer[j + 1]);
          Serial.print("\t");
        } else {
          Serial.print(buffer[j]);
          Serial.print(", ");
          Serial.println(buffer[j + 1]);
        }
      }

      Serial.println("");
    #endif

    rows++;

    delay(100);
  #endif
}

int readChannel(int channel) {
  for (int i = 0; i < 4; i++) {
    digitalWrite(selectPins[i], muxChannels[channel][i]);
  }
  delay(10);
  return analogRead(COM);
}


void onRequest() {
  Wire.write(buffer, BUFFER_SIZE);
}

void onReceive(int howMany) {
  byte pin = (byte)Wire.read();
  byte state = (byte)Wire.read();
  reporting[pin] = state;

  #if DEBUG_MODE
    Serial.println(howMany);
    Serial.print("report: ");
    Serial.print(pin);
    Serial.print(": ");
    Serial.print(state);
    Serial.println("--------------------");
  #endif
}
