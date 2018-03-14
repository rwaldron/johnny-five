#include <Wire.h>

/**
 *
 * This is a derivative of the Keypad 3x4 I2C Nano Backpack.
 * Much of the code is the same, however due to an additional 8th pin, some of
 * the code has to be modified to suit 16 buttons instead of 12.
 * 
 */

#define DEBUG_MODE 0

// Address Pins
#define AD0 11
#define AD1 12

// I2C Defaults
#define I2C_DEFAULT_ADDRESS 0x0A
#define I2C_BUFFER_SIZE 2

byte buffer[I2C_BUFFER_SIZE];

int addressPins[] = { AD0, AD1 };
int address = I2C_DEFAULT_ADDRESS;

int pins[8] = {8, 7, 6, 5, 4, 3, 2, 9};

void resetPins() {
  for (int i = 0; i < 8; i++) {
    pinMode(pins[i], INPUT);
    digitalWrite(pins[i], HIGH);
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

  resetPins();

  Wire.begin(address);
  Wire.onRequest(onRequest);
}

void loop() {
  int state = read();
  // int index = toIndex(state);

  // if (state == 0) {
  //   index = 0xFF;
  // }

  // #if DEBUG_MODE
  // if (index != 0xff) {
  //   Serial.println(index);
  // }
  // #endif

  // buffer[0] = index >> 8;
  // buffer[1] = index & 0xFF;

  buffer[0] = state >> 8;
  buffer[1] = state & 0xFF;

  delay(10);
}

int toIndex(int bits) {
  for (int i = 0; i < 16; i++) {
    if (bits & (1 << i)) {
      return i;
    }
  }
}

int read() {
  // 2, 7, 6, 4
  // 3, 1, 5, 9
  int rowPins[4] = {7, 2, 3, 5};
  int colPins[4] = {6, 8, 4, 9};
  int state = 0;


  resetPins();

  for (int row = 0; row < 4; row++) {
    // "Open" the row for reading...
    // Set the row to OUTPUT and put all pins LOW
    pinMode(rowPins[row], OUTPUT);
    digitalWrite(rowPins[row], LOW);
    // Iterate across the columns in this row
    for (int col = 0; col < 4; col++) {
      // Read and update the state byte
      if (!digitalRead(colPins[col])) {
        state |= 1 << ((row + 1) * 4 + (col + 1) - 5);
      }
    }
    // "Close" the row...
    // Set the row to INPUT and put all pins HIGH
    pinMode(rowPins[row], INPUT);
    digitalWrite(rowPins[row], HIGH);
  }

  return state;
}

void onRequest() {
  Wire.write(buffer, 2);
}
