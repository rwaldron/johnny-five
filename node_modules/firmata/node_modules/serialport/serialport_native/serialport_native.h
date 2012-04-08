// Copyright 2011 Chris Williams <chris@iterativedesigns.com>
#ifndef SRC_FILE_H_
#define SRC_FILE_H_

#include <node.h>
// #include <node_events.h>
#include <v8.h>

namespace node {

class SerialPort {
 public:
  static void Initialize(v8::Handle<v8::Object> target);
};

}  // namespace node
#endif  // SRC_FILE_H_
