var hash = require('../dist/hash.js');
var assert = require('assert');
var chai = require('chai');
var expect = chai.expect;

describe('tokenize', function() {

  describe('regular paths', function() {

    xit('handles only string keys', function() {
      var tokens = hash.tokenize('one.two.three.four.five');
      expect(tokens).to.eql(['one', 'two', 'three', 'four','five']);
    });

    xit('handles string keys and numeric index', function() {
      var tokens = hash.tokenize('one[0].four');
      expect(tokens).to.eql(['one', 0,'four']);
    });

    xit('handles string keys and numeric indices mixed', function() {
      var tokens = hash.tokenize('[2][555].four[03].1');
      expect(tokens).to.eql([2, 555,'four', 3, '1']);
    });

  });

  describe('wildcard string paths', function() {

    xit('handes wildcard string tokens', function() {
      var tokens = hash.tokenize('one[0].{s}.{s}.four');
      expect(tokens).to.eql(['one', 0, '{s}', '{s}','four']);
    });

  });

  describe('regex paths', function() {

    xit('handles regex path tokens', function() {
      var tokens = hash.tokenize('one.[/test/i].{s}.four');
      expect(tokens).to.eql(['one', /test/i, '{s}','four']);
      var tokens = hash.tokenize('one.[/test/ig].{s}.four');
      expect(tokens).to.eql(['one', /test/ig, '{s}','four']);
    });

    xit('handles char match groups in brackets and wildcards', function() {

      var tokens = hash.tokenize('one.[/[a-z]/].{s}.four');
      expect(tokens).to.eql(['one', /[a-z]/, '{s}', 'four']);

      var tokens = hash.tokenize('one.[/[a-z].*[^\w]+/igm].{s}.four');
      expect(tokens).to.eql(['one', /[a-z].*[^\w]+/igm, '{s}', 'four']);

    });

    xit('handles char match groups in brackets', function() {

      var tokens = hash.tokenize('one.[/[0-9]\.\//g].{s}.[/four/]');
      console.log(tokens)
      expect(tokens).to.eql(['one', /[0-9]\.\//g, '{s}', /four/]);

    });

  });

});

describe('get', function() {

  var data;

  beforeEach(function() {

    data = {
      depth1: {
        arrayAt1: [
          99
        ],
        objectAt1: {
          valueAt2: 55
        }
      }
    };

  });

  describe('with a valid path', function() {

    it('fetches a value from objects', function() {
      var returned = hash.get(data, 'depth1.objectAt1.valueAt2');
      expect(returned).to.eq(data.depth1.objectAt1.valueAt2);
    });

    it('fetches a value from arrays', function() {
      var returned = hash.get(data, 'depth1.arrayAt1[0]');
      expect(returned).to.eq(data.depth1.arrayAt1[0]);
    });

  });

  describe('with an invalid path', function() {

    it('returns undefined', function() {
      expect(hash.get(data, 'one.two.three')).to.be.undefined;
    });

  });

});

describe('insert', function() {

  describe('with simple paths', function() {

    describe('with an empty destination', function() {

      it('sets a value to a simple path', function() {

        var data = {};
        hash.insert(data, 'one.two.three', 4);
        expect(data).to.deep.eq({
          one: {
            two: {
              three: 4
            }
          }
        });
      });

      it('sets a value to a simple path with indices', function() {

        var data = {};
        hash.insert(data, 'one[2].three[4][0]', 'shlomo');
        expect(data.one[2].three[4][0]).to.eq('shlomo');

      });

    });

    describe('with a populated destination', function() {

      var data;

      beforeEach(function() {

        data = {
          one: {
            two: [
              undefined,
              undefined,
              {
                three: {
                  four: [5]
                }
              }
            ]
          }
        };

      });

      it('sets a value to a simple path', function() {
        hash.insert(data, 'one.two[2].three.four[1]', 6);
        expect(data.one.two[2].three.four[1]).to.eq(6);
      });

    });

  });

  describe('with exotic paths', function() {

    describe('with a non-empty object', function() {

      var data;

      beforeEach(function() {
        data = {
          one: {
            two: [
              undefined,
              undefined,
              {
                three: {
                  four: 5,
                  six: 7,
                  eight: [
                    'nine'
                  ]
                }
              }
            ],
            twotwo: {
              threethree: []
            }
          }
        };
      });

      it('sets a value at an exotic {s} path', function() {

        hash.insert(data, 'one.two[2].three.{s}', 99);

        expect(data.one.two[2].three.four).to.eq(99);
        expect(data.one.two[2].three.six).to.eq(99);
        expect(data.one.two[2].three.eight).to.eq(99);

      });

      it('sets a value at an exotic {n} path', function() {

        hash.insert(data, 'one.two.{n}.three.four', 'grizzly');

        expect(data.one.two[0].three.four).to.eq('grizzly');
        expect(data.one.two[1].three.four).to.eq('grizzly');
        expect(data.one.two[2].three.four).to.eq('grizzly');

      });

      xit('sets a value at an exotic regex path', function() {

        hash.insert(data, 'one.[/two/].three', 1234);

        expect(data.one.two.three).to.eql(1234);
        expect(data.one.twotwo.three).to.eql(1234);

      });

      xit('sets a value at a combination exotic path', function() {

        hash.insert(data, 'one.two.{n}.three.[/[a-z]{4,}/].ten', 10);

        expect(data.one.two[0].three.four.ten).to.eq(10);
        expect(data.one.two[0].three.eight.ten).to.eq(10);
        expect(data.one.two[1].three.four.ten).to.eq(10);
        expect(data.one.two[1].three.eight.ten).to.eq(10);
        expect(data.one.two[2].three.four.ten).to.eq(10);
        expect(data.one.two[2].three.eight.ten).to.eq(10);

      });

    });

    describe('with an empty object', function() {

      var data;

      beforeEach(function() {
        data = {};
      });

      it('doesn\'t insert at exotic paths', function() {
        hash.insert(data, 'one.two.{n}.four', 3);
        expect(data).to.deep.eql({});
      });

      it('insert at simple path', function() {
        hash.insert(data, 'one.two.three[4]', 111);
        expect(data.one.two.three[4]).to.eql(111);
      });

    });

  });

});


describe('expand', function() {

  describe('given an object', function() {

    xit('expands a single path', function() {

      var nested = hash.expand({'one.two.three.four[5]': 6});
      expect(nested).to.deep.eql({
        one: {
          two: {
            three: {
              four: [
                undefined,
                undefined,
                undefined,
                undefined,
                6
              ]
            }
          }
        }
      });

    });

    xit('expands multiple paths', function() {

    });

  });

  describe('given tuples', function() {



  });

});

// describe("Hash", function() {

//   describe('#expand', function() {
//     it('simple, string-key nested', function() {
//       var flat = {
//         'One.Two.val': 'nested2',
//         'One.Two.Three.val': 'nested3',
//         'One.Two.Three.Four.val': 'nested4',
//         'One.Two.Three.Four.Five.val': 'nested5'
//       };

//       expect(Hash.expand(flat), {
//         One: {
//           Two: {
//             val: 'nested2',
//             Three: {
//               val: 'nested3',
//               Four: {
//                 val: 'nested4',
//                 Five: {
//                   val: 'nested5'
//                 }
//               }
//             }
//           }
//         }
//       }, 'Expands flattened object with only string keys.');

//     });

//     it('string-key and array nested', function() {
//       var flat = {
//         'One.0.val'         : 'first',
//         'One.1.Two.val'       : 'second',
//         'One.1.Two.Three.0.val'   : 'third',
//         'One.1.Two.Three.1.val'   : 'third'
//       };

//       expect(Hash.expand(flat), objectArchetype(1), 'Expands flatened object with numberic keys. Should result in arrays.');

//     });
//   });

//   describe('#extract', function() {
//     it('extracts values for token-numeric wildcard query', function() {
//       // 'Gets an array of "third" and "third", the values at the path One.1.Two.Three.{any numberic key}.val'
//       var data = objectArchetype(1);

//       expect(Hash.extract(data, 'One.1.Two.Three.{n}.val')).to.deep.equal([
//         'third',
//         'third'
//       ]);

//     });

//     it('Token string wildcard extraction', function() {
//       var data = objectArchetype(1);
//       // 'Extract path One.1.{s}, gets the values at One.1.{any string key}'
//       expect(Hash.extract(data, 'One.1.Two.{s}')).to.deep.equal([
//         'second',
//         [{
//           val: 'third'
//         },{
//           val: 'third'
//         }]
//       ]);
//     });
//   });

//   describe('#insert', function() {
//     it('insert at simple path', function() {
//       var data = objectArchetype(1);

//       Hash.insert(data, 'One.1.Two.valsibling', 'two');

//       expect(data).to.deep.equal({
//           One: [{
//             val: "first"
//           },{
//             Two: {
//               Three: [{
//                 val: 'third'
//               },{
//                 val: 'third'
//               }],
//               val: "second",
//               valsibling: 'two'
//             }
//           }]
//         }, 'Should insert sibling key "valsibling" in "Two" object with value "two"');
//     });

//     it('insert at simple path 2 - Array insert', function() {
//       var data = objectArchetype(1);

//       Hash.insert(data, 'One.1.Two.Three.2', {val: 'third'});

//       expect(data).to.deep.equal({
//           One: [{
//             val: "first"
//           },{
//             Two: {
//               Three: [{
//                 val: 'third'
//               },{
//                 val: 'third'
//               },{
//                 val: 'third'
//               }],
//               val: "second"
//             }
//           }]
//         }, 'Should insert object val: third into "Three" array at index 2');
//     });

//     it('insert at complex path', function() {
//       var data = objectArchetype(1);

//       Hash.insert(data, 'One.1.Two.{s}', 'replaced');

//       expect(data).to.deep.equal({
//           One: [{
//             val: "first"
//           },{
//             Two: {
//               Three: 'replaced',
//               val: 'replaced'
//             }
//           }]
//         }, 'Should replace all values in "Two" object that have string keys with "replaced" ');
//     });
//   });

//   describe('#remove', function() {
//     it('remove at simple path', function() {
//       var data = objectArchetype(1);

//       Hash.remove(data, 'One.1.Two.Three.1');

//       expect(data).to.deep.equal({
//           "One": [{
//             "val": "first"
//           },{
//             "Two": {
//               "val": "second",
//               "Three": [{
//                 "val": "third"
//               }]
//             }
//           }]
//         }, 'should have removed an object from the "Three" array of objects')
//     });


//     it('remove at complex path', function() {
//       var data = objectArchetype(1);

//       Hash.remove(data, 'One.1.Two.Three.{n}');

//       expect(data).to.deep.equal({
//           One: [{
//             val: "first"
//           },{
//             Two: {
//               val: "second"
//             }
//           }]
//         }, 'should have removed an object from the "Three" array of objects, path: One.1.Two.Three.{n}')
//     });
//   });

//   describe('#flatten', function() {
//     it('deep object', function() {

//       var date = new Date(),
//         regex = new RegExp();

//       var deepObject = {
//         One: {
//           Two: {
//             val: 'string',
//             Three: {
//               Four: 1,
//               Five: 2
//             }
//           }
//         },
//         Two: {
//           Two: {
//             Three: {
//               val: date
//             },
//             Four: {
//               val: regex
//             }
//           }
//         }
//       };

//       var flattened = Hash.flatten(deepObject);

//       expect(flattened).to.deep.equal({
//         'One.Two.val'     : 'string',
//         'One.Two.Three.Four'  : 1,
//         'One.Two.Three.Five'  : 2,
//         'Two.Two.Three.val'   : date,
//         'Two.Two.Four.val'    : regex,
//       }, 'flatten a deep object with native javascript objects inside');
//     });

//     it('simple flat', function() {

//       var shallowObject = {
//         one: 'val',
//         two: 'val',
//         three: 'val'
//       };

//       var flattened = Hash.flatten(shallowObject);

//       expect(flattened).to.deep.equal({
//         one: 'val',
//         two: 'val',
//         three: 'val'
//       }, 'flatten a shallow object');
//     });
//   });

// });

// function objectArchetype(key) {
//   if (key === 1) {
//     return new Object({
//       "One": [{
//         "val": "first"
//       },{
//         "Two": {
//           "val": "second",
//           "Three": [{
//             "val": "third"
//           },{
//             "val": "third"
//           }]
//         }
//       }]
//     });
//   }
// }