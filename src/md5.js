/*
md5-js

adapted from: https://en.wikipedia.org/wiki/MD5#Pseudocode
author: Jeffrey David Allen
created: Sunday, Feb 18th, 2018
github: https://github.com/jeffallen6767/md5-js
website: http://jdallen.net/


Note 1: All variables are 32 bit unsigned integers and addition is calculated modulo 2^32

//s specifies the per-round shift amounts
s[ 0..15] := { 7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22 }
s[16..31] := { 5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20 }
s[32..47] := { 4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23 }
s[48..63] := { 6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21 }


for i from 0 to 63
    K[i] := floor(232 × abs(sin(i + 1)))
end for
//(Or just use the following precomputed table):
K[ 0.. 3] := { 0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee }
K[ 4.. 7] := { 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501 }
K[ 8..11] := { 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be }
K[12..15] := { 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821 }
K[16..19] := { 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa }
K[20..23] := { 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8 }
K[24..27] := { 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed }
K[28..31] := { 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a }
K[32..35] := { 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c }
K[36..39] := { 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70 }
K[40..43] := { 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05 }
K[44..47] := { 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665 }
K[48..51] := { 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039 }
K[52..55] := { 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1 }
K[56..59] := { 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1 }
K[60..63] := { 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391 }

// create pre-calc on console:
var 
  nums = [],
  pizzy = Math.pow(2, 32);
for (var i=0; i<64; i++) {
  var k = Math.floor(
    pizzy * Math.abs(Math.sin(i+1))
  );
  nums.push(
    "0x" + toHex(k)
  );
  // 8x8 rows:
  if (!((i+1)%8)) {
    console.log(nums.join(", ") + ",\n");
    nums = [];
  }
}
*/

var 
  BYTE_SIZE = 8,
  U_INT_32_SIZE = 32,
  ENDIAN_SIZE_CONVERT = [14,15,12,13,10,11,8,9,6,7,4,5,2,3,0,1],
  zeroBits4bytes = "00000000",
  zeroBits8bytes = "0000000000000000",
  zeroBits16bytes = "00000000000000000000000000000000",
  // Use binary integer part of the sines of integers (Radians) as constants:
  k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ],
  // s specifies the per-round shift amounts
  s = [
    7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
    5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
    4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
    6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
  ];

function toHex(uInt32) {
  var 
    hex = uInt32.toString(16),
    len = hex.length;
  return len < BYTE_SIZE ? zeroBits4bytes.substr(len) + hex : hex;
}

function toBin(uInt32) {
  var 
    bin = uInt32.toString(2),
    len = bin.length;
  return len < U_INT_32_SIZE ? zeroBits16bytes.substr(len) + bin : bin;
}

function bin2uInt32(bits) {
  return parseInt(bits, 2) >>> 0;
}

function leftRotate(x, c) {
  return (x << c) | (x >>> (32-c));
}
/*
function _leftRotate(x, c) {
  console.log("leftRotate", x, c);
  var 
    first = (x << c) >>> 0,
    second = (x >>> (32-c)) >>> 0,
    result = (first | second) >>> 0,
    bits = toBin(x).split(''), 
    bit, tmp;
  console.log(" first", toBin(first), first);
  console.log("second", toBin(second), second);
  while (c > 0) {
    tmp = c + " = " + bits.join('') + " [" + bin2uInt32(bits.join('')) + "]";
    bit = bits.shift();
    bits.push(bit);
    console.log(tmp + " --> " + bits.join('') + " [" + bin2uInt32(bits.join('')) + "]");
    --c;
  }
  tmp = bin2uInt32(bits.join(''));
  
  console.log("result", toBin(result) + "[" + result + "]");
  console.log("  bits", bits.join('') + "[" + bin2uInt32(bits.join('')) + "]");
  console.log(" ");
  return result;
}
*/
/*
for (var zz=0; zz<32; zz++) {
  console.log(zz, leftRotate(1, zz));
}
*/

