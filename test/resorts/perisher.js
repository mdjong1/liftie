const should = require('should');
const { createReadStream } = require('fs');
const parser = require('../../lib/lifts/parser');
const parse = require('../../lib/lifts/parse')('perisher');

/*global describe, it */
describe('parse perisher', function() {

  it('should return lift status', function(done) {
    var stream = createReadStream(__dirname + '/example/perisher.html');
    stream.on('error', done);
    stream.pipe(parser(parse, function(err, status) {
      var expected = {
        'Eyre T-Bar': 'closed',
        'International T-Bar': 'closed',
        'Mt Perisher Double Chair': 'closed',
        'Mt Perisher Triple Chair': 'closed',
        'Sun Valley T-Bar': 'closed',
        'Olympic T-Bar': 'closed',
        'Happy Valley T-Bar': 'closed',
        'Leichhardt T-Bar*': 'closed',
        'Home Rope Tow': 'closed',
        'Lawson T-Bar*': 'closed',
        'Blaxland T-Bar *': 'closed',
        'Wentworth T-Bar *': 'closed',
        'Quad Express (No Foot Passengers)': 'closed',
        'Sturt T-Bar*': 'closed',
        'Village 8 Express Chair': 'closed',
        'Mitchell T-Bar': 'closed',
        'Tom Thumb': 'closed',
        'Telemark T-Bar': 'closed',
        'Pretty Valley Double Chair': 'closed',
        'North Perisher T-Bar': 'closed',
        'Interceptor Quad Chair': 'closed',
        'Ski Carpet No. 1': 'closed',
        'Ski Carpet No. 2': 'closed',
        'Ski Carpet No. 3': 'closed',
        'Ski Carpet No. 4': 'closed',
        'Piper T-Bar': 'closed',
        'Link T-Bar': 'closed',
        'Burke T-Bar': 'closed',
        'Wills T-Bar': 'closed',
        'Kaaten Triple Chair': 'closed',
        'Hume T-Bar': 'closed',
        'Captain Cook J-Bar': 'closed',
        'Scott J-Bar': 'closed',
        'Zoe\'s Ski Carpet': 'closed',
        'Harry\'s & Herman\'s Ski Carpet': 'closed',
        'Ridge Quad Chair': 'closed',
        'Summit Quad Chair*': 'closed',
        'Pony Ride Carpet': 'closed',
        'Early Starter Double Chair*': 'closed',
        'Terminal Quad Chair*': 'closed',
        'Brumby T-Bar': 'closed',
        'Blue Cow Ski School Rope Tow': 'closed',
        'Pleasant Valley Quad Chair': 'closed',
        'Freedom Quad Chair': 'closed',
        'Blue Cow T-Bar': 'closed',
        'Blue Calf T-Bar': 'closed',
        'Carpark Double Chair': 'closed',
        'Tube Town': 'closed'
      };
      should.exist(status);
      status.should.eql(expected);
      done(err);
    }));
  });
});
