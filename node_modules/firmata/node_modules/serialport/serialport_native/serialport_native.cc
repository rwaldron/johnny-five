// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

#include "serialport_native.h"
#include <stdio.h>   /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <unistd.h>  /* UNIX standard function definitions */
#include <fcntl.h>   /* File control definitions */
#include <errno.h>   /* Error number definitions */
#include <termios.h> /* POSIX terminal control definitions */
#include <sys/ioctl.h>
#include <node.h>    /* Includes for JS, node.js and v8 */
#include <node_buffer.h>
#include <v8.h>


#define THROW_BAD_ARGS ThrowException(Exception::TypeError(String::New("Bad argument")))


namespace node {

  using namespace v8;
  
  static Persistent<String> errno_symbol;

  static long GetBaudConstant(long Baud_Rate) {
    switch (Baud_Rate) {
      case 230400: return B230400;
      case 115200: return B115200;
      case 57600:  return B57600;
      case 38400:  return B38400;
      case 19200:  return B19200;
      case 9600:   return B9600;
      case 4800:   return B4800;
      case 2400:   return B2400;
      case 1800:   return B1800;
      case 1200:   return B1200;
      case 600:    return B600;
      case 300:    return B300;
      case 200:    return B200;
      case 150:    return B150;
      case 134:    return B134;
      case 110:    return B110;
      case 75:     return B75;
      case 50:     return B50;
      case 0:      return B0;
    }
    // Custom Speed?
    return Baud_Rate;       
  }

  static long GetDataBitsConstant(long Data_Bits) {
    switch (Data_Bits) {
      case 8: default: return CS8;
      case 7: return CS7;
      case 6: return CS6;
      case 5: return CS5;
    }  
  }

  static long GetStopBitsConstant(long Stop_Bits) {
    switch (Stop_Bits) {
      case 1: default: return 0;
      case 2: return CSTOPB;
    }
  }

  static long GetFlowcontrolConstant(long Flowcontrol) {
    switch (Flowcontrol) {
      case 0: default: return 0;
      case 1: return CRTSCTS;
    }
  }

  static Handle<Value> SetBaudRate(const Arguments& args) {
    HandleScope scope;

    long BAUD;
    long Baud_Rate = 38400;
    struct termios options; 

    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();

    // Baud Rate Argument
    if (args.Length() >= 2 && !args[1]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Baud_Rate = args[1]->Int32Value();
    }
   
    // Set baud and other configuration.
    tcgetattr(fd, &options);

    BAUD = GetBaudConstant(Baud_Rate);
    printf("Setting baud rate to %ld\n", BAUD);

    /* Specify the baud rate */
    cfsetispeed(&options, BAUD);
    cfsetospeed(&options, BAUD);
    
    tcflush(fd, TCIFLUSH);
    tcsetattr(fd, TCSANOW, &options);

    return scope.Close(Integer::New(BAUD));
  }



  static Handle<Value> SetDTR(const Arguments& args) {
    HandleScope scope;

    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();

    if (!args[1]->IsBoolean())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    bool DTR = args[1]->BooleanValue();

    if (DTR) { // DTR Set
      fcntl(fd, TIOCMBIS, TIOCM_DTR);
    } else { // DTR Clear
      fcntl(fd, TIOCMBIC, TIOCM_DTR);
    }

    return scope.Close(Integer::New(1));
  }



  static Handle<Value> Read(const Arguments& args) {
    HandleScope scope;

    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();


    char * buf = NULL;

    if (!Buffer::HasInstance(args[1])) {
      return ThrowException(Exception::Error(
                  String::New("Second argument needs to be a buffer")));
    }

    Local<Object> buffer_obj = args[1]->ToObject();
    char *buffer_data = Buffer::Data(buffer_obj);
    size_t buffer_length = Buffer::Length(buffer_obj);
    ssize_t bytes_read = read(fd, buffer_data, buffer_length);
    if (bytes_read < 0) return ThrowException(ErrnoException(errno));
    // reset current pointer
    size_t seek_ret = lseek(fd,bytes_read,SEEK_CUR);
    return scope.Close(Integer::New(bytes_read));
  }






  static Handle<Value> Write(const Arguments& args) {
    HandleScope scope;
    
    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();

    if (!Buffer::HasInstance(args[1])) {
      return ThrowException(Exception::Error(String::New("Second argument needs to be a buffer")));
    }

    Local<Object> buffer_obj = args[1]->ToObject();
    char *buffer_data = Buffer::Data(buffer_obj);
    size_t buffer_length = Buffer::Length(buffer_obj);
    
    int n = write(fd, buffer_data, buffer_length);
    return scope.Close(Integer::New(n));

  }

  static Handle<Value> Close(const Arguments& args) {
    HandleScope scope;
    
    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();

    close(fd);

    return scope.Close(Integer::New(1));
  }