function md5(input, next) {

  var 
    //Initialize variables:
    a0 = 0x67452301,
    b0 = 0xefcdab89,
    c0 = 0x98badcfe,
    d0 = 0x10325476,
    
    WORD_SIZE_BYTES = 4,
    PAD_START_DEC_VAL = 128,
    
    MIN_PAD_BYTES = 1,
    MSG_SIZE_BYTES = 8,
    MIN_PRE_CALC_BYTES = MIN_PAD_BYTES + MSG_SIZE_BYTES,
    
    BLOCK_SIZE_BYTES = 64,
    
    BYTE_MULT_32_1 = 16777216,
    BYTE_MULT_32_2 = 65536,
    BYTE_MULT_32_3 = 256,
    
    INT_2_TO_THE_32ND = 4294967296,
    
    a,b,c,d,e,f,g,h,i,j,
    
    u,v,w,
    
    x = 0,
    
    y,z,
    
    digest;
  
  var inputBytes = input.length;
  //console.log("inputBytes", inputBytes);
  
  // 512 - 72 = 460
  // # of chars + 0x80 [1000 0000] + 64bit length of msg in bits
  var preProcessOffsetBytes = (inputBytes + MIN_PRE_CALC_BYTES) % BLOCK_SIZE_BYTES;
  //console.log("preProcessOffsetBytes", preProcessOffsetBytes);
  
  var preProcessZeroPadBytes = preProcessOffsetBytes ? BLOCK_SIZE_BYTES - preProcessOffsetBytes : preProcessOffsetBytes;
  //console.log("preProcessZeroPadBytes", preProcessZeroPadBytes);
  
  var preProcessBlockWidth = inputBytes + MIN_PRE_CALC_BYTES + preProcessZeroPadBytes;
  //console.log("preProcessBlockWidth", preProcessBlockWidth);
  
  var isbuffer = Buffer.isBuffer(input);

  var buffer = isbuffer ? Buffer.allocUnsafe(preProcessBlockWidth-inputBytes) : new Array(preProcessBlockWidth);
  
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

  // add 8 byte size:
  var inputSizeInBits = inputBytes * BYTE_SIZE;
  //console.log("inputSizeInBits", inputSizeInBits);
  
  var sizeBytes = inputSizeInBits.toString(16);
  //console.log("sizeBytes", sizeBytes);
  
  var hexSize = zeroBits8bytes.substr(sizeBytes.length) + sizeBytes;
  //console.log("hexSize", hexSize);
  // 0000 0000 0000 0028 <-- is big endian
  // 2800 0000 0000 0000 <-- convert to little endian:
  var arrHexSize = hexSize.split("").map(function(val, index, arrHex) {
    return arrHex[
      ENDIAN_SIZE_CONVERT[index]
    ];
  });
  while (arrHexSize.length > 0) {
    var aByte = arrHexSize.shift() + arrHexSize.shift();
    buffer[x++] = parseInt(aByte, 16);
  }

  if (isbuffer) {
    buffer = Buffer.concat([input, buffer], preProcessBlockWidth);
  }
  
  // Process the message in successive 512-bit chunks:
  for (x=0; x<preProcessBlockWidth; x+=BLOCK_SIZE_BYTES) {
    //console.log("x", x);
    
    // break chunk into sixteen 32-bit words w[z], 0 ≤ z ≤ 15
    w = new Array(BLOCK_SIZE_BYTES);
    console.log("Block", x, "contains:");
    for (z=0; z<16; z++) {
      u = z * WORD_SIZE_BYTES;
      v = x + u;
      w[z] = buffer[v+3] * BYTE_MULT_32_1 + buffer[v+2] * BYTE_MULT_32_2 + buffer[v+1] * BYTE_MULT_32_3 + buffer[v];
      console.log("[" + z + "]", w[z], "0x" + toHex(w[z]));
    }
    console.log(" ");
    
    //Initialize hash value for this chunk:
    a = a0;
    b = b0;
    c = c0;
    d = d0;
    
    console.log("words", "A=" + a, "B=" + b, "C=" + c, "D=" + d);
    console.log(" ");
    // 3679623032 <-    my D @ 2
    //  286529400 <- their D @ 2
    // 2147483648 <-- max
    
    // Main loop:
    for (i=0; i<64; i++) {
      //if (i>1) break;
      if (i < 16) {
        //console.log("B", toBin(b), toHex(b), b);
        //console.log("C", toBin(c), toHex(c), c);
        //console.log("D", toBin(d), toHex(d), d);
        //console.log("f = (",toBin(b)," & ",toBin(c),") | ((~",toBin(b),") & ",toBin(d),");");
        f = ((b & c) | ((~b) & d)) >>> 0;
        //console.log("F", toBin(f), toHex(f), f);
        g = i;
      } else if (i < 32) {
        f = (d & b) | ((~d) & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | (~d));
        g = (7 * i) % 16;
      }
      
      // Be wary of the below definitions of a,b,c,d
      f = (f + a + k[i] + w[g]) >>> 0;
      
      a = (b + leftRotate(f, s[i])) >>> 0;
      
      switch (i % 4) {
        case 0:
          console.log("[" + i + "]", "A=" + a, "B=" + b, "C=" + c, "D=" + d);
          break;
        case 1:
          console.log("[" + i + "]", "A=" + b, "B=" + c, "C=" + d, "D=" + a);
          break;
        case 2:
          console.log("[" + i + "]", "A=" + c, "B=" + d, "C=" + a, "D=" + b);
          break;
        case 3:
          console.log("[" + i + "]", "A=" + d, "B=" + a, "C=" + b, "D=" + c);
          break;
      }
      
      // twist
      e = a;
      a = d;
      d = c;
      c = b;
      b = e;
    }
    
    // Add this chunk's hash to result so far:
    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
    
    console.log("block=" + x + " processed:", "A=" + a0, "B=" + b0, "C=" + c0, "D=" + d0);
  }
  /*
  Produce the final hash value (big-endian):
  digest := hash := h0 append h1 append h2 append h3 append h4 append h5 append h6 append h7
  */
  digest = [
    a0,
    b0,
    c0,
    d0
  ];
  //console.log("digest\n", digest);
  
  var hash = digest.map(toHex);
  
  console.log("final values", hash);
  
  var output = hash.reduce(function(acc, val, idx) {
    console.log(acc, val, idx);
    var bytes = val.match(/.{1,2}/g);
    while (bytes.length) {
      acc.push(
        bytes.pop()
      );
    }
    return acc;
  }, []).join('');
  
  //console.log(typeof next);
  
  return "function" === typeof next ? next(output) : output;
}

// 822bb19d9d5a0b1346477f6c2b18e1fe === 5d41402abc4b2a76b9719d911017c592
// c5f20bce4e79acd3f767c2656edf3bc7 === 5d41402abc4b2a76b9719d911017c592

module.exports = md5;
