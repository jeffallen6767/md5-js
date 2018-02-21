
var 
  md5 = require("./index"),
  tester = require("testing").config({
    "pass.color": "white",
    "fail.color": "white"
  }),
	fs = require('fs'),
  utf8 = require('utf8'),
  FORMAT_MAX_MSG_LEN = 40,
  tests = [],
  testData = [
    [
      "hello",
      "5d41402abc4b2a76b9719d911017c592"
    ],
    /*
    [
      "",
      "d41d8cd98f00b204e9800998ecf8427e"
    ],
    */
/*
    [
      "The quick brown fox jumps over the lazy dog",
      "9e107d9d372bb6826bd81d3542a419d6"
    ],

    [
      "The quick brown fox jumps over the lazy dog.",
      "e4d909c290d0fb1ca068ffaddf22cbd0"
    ],
    */
    /*
    [
      "í",
      "127035A8 FF26256E A0541B5A DD6DCC3E CDAEEA60 3E606F84 E0FD6349 2FBAB2C5"
    ],

    [
      "Jeffrey David Allen",
      "33F9383A 82D3ADE9 B4BD7BEB 43691ACA 9DFD2102 3D3102AD 5B02DA94 6BDF11E3"
    ],

    [
      fs.readFileSync("./data/5k.txt", 'utf8'),
      "82FF26C4 0E394578 2B37ECB7 CA844E60 E850C8B9 B1B5FBE3 4486AF29 FE8B612E"
    ],
    
  
    [
      fs.readFileSync("./data/a_1m.dat.txt", 'utf8'),
      "CDC76E5C 9914FB92 81A1C7E2 84D73E67 F1809A48 A497200E 046D39CC C7112CD0"
    ]
  */
  ];

function testFormat(msg, max) {
  var 
    quote = "'",
    max = max | 0,
    len = msg.length,
    result;
  if (max && len > max) {
    result = quote + msg.slice(0, max) + "..." + quote + " [+" + (len - max) + " more characters]";
  } else {
    result = quote + msg + quote;
  }
  return result;
}

testData.forEach(function(tdat) {
  
  var 
    message = tdat[0],
    expected = tdat[1].split(' ').join('').toLowerCase();

  tests["sync test md5() for " + testFormat(message, FORMAT_MAX_MSG_LEN)] = function(test) {
    test.startTime();
    var result = md5(
      utf8.encode(message)
    );
    test.endTime();
    test.assert.identical(result, expected);
    test.done();
  };
});

// run tests
tester.run(tests);