  static Handle<Value> Open(const Arguments& args) {
    HandleScope scope;

    struct termios options; 

    long Baud_Rate = 38400;
    int Data_Bits = 8;
    int Stop_Bits = 1;
    int Parity = 0;
    int Flowcontrol = 0;

    long BAUD;
    long DATABITS;
    long STOPBITS;
    long PARITYON;
    long PARITY;
    long FLOWCONTROL;

    if (!args[0]->IsString()) {
      return scope.Close(THROW_BAD_ARGS);
    }

    // Baud Rate Argument
    if (args.Length() >= 2 && !args[1]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Baud_Rate = args[1]->Int32Value();
    }

    // Data Bits Argument
    if (args.Length() >= 3 && !args[2]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Data_Bits = args[2]->Int32Value();
    }

    // Stop Bits Arguments
    if (args.Length() >= 4 && !args[3]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Stop_Bits = args[3]->Int32Value();
    }

    // Parity Arguments
    if (args.Length() >= 5 && !args[4]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Parity = args[4]->Int32Value();
    }

    // Flow control Arguments
    if (args.Length() >= 6 && !args[5]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Flowcontrol = args[5]->Int32Value();
    }

    BAUD = GetBaudConstant(Baud_Rate);
    DATABITS = GetDataBitsConstant(Data_Bits);
    STOPBITS = GetStopBitsConstant(Stop_Bits);
    FLOWCONTROL = GetFlowcontrolConstant(Flowcontrol);

    String::Utf8Value path(args[0]->ToString());
    
    int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK | O_NDELAY);
    int fd    = open(*path, flags);

    if (fd == -1) {
      // perror("open_port: Unable to open specified serial port connection.");
      return scope.Close(Integer::New(fd));
    } else {
      struct sigaction saio; 
      saio.sa_handler = SIG_IGN;
      sigemptyset(&saio.sa_mask);   //saio.sa_mask = 0;
      saio.sa_flags = 0;
      //    saio.sa_restorer = NULL;
      sigaction(SIGIO,&saio,NULL);
      
      //all process to receive SIGIO
      fcntl(fd, F_SETOWN, getpid());
      fcntl(fd, F_SETFL, FASYNC);
      
      // Set baud and other configuration.
      tcgetattr(fd, &options);

      /* Specify the baud rate */
      cfsetispeed(&options, BAUD);
      cfsetospeed(&options, BAUD);
      

      /* Specify data bits */
      options.c_cflag &= ~CSIZE; 
      options.c_cflag |= DATABITS;    
    

      /* Specify flow control */
      options.c_cflag &= ~FLOWCONTROL;
      options.c_cflag |= FLOWCONTROL;

      switch (Parity)
        {
        case 0:
        default:                       //none
          options.c_cflag &= ~PARENB;
          options.c_cflag &= ~CSTOPB;
          options.c_cflag &= ~CSIZE;
          options.c_cflag |= CS8;
          break;
        case 1:                        //odd
          options.c_cflag |= PARENB;
          options.c_cflag |= PARODD;
          options.c_cflag &= ~CSTOPB;
          options.c_cflag &= ~CSIZE;
          options.c_cflag |= CS7;
          break;
        case 2:                        //even
          options.c_cflag |= PARENB;
          options.c_cflag &= ~PARODD;
          options.c_cflag &= ~CSTOPB;
          options.c_cflag &= ~CSIZE;
          options.c_cflag |= CS7;
          break;
        }
      

      options.c_cflag |= CLOCAL; //ignore status lines
      options.c_cflag |= CREAD;  //enable receiver
      options.c_cflag |= HUPCL;  //drop DTR (i.e. hangup) on close
      options.c_iflag = IGNPAR;
      options.c_oflag = 0;
      options.c_lflag = 0;       //ICANON;
      options.c_cc[VMIN]=1;
      options.c_cc[VTIME]=0;

      //memset(&options, 0, 128000);
      tcflush(fd, TCIFLUSH);
      tcsetattr(fd, TCSANOW, &options);

      return scope.Close(Integer::New(fd));
    }
  }




  void SerialPort::Initialize(Handle<Object> target) {
    
    HandleScope scope;

    NODE_SET_METHOD(target, "open", Open);
    NODE_SET_METHOD(target, "write", Write);
    NODE_SET_METHOD(target, "close", Close);
    NODE_SET_METHOD(target, "read", Read);
    NODE_SET_METHOD(target, "set_baud_rate", SetBaudRate);
    NODE_SET_METHOD(target, "set_dtr", SetDTR);

    errno_symbol = NODE_PSYMBOL("errno");


  }


  extern "C" void
  init (Handle<Object> target) 
  {
    HandleScope scope;
    SerialPort::Initialize(target);
  }


}
