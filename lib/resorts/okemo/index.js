var select = require('../../select');
var debug = require('debug')('liftie:resort:okemo');


function trim(str) {
  return str.replace(/&nbsp;/g, '').trim();
}

function parse(dom) {
  var liftStatus = {};

  select(select(dom, '#panelOne div')[2], 'td').forEach(function(td) {
    td.children.forEach(function(node) {
      var name;
      if (node.type === 'text') {
        name = trim(node.data);
        if (name.length) {
          liftStatus[name] = 'closed';
        }
      } else if (node.type === 'tag' && node.name === 'b') {
        // open in bold! - special price to Okemo for originality
        name = trim(node.children[0].data);
        liftStatus[name] = 'open';
      }
    });
  });

  debug('Okemo Lift Status:', liftStatus);
  return liftStatus;
}

module.exports = parse;