/*
md5-js

adapted from: https://en.wikipedia.org/wiki/MD5#Pseudocode
author: Jeffrey David Allen
created: Sunday, Feb 18th, 2018
github: https://github.com/jeffallen6767/md5-js
website: http://jdallen.net/

Note 1: All variables are 32 bit unsigned integers and addition is calculated modulo 2^32
*/

var 
  BYTE_SIZE = 8,
  WORD_SIZE_BYTES = 4,
  HEX_SIZE = 16,
  U_INT_32_SIZE = 32,
  PAD_START_DEC_VAL = 128,
  BLOCK_SIZE_BYTES = 64,
  BYTE_MULT_32_1 = 16777216,
  BYTE_MULT_32_2 = 65536,
  BYTE_MULT_32_3 = 256,
  MIN_PAD_BYTES = 1,
  MSG_SIZE_BYTES = 8,
  MIN_PRE_CALC_BYTES = MIN_PAD_BYTES + MSG_SIZE_BYTES,
  ENDIAN_SIZE_CONVERT = [14,15,12,13,10,11,8,9,6,7,4,5,2,3,0,1],
  ZERO_BITS_4_BYTES = "00000000",
  ZERO_BITS_8_BYTES = ZERO_BITS_4_BYTES + ZERO_BITS_4_BYTES,
  // Use binary integer part of the sines of integers (Radians) as constants:
  BINARY_INTEGER_SINES = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ],
  PER_ROUND_SHIFTS = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

function toHex(uInt32) {
  var 
    hex = uInt32.toString(HEX_SIZE),
    len = hex.length;
  return len < BYTE_SIZE ? ZERO_BITS_4_BYTES.substr(len) + hex : hex;
}


function leftRotate(x, c) {
  return (x << c) | (x >>> (U_INT_32_SIZE-c));
}

function md5(input, next) {

  var 
    // calc # of chars + 0x80 [1000 0000] + 64bit length of msg in bits
    inputBytes = input.length,
    preProcessOffsetBytes = (inputBytes + MIN_PRE_CALC_BYTES) % BLOCK_SIZE_BYTES,
    preProcessZeroPadBytes = preProcessOffsetBytes ? BLOCK_SIZE_BYTES - preProcessOffsetBytes : preProcessOffsetBytes,
    preProcessBlockWidth = inputBytes + MIN_PRE_CALC_BYTES + preProcessZeroPadBytes,
    
    // prepare buffer
    isbuffer = Buffer.isBuffer(input),
    buffer = isbuffer ? Buffer.allocUnsafe(preProcessBlockWidth-inputBytes) : new Array(preProcessBlockWidth),
    
    // calc 8 byte size:
    inputSizeInBits = inputBytes * BYTE_SIZE,
    sizeBytes = inputSizeInBits.toString(HEX_SIZE),
    hexSize = ZERO_BITS_8_BYTES.substr(sizeBytes.length) + sizeBytes,
    
    // 2800 0000 0000 0000 <-- convert to little endian:
    arrHexSize = hexSize.split("").map(function(val, index, arrHex) {
      return arrHex[
        ENDIAN_SIZE_CONVERT[index]
      ];
    }),
    
    //Initialize variables:
    a0 = 0x67452301,
    b0 = 0xefcdab89,
    c0 = 0x98badcfe,
    d0 = 0x10325476,
    
    // the four uInt32 values to manipulate:
    a,b,c,d,
    
    // the calculated word value per iteration
    wordValue,
    
    // the calculated word index per iteration
    wordIndex,
    
    // the 16 32bit words of the current 512-bit chunk being processed
    words,
    
    // index
    x = 0,
    
    // temp vars
    y,z,
    
    // final value
    output;

  // add message
  if (!isbuffer) {
    for (x=0; x<inputBytes; x++) {
      buffer[x] = input.charCodeAt(x);
    }
  }
  
  // add 1st pad byte:
  buffer[x++] = PAD_START_DEC_VAL;
  
  // add zero pad fill:
  for (y=0; y<preProcessZeroPadBytes; y++) {
    buffer[x++] = 0;
  }

  // add size:
  while (arrHexSize.length > 0) {
    var aByte = arrHexSize.shift() + arrHexSize.shift();
    buffer[x++] = parseInt(aByte, HEX_SIZE);
  }
  
  // finalize buffer prep
  if (isbuffer) {
    buffer = Buffer.concat([input, buffer], preProcessBlockWidth);
  }
  
  // Process the message buffer in successive 512-bit chunks:
  for (x=0; x<preProcessBlockWidth; x+=BLOCK_SIZE_BYTES) {

    // break chunk into sixteen 32-bit word values w[z], 0 ≤ z ≤ 15
    words = new Array(HEX_SIZE);
    for (z=0; z<HEX_SIZE; z++) {
      y = x + z * WORD_SIZE_BYTES;
      // calc little-endian word value from 4 bytes in buffer:
      words[z] = buffer[y+3] * BYTE_MULT_32_1 + buffer[y+2] * BYTE_MULT_32_2 + buffer[y+1] * BYTE_MULT_32_3 + buffer[y];
    }

    //Initialize hash value for this chunk:
    a = a0;
    b = b0;
    c = c0;
    d = d0;

    // Main loop:
    for (y=0; y<64; y++) {
      
      // choose wordValue and wordIndex for each of 4x4 steps:
      if (y < 16) {
        wordValue = (b & c) | ((~b) & d);
        wordIndex = y;
      } else if (y < 32) {
        wordValue = (d & b) | ((~d) & c);
        wordIndex = (5 * y + 1) % HEX_SIZE;
      } else if (y < 48) {
        wordValue = b ^ c ^ d;
        wordIndex = (3 * y + 5) % HEX_SIZE;
      } else {
        wordValue = c ^ (b | (~d));
        wordIndex = (7 * y) % HEX_SIZE;
      }
      
      // NOTE: the "twisting" of a,b,c,d
      wordValue += (a + BINARY_INTEGER_SINES[y] + words[wordIndex]);
      a = d;
      d = c;
      c = b;
      b += leftRotate(wordValue, PER_ROUND_SHIFTS[y]);
    }
    
    // Add (modulo 2^32) this chunk's hash to result so far:
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }
  
  // Produce the final hash value of unsigned int32's in hex
  // then convert hex values to little-endian output:
  // 2a40415d becomes: 5d41402a
  output = [a0, b0, c0, d0].map(toHex).reduce(function(acc, val, idx) {
    // split into 2 char chunks:
    var bytes = val.match(/.{1,2}/g);
    // push them in reverse order:
    acc.push(
      bytes.pop(),
      bytes.pop(),
      bytes.pop(),
      bytes.pop()
    );
    return acc;
  }, []).join('');
  
  // allow sync or async:
  return "function" === typeof next ? next(output) : output;
}

module.exports = md5;
