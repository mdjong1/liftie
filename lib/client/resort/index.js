var classes = require('classes');
var dataset = require('dataset');
var dom = require('./dom');

module.exports = resort;

function renderOpening(node, opening) {
  if (opening) {
    opening = opening.split('-');
    if (new Date(opening[0], opening[1] - 1, opening[2]).getTime() <= Date.now()) {
      dataset(node, 'opening', '');
      node = node.querySelector('.opening-date');
      node.parentNode.removeChild(node);
    }
  }
}

var plugins = ['lifts', 'twitter', 'weather', 'webcams', 'snow'].map(function(name) {
  var plugin = require('resort/' + name);
  plugin.type = name;
  return plugin;
});

function renderPlugins(node, getData) {
  var sec = dom.next(node); // extras section
  plugins.forEach(function (plugin) {
    var data = getData(plugin.type), el, show;
    if (!data) {
      return;
    }
    el = plugin.section ? sec.querySelector('.' + plugin.type) : node;
    if (!el) {
      return;
    }
    show = plugin(el, data);
    if (typeof show === 'boolean') {
      if (show) {
        classes(el).add('visible').remove('hidden');
      } else {
        classes(el).add('hidden').remove('visible');
      }
    }
  });
}

function render(node, resort) {
  var ds = dataset(node),
    tsPrev = JSON.parse(ds.get('timestamp')),
    tsCurr = resort.timestamp;

  renderPlugins(node, function (plugin) {
    if (!resort[plugin] || !tsCurr[plugin]) {
      // no data for a plugin
      return;
    }
    if (tsPrev[plugin] && tsCurr[plugin] <= tsPrev[plugin]) {
      // no new data - skip update
      return;
    }
    return resort[plugin];
  });
  renderOpening(node, ds.get('opening'));
  ds.set('timestamp', JSON.stringify(tsCurr));
}

function resort(node) {
  function refresh() {
    if (!classes(node).has('open')) {
      // skip closed resorts
      return;
    }

    var id = dataset(node, 'resort');
    fetch('/api/resort/' + id)
      .then(function(res) { return res.json(); })
      .then(function(resort) { render(node, resort); });
  }

  function init() {
    var ds = dataset(node);

    renderPlugins(node, function (plugin) {
      var data = ds.get(plugin);
      return data && JSON.parse(data);
    });
  }

  return {
    init: init,
    refresh: refresh,
    node: node
  };
}
