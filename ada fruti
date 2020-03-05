#ifndef _IIC_SSD1306SYP_H_
#define _IIC_SSD1306SYP_H_

#if ARDUINO >= 100

 #include "Arduino.h"
#else
 #include "WProgram.h"
#endif
#include "Adafruit_GFX.h"

using namespace std;

#define BLACK 0
#define WHITE 1

//common parameters
#define SSD1306_WIDTH 128
#define SSD1306_HEIGHT 64
#define SSD1306_FBSIZE 1024 //128x8
#define SSD1306_MAXROW 8
//command macro
  #define SSD1306_CMD_DISPLAY_OFF 0xAE//--turn off the OLED
  #define SSD1306_CMD_DISPLAY_ON 0xAF//--turn on oled panel 

class Adafruit_ssd1306syp : public Adafruit_GFX{
public:
	Adafruit_ssd1306syp(int sda,int scl);
	~Adafruit_ssd1306syp();
	//initialized the ssd1306 in the setup function
	virtual bool initialize();

	//update the framebuffer to the screen.
	virtual void update();
	//totoally 8 rows on this screen in vertical direction.
	virtual void updateRow(int rowIndex);
	virtual void updateRow(int startRow, int endRow);
	
	//draw one pixel on the screen.
	virtual void drawPixel(int16_t x, int16_t y, uint16_t color);

	//clear the screen
	void clear(bool isUpdateHW=false);
protected:
	//write one byte to the screen.
	void writeByte(unsigned char  b);
	void writeCommand(unsigned char  cmd);

	//atomic control function
	void startIIC();//turn on the IIC
	void stopIIC();//turn off the IIC.
	void startDataSequence();

	//
protected:
	int m_sda;
	int m_scl;
	unsigned char* m_pFramebuffer;//the frame buffer for the adafruit gfx. size=64x8 bytes
};
#endif
