(function() {
'use strict';

function getQueryVariable(variable) { // http://stackoverflow.com/a/2091331/776586
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) === variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

window.BoredPanda = window.BoredPanda || {};

BoredPanda.ContentTracking = {
  debugging: false,
  already_reported_views: {},
  already_reported_clicks: {},
  already_reported_views_ctr: {},
  already_reported_clicks_ctr: {},

  trackClicksOnRecommendationExperiment: function () {
    var self = this;
    $('section.recommended-posts').on('mousedown.tracker', 'article[data-track-ctr="true"]', function () {
      var postId = $(this).attr('data-post-id');
      if(self.already_reported_clicks_ctr[postId] === undefined) {
        self.already_reported_clicks_ctr[postId] = true;

        var experimentProperties = self.generateContentExperimentEventProperties($(this));
        var feedProperties = self.generateFeedEventProperties($(this));
        var properties = experimentProperties.concat(feedProperties);

        var event = self.generateEvent('feed_click', properties);
        self.sendEvent(event);
      }
    });
  },
  trackClicksOnPosts: function () {
    var self = this;
    $('section.posts').on('mousedown.tracker', 'article.post[data-content-experiment-enabled="true"]', function () {
      var postId = $(this).attr('data-post-id');
      if(self.already_reported_clicks[postId] === undefined) {
        self.already_reported_clicks[postId] = true;

        var experimentProperties = self.generateContentExperimentEventProperties($(this));
        var feedProperties = self.generateFeedEventProperties($(this));
        var properties = experimentProperties.concat(feedProperties);

        var event = self.generateEvent('feed_click', properties);
        self.sendEvent(event);
      }
    });
    $('section.posts').on('mousedown.tracker', 'article.post[data-track-ctr="true"]', function () {
      var postId = $(this).attr('data-post-id');
      if(self.already_reported_clicks_ctr[postId] === undefined) {
        self.already_reported_clicks_ctr[postId] = true;

        var experimentProperties = self.generateContentExperimentEventProperties($(this));
        var feedProperties = self.generateFeedEventProperties($(this));
        var properties = experimentProperties.concat(feedProperties);

        var event = self.generateEvent('feed_click', properties);
        self.sendEvent(event);
      }
    });

    $('section.posts').on('mousedown.tracker', 'article.post[data-track-ctr="true"] .vote-panel .btn-up', function () {
      var experimentProperties = self.generateContentExperimentEventProperties($(this).closest('article'));
      var feedProperties = self.generateFeedEventProperties($(this).closest('article'));
      var properties = experimentProperties.concat(feedProperties);

      var event = self.generateEvent('feed_upvote', properties);
      self.sendEvent(event);
    });
    $('section.posts').on('mousedown.tracker', 'article.post[data-content-experiment-enabled="true"] .vote-panel .btn-up', function () {
      var experimentProperties = self.generateContentExperimentEventProperties($(this).closest('article'));
      var feedProperties = self.generateFeedEventProperties($(this).closest('article'));
      var properties = experimentProperties.concat(feedProperties);

      var event = self.generateEvent('feed_upvote', properties);
      self.sendEvent(event);
    });

    $('section.posts').on('mousedown.tracker', 'article.post[data-track-ctr="true"] .vote-panel .btn-down', function () {
      var experimentProperties = self.generateContentExperimentEventProperties($(this).closest('article'));
      var feedProperties = self.generateFeedEventProperties($(this).closest('article'));
      var properties = experimentProperties.concat(feedProperties);

      var event = self.generateEvent('feed_downvote', properties);
      self.sendEvent(event);
    });
    $('section.posts').on('mousedown.tracker', 'article.post[data-content-experiment-enabled="true"] .vote-panel .btn-down', function () {
      var experimentProperties = self.generateContentExperimentEventProperties($(this).closest('article'));
      var feedProperties = self.generateFeedEventProperties($(this).closest('article'));
      var properties = experimentProperties.concat(feedProperties);

      var event = self.generateEvent('feed_downvote', properties);
      self.sendEvent(event);
    });
  },
  recommendationExperimentInit: function () {
    var self = this;
    $('article.popular-post-rec[data-track-ctr="true"]').unbind('inview');
    $('article.popular-post-rec[data-track-ctr="true"]').bind('inview', function(event, isInView) {
      if(isInView && $(this).attr('data-post-id') !== undefined) {
        self.processPostInView($(this));
      }
    });
  },
  realInit: function () {
    var self = this;
    self.debug('ContentTracking initializing');
    
    if(BoredPanda.Config.trackPageviews) {
      self.processPageViewEvent('pageview');
    }

    $('article.post[data-content-experiment-enabled="true"]').unbind('inview');
    $('article.post[data-track-ctr="true"]').unbind('inview');
    $('article.post[data-content-experiment-enabled="true"]').bind('inview', function (event, isInView) {
      if (isInView && $(this).attr('data-post-id') !== undefined) {
        self.processPostInView($(this));
      }
    });
    $('article.post[data-track-ctr="true"]').bind('inview', function(event, isInView) {
      if(isInView && $(this).attr('data-post-id') !== undefined) {
        self.processPostInView($(this));
      }
    });

    if(BoredPanda.Config.postId !== 0 && (getQueryVariable('_t') !== null || getQueryVariable('cexp_id') !== null )) {
      self.initContentEngagementTracker();
    }
  },
  initContentEngagementTracker: function() {
    var self = this;
    self.processPageViewEvent('pageview');

    setTimeout(function() {
      self.processPageViewEvent('pageview-not-quick-bounce-20');
    }, 20*1000);

    setTimeout(function() {
      self.processPageViewEvent('pageview-not-quick-bounce-40');
    }, 40*1000);

    $('.post-footer-reached').bind('inview', function(event, isInView) {
      if (isInView) {
        self.postContentBottomThreshold = $(window).scrollTop();
        self.processPageViewEvent('pageview-bottom-reached');
      }
    });

    $('.submission-upvote-tracker .btn-up').click(function() {
      var submissionId = $(this).closest('.open-list-item').attr('data-submission-id');
      if(submissionId === undefined) {
        return;
      }

      var experimentProperties = self.generateContentExperimentEventPropertiesFromUrl();
      var postProperties = self.generatePostPropertiesFromUrl();
      var properties = experimentProperties.concat(postProperties);
      properties.push({
        name: 'submission_id', value: submissionId
      });

      var event = self.generateEvent('submission_upvote', properties);
      self.sendEvent(event);
    });

    $('.submission-downvote-tracker .btn-down').click(function() {
      var submissionId = $(this).closest('.open-list-item').attr('data-submission-id');
      if(submissionId === undefined) {
        return;
      }

      var experimentProperties = self.generateContentExperimentEventPropertiesFromUrl();
      var postProperties = self.generatePostPropertiesFromUrl();
      var properties = experimentProperties.concat(postProperties);
      properties.push({
        name: 'submission_id', value: submissionId
      });

      var event = self.generateEvent('submission_downvote', properties);
      self.sendEvent(event);
    });

    $('.post-shares-footer .btn-up, .sharebar .vote-panel .btn-up').click(function() {
      var experimentProperties = self.generateContentExperimentEventPropertiesFromUrl();
      var postProperties = self.generatePostPropertiesFromUrl();
      var properties = experimentProperties.concat(postProperties);

      var event = self.generateEvent('post_upvote', properties);
      self.sendEvent(event);
    });

    $('.post-shares-footer .btn-down, .sharebar .vote-panel .btn-down').click(function() {
      var experimentProperties = self.generateContentExperimentEventPropertiesFromUrl();
      var postProperties = self.generatePostPropertiesFromUrl();
      var properties = experimentProperties.concat(postProperties);

      var event = self.generateEvent('post_downvote', properties);
      self.sendEvent(event);
    });
  },
  init: function() {
    if(typeof window.inviewLoaded !== 'undefined'){
      this.debug('Loaded');
      this.realInit();
    }
    else{
      this.debug('Not loaded yet');
      setTimeout(function(){
        BoredPanda.ContentTracking.init();
      },100);
    }
  },
  processPageViewEvent: function(topic) {
    var postId = BoredPanda.Config.postId;
    this.debug(postId + ' reporting pageview');

    var experimentProperties = this.generateContentExperimentEventPropertiesFromUrl();
    var postProperties = this.generatePostPropertiesFromUrl();
    var properties = experimentProperties.concat(postProperties);

    var source = getQueryVariable('utm_source');
    if (source !== null && postId !== 0) {
      var utmSource = [
        {name: 'utm_source', value: source}
      ];
      properties = properties.concat(utmSource);
    }

    this.debug(properties);

    var event = this.generateEvent(topic, properties);
    this.sendBatch([event]);
  },
  processPostInView: function (post) {
    var self = this;
    var postId = post.attr('data-post-id');
    var experimentIsRunning = post.attr('data-content-experiment-enabled') === 'true';

    if(self.already_reported_views[postId] !== undefined || self.already_reported_views_ctr[postId] !== undefined) {
      return;
    }

    self.debug(postId + ' in view');
    if (self.already_reported_views[postId] === undefined && experimentIsRunning) {
      self.already_reported_views[postId] = true;
    }
    if (self.already_reported_views_ctr[postId] === undefined && !experimentIsRunning) {
      self.already_reported_views_ctr[postId] = true;
    }

    var experimentProperties = self.generateContentExperimentEventProperties(post);
    var feedProperties = self.generateFeedEventProperties(post);
    var properties = experimentProperties.concat(feedProperties);

    var event = self.generateEvent('feed_impression', properties);
    self.sendEvent(event);

  },
  postPositionInFeed: function(post) {
    return $('section.posts article[data-post-id]').index(post);
  },
  generateContentExperimentEventProperties: function(post) {
    var experimentIsRunning = post.attr('data-content-experiment-enabled') === 'true';

    if(!experimentIsRunning) {
      return [];
    }

    var postId = post.attr('data-post-id');
    var variation = post.attr('data-content-experiment-variation');
    var experimentId = post.attr('data-content-experiment-id');

    var eventProperties = [
      {name: 'content_experiment_post_id', value: postId},
      {name: 'content_experiment_id', value: experimentId},
      {name: 'content_experiment_variation', value: variation}
    ];

    return eventProperties;
  },
  generateContentExperimentEventPropertiesFromUrl: function() {
    var experimentId = getQueryVariable('cexp_id');
    var variation = getQueryVariable('cexp_var');
    var postId = BoredPanda.Config.postId;

    if(experimentId === null) {
      return[];
    }

    var eventProperties = [
      {name: 'content_experiment_post_id', value: postId},
      {name: 'content_experiment_id', value: experimentId},
      {name: 'content_experiment_variation', value: variation}
    ];

    return eventProperties;
  },
  generatePostPropertiesFromUrl: function() {
    var postId = BoredPanda.Config.postId;
    var feed = getQueryVariable('_f');
    var utmCampaign = getQueryVariable('utm_campaign');

    if(postId === 0) {
      return[];
    }

    var eventProperties = [
      {name: 'post_id', value: postId}
    ];

    if(feed !== null) {
      eventProperties.push({
        name: 'feed',
        value: feed
      });
    }
    
    if(utmCampaign !== null) {
      eventProperties.push({
        name: 'utm_campaign',
        value: utmCampaign
      });
    }

    return eventProperties;
  },
  generateFeedEventProperties: function(post) {
    var postId = post.attr('data-post-id');
    var positionInFeed = this.postPositionInFeed(post);
    var postFeed = post.attr('data-current-feed');

    var eventProperties = [
      {name: 'post_id', value: postId},
      {name: 'position_in_feed', value: positionInFeed},
      {name: 'feed', value: postFeed}
    ];

    return eventProperties;
  },
  generateEvent: function (topic, properties, addPropertiesFromUrl) {
    addPropertiesFromUrl = addPropertiesFromUrl || true;

    if(addPropertiesFromUrl) {
      var urlProperties = this.generatePostPropertiesFromUrl();
      if(urlProperties.length > 0) {
        // don't duplicate the properties
        var uniqPropertiesPassed = [];
        if(properties.length > 0) {
          for(var i in properties) {
            uniqPropertiesPassed[properties[i]['name']] = true;
          }
        }

        for(var i in urlProperties) {
          var propName = urlProperties[i]['name'];
          if(uniqPropertiesPassed[propName] === undefined) {
            properties.push(urlProperties[i]);
          }
        }
      }
    }

    var identifiers = this.getIdentifiers();
    var event = {
      'topic': topic,
      'identifiers': identifiers,
      'properties': properties
    };

    return event;
  },
  sendEvent: function(event) {
    if (BoredPanda.Config.bpVersion !== 'com') {
      return;
    }
    var self = this;

    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify(event),
      dataType: 'json',
      success: function(data){
        self.debug('successfully submitted event');
        self.debug(data);
      },
      error: function(){
        self.debug('Failed to submit event');
      },
      // processData: false,
      type: 'POST',
      url: BoredPanda.Config.gatewayUrl + '/event/submit'
    });
  },
  sendBatch: function(events) {
    if (BoredPanda.Config.bpVersion !== 'com') {
      return;
    }
    var self = this;

    $.ajax({
      contentType: 'application/json',
      data: JSON.stringify(events),
      dataType: 'json',
      success: function(data){
        self.debug('successfully submitted event');
        self.debug(data);
      },
      error: function(){
        self.debug('Failed to submit event');
      },
      // processData: false,
      type: 'POST',
      url: BoredPanda.Config.gatewayUrl + '/event/submit_batch'
    });
  },
  getIdentifiers: function() {
    var loggedInUser = undefined;
    var guestUserCookie = undefined;

    if(BoredPanda.Config.userId !== undefined && BoredPanda.Config.userId > 0) {
      loggedInUser = {'type': 'bp_user', 'value': BoredPanda.Config.userId};
    }

    if($.cookie !== undefined) {
      var storedId = $.cookie('bp_guest_id');
      if(storedId === undefined) {
        storedId = this.generateGuestUserId();
        $.cookie('bp_guest_id', storedId, { expires: 365, path: '/' });
      }
      guestUserCookie = {'type': 'bp_web_cookie', 'value': storedId };
    } else {
      guestUserCookie = {'type': 'bp_web_cookie', 'value': this.generateGuestUserId() };
    }

    var identificators = [];

    if(loggedInUser !== undefined) {
      identificators.push(loggedInUser);
    }

    if(guestUserCookie !== undefined) {
      identificators.push(guestUserCookie);
    }

    return identificators;
  },
  generateGuestUserId: function() {
    var randomBit = Math.ceil(Math.random() * ((Number.MAX_SAFE_INTEGER !== undefined) ? Number.MAX_SAFE_INTEGER : 99999999));

    var currentTimestamp = new Date();
    currentTimestamp = currentTimestamp.getTime();

    var randomID = randomBit.toString() + currentTimestamp.toString();

    return randomID;
  },
  // Called by infinite scroll plugin
  onFeedPageLoad: function () {
    this.debug('Page loaded');
    this.init();
  },
  debug: function (msg) {
    if (!this.debugging) return;

    console.log(msg);
  },
  initRecommendationsTracking: function () {
    if (BoredPanda.Config.bpPartner === true || !BoredPanda.Config.trackRecommendations) {
      return;
    }

    var recommendationsSent = false;
    var self = this;
    var events = [];

    var trackRecommendations = function () {
      if (typeof window.inviewLoaded === 'undefined') {
        setTimeout(trackRecommendations, 100);
      } else {
        $('.track-recommendation-block').bind('inview', function(event, isInView) {
          if (isInView && !recommendationsSent) {
            recommendationsSent = true;
            var selector = $(document).width() <= 580 ? '.track-recommendation-block .track-recommendation' : '.track-recommendation';

            $(selector).each(function() {
              var postId = $(this).attr('data-post-id');
              var type = $(this).attr('data-type');
              var properties = [
                {
                  name: 'recommended_post_id',
                  value: postId
                }, {
                  name: 'recommendation_type',
                  value: type
                }
              ];

              events.push(self.generateEvent('recommendation_seen', properties, false));
            });

            self.sendBatch(events);
          }
        });
      }
    };

    trackRecommendations();

    $(document).on('mousedown.tracker', '.track-recommendation a', function () {
      var postId = $(this).parent().attr('data-post-id');
      var type = $(this).parent().attr('data-type');

      var properties = [
        {
          name: 'recommended_post_id',
          value: postId
        }, {
          name: 'recommendation_type',
          value: type
        }
      ];

      var event = self.generateEvent('recommendation_click', properties, false);
      self.sendEvent(event);
    });
  }
};

$(document).ready(function () {
  BoredPanda.ContentTracking.init();
  BoredPanda.ContentTracking.initRecommendationsTracking();
  BoredPanda.ContentTracking.trackClicksOnPosts();
  BoredPanda.ContentTracking.trackClicksOnRecommendationExperiment();
});
}());