var moment = require('moment');
var classes = require('classes');
var dom = require('./dom');

module.exports = render;

function splice(str, start, end, replacement) {
  return [str.slice(0, start), replacement, str.slice(end)].join('');
}

function adjustText(tweet) {
  tweet.textAdjustment
  .sort(function(a, b) {
    // sort in reversed order
    return b.indices[0] - a.indices[0];
  })
  .forEach(function(adj) {
    tweet.text = splice(tweet.text, adj.indices[0], adj.indices[1], adj.text);
  });
  delete tweet.textAdjustment;
}

function createTextAdjustment(opt) {
    return {
      indices: opt.indices,
      text: '<a href="' + opt.href + '" target="_blank">' + opt.text + '</a>'
    };
}

function parseHashtags(entities, parsed) {
  if(!entities.hashtags) {
    return;
  }
  entities.hashtags.forEach(function(tag) {
    var ta = createTextAdjustment({
      href: 'https://twitter.com/search/%23' + tag.text,
      text: '#' + tag.text,
      indices: tag.indices
    });
    parsed.textAdjustment.push(ta);
  });
}

function parseUserMentions(entities, parsed) {
  if(!entities.user_mentions) {
    return;
  }
  entities.user_mentions.forEach(function(mention) {
    var ta = createTextAdjustment({
      href: 'https://twitter.com/intent/user?user_id=' + mention.id_str,
      text: '@' + mention.name,
      indices: mention.indices
    });
    parsed.textAdjustment.push(ta);
  });
}

function parseMedia(entities, parsed) {
  if(!entities.media) {
    return;
  }
  entities.media.forEach(function(media) {
    if(!parsed.photo && media.type !== 'photo') {
      return;
    }
    parsed.photo = {
      url: media.expanded_url,
      src: media.media_url_https
    };
    parsed.textAdjustment.push({
      indices: media.indices,
      text: ''
    });
  });
}

function parseUrls(entities, parsed) {
  if(!entities.urls) {
    return;
  }
  entities.urls.forEach(function(url) {
    var ta = createTextAdjustment({
      href: url.expanded_url,
      text: url.display_url,
      indices: url.indices
    });
    parsed.textAdjustment.push(ta);
  });
}

// interesting things about the tweet
// item.created_at
// item.text - tweet text
// item.entities - hashtags, urls, user_mentions, media (type: photo)
function parseTweet(tweet, username) {
  var parsed = {
    href: 'https://twitter.com/' + username + '/status/' + tweet.id_str,
    text: tweet.text,
    date: moment(tweet.created_at).fromNow(),
    textAdjustment: []
  };
  [parseMedia, parseHashtags, parseUserMentions, parseUrls].forEach(function(fn) {
    fn.call(null, tweet.entities, parsed);
  });
  adjustText(parsed);
  return parsed;
}

// .twitter-timeline
//   .follow
//   ul.timeline
//     for tweet in resort.twitter.tweets
//       li.tweet
//         a.date(href="https://twitter.com/#{resort.twitter.user}/status/#{tweet.id_str}")= tweet.created_at
//         .text= tweet.text

function tweet2dom(tweet) {
  var img, content = [
    dom.el('a', tweet.date, { href: tweet.href, class: 'date' }),
    dom.el('div', tweet.text, { class: 'text' })
  ];
  if (tweet.photo) {
    img = dom.el('img', '', { src: tweet.photo.src });
    content.push(dom.el('a', img, { class: 'photo', href: tweet.photo.url,  target: '_blank' }));
  }

  content = content.join('');
  return dom.el('li', content, { class: 'tweet' });
}

function renderTweets(timeline, twitter) {
  timeline.innerHTML = twitter.tweets.map(function(tweet) {
    return parseTweet(tweet, twitter.user);
  })
  .map(tweet2dom)
  .join('');
}

function render(node, twitter) {
  var extras = dom.next(node), tt;
  if (!extras) {
    return;
  }

  tt = extras.querySelector('.twitter-timeline');

  if (twitter) {
    renderTweets(tt.querySelector('.timeline'), twitter);
    classes(tt).add('visible').remove('hidden');
  }
  else {
    classes(tt).add('hidden').remove('visible');
  }
}