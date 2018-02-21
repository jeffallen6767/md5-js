
var 
  md5 = require("./index"),
  tester = require("testing"),
	fs = require('fs'),
  utf8 = require('utf8'),
  FORMAT_MAX_MSG_LEN = 45,
  tests = [],
  testData = [
    [
      "",
      "d41d8cd98f00b204e9800998ecf8427e"
    ],
    
    [
      "hello",
      "5d41402abc4b2a76b9719d911017c592"
    ],
    
    [
      "Jeffrey David Allen",
      "d057aa02f20fea60850fc54068e48079"
    ],

    [
      "The quick brown fox jumps over the lazy dog",
      "9e107d9d372bb6826bd81d3542a419d6"
    ],

    [
      "The quick brown fox jumps over the lazy dog.",
      "e4d909c290d0fb1ca068ffaddf22cbd0"
    ],
    
    [
      "í",
      "9defdf606bd9e5ba7861b78c0b50ecb2"
    ],

    [
      fs.readFileSync("./data/5k.txt", 'utf8'),
      "731e2eb7d2f961978583f9dac34c4e6a"
    ],
    
  
    [
      fs.readFileSync("./data/a_1m.dat.txt", 'utf8'),
      "7707d6ae4e027c70eea2a935c2296f21"
    ]
  
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
