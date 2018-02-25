# md5-js

A md5 hashing implementation in vanilla JavaScript.

Based on pseudocode found here:

https://en.wikipedia.org/wiki/MD5#Pseudocode


## Install globally and use on the command line:

```sh
git clone https://github.com/jeffallen6767/md5-js.git
cd md5-js
npm install -g
```

## Usage

```js
var md5 = require('md5-js');

console.log(
  md5("abc")
);

// 900150983cd24fb0d6963f7d28e17f72
```

## Text passed to md5 should be UTF8 encoded:

```js
var md5 = require('md5-js'),
  utf8 = require('utf8');

console.log(
  md5(
    utf8.encode("í")
  )
);

// 9defdf606bd9e5ba7861b78c0b50ecb2
```

Examples:

```sh
  Usage: md5  [options]


  Options:

    -V, --version             output the version number
    -m, --message [text]      text to apply md5
    -f, --file [path]         file to apply md5
    -c, --compare [checksum]  Checksum to compare generated with
    -h, --help                output usage information

C:\Users\jeffa\Downloads>dir

    Directory: C:\Users\jeffa\Downloads


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
-a----        2/18/2018   5:55 PM        4521784 npp.7.5.4.Installer.x64.exe

C:\Users\jeffa\Downloads>md5 -f .\npp.7.5.4.Installer.x64.exe
1bb3a3b41ac1108dc010258d95285078

C:\Users\jeffa\Downloads>md5 -m abc
900150983cd24fb0d6963f7d28e17f72

C:\Users\jeffa\Downloads>md5 -m "a b c"
06f0760ec7f18687a7fbc0ddbf1b1722

```
---

### Copyright (c) 2017 Jeffrey David Allen

#### Licensed under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
