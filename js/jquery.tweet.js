(function($) {
 
  $.fn.tweet = function(o){
    var s = {
      username: ["lasciolitalia"],            // [string]   required, unless you want to display our tweets. :) it can be an array, just do ["username1","username2","etc"]
      list: null,                             // [string]   optional name of list belonging to username
      avatar_size: 48,                        // [integer]  height and width of avatar if displayed (48px max)
      count: 10,                              // [integer]  how many tweets to display?
      intro_text: null,                       // [string]   do you want text BEFORE your your tweets?
      outro_text: null,                       // [string]   do you want text AFTER your tweets?
      join_text:  null,                       // [string]   optional text in between date and tweet, try setting to "auto"
      auto_join_text_default: "i said,",      // [string]   auto text for non verb: "i said" bullocks
      auto_join_text_ed: "i",                 // [string]   auto text for past tense: "i" surfed
      auto_join_text_ing: "i am",             // [string]   auto tense for present tense: "i was" surfing
      auto_join_text_reply: "i replied to",   // [string]   auto tense for replies: "i replied to" @someone "with"
      auto_join_text_url: "i was looking at", // [string]   auto tense for urls: "i was looking at" http:...
      loading_text: null,                     // [string]   optional loading text, displayed while tweets load
      query: null //'%23lasciolitalia'               // [string]   optional search query
    };
    
    if(o) $.extend(s, o);
    
    $.fn.extend({
      linkUrl: function() {
        var returning = [];
        var regexp = /((ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)/gi;
        this.each(function() {
          returning.push(this.replace(regexp,"<a href=\"$1\">$1</a>"));
        });
        return $(returning);
      },
      linkUser: function() {
        var returning = [];
        var regexp = /[\@]+([A-Za-z0-9-_]+)/gi;
        this.each(function() {
          returning.push(this.replace(regexp,"<a href=\"http://twitter.com/$1\">@$1</a>"));
        });
        return $(returning);
      },
      linkHash: function() {
        var returning = [];
        var regexp = / [\#]+([A-Za-z0-9-_]+)/gi;
        this.each(function() {
          returning.push(this.replace(regexp, ' <a href="http://twitter.com/#search/%23$1">#$1</a>'));
        });
        return $(returning);
      },
      capAwesome: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/\b(awesome)\b/gi, '<span class="awesome">$1</span>'));
        });
        return $(returning);
      },
      capEpic: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/\b(epic)\b/gi, '<span class="epic">$1</span>'));
        });
        return $(returning);
      },
      makeHeart: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>"));
        });
        return $(returning);
      }
    });

    function relative_time(time_value) {
      var parsed_date = Date.parse(time_value);
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
      var pluralize = function (singular, n) {
        return '' + n + ' ' + singular + (n == 1 ? '' : 's');
      };
      if(delta < 60) {
      return 'meno di un minuto fa';
      } else if(delta < (45*60)) {
      return 'circa ' + parseInt(delta / 60) + '\' fa';
      } else if(delta < (24*60*60)) {
      return 'circa ' + parseInt(delta / 3600) + 'h fa';
      } else {
      return 'circa ' + parseInt(delta / 86400) + 'giorni ago';
      }
    }

    function build_url() {
      return 'http://search.twitter.com/search.json?&q=%23lasciolitalia&callback=?';
    }

    return this.each(function(){
      var list = $('<ul id="tweets">').appendTo(this);
      var intro = '<p id="intro">'+s.intro_text+'</p>';
      var outro = '<p id="outro">'+s.outro_text+'</p>';
      var loading = $('<p id="loading">'+s.loading_text+'</p>');

      if(typeof(s.username) == "string"){
        s.username = [s.username];
      }

      if (s.loading_text) $(this).append(loading);

      $.getJSON(build_url(), function(data) {
        if (s.loading_text) loading.remove();
        if (s.intro_text) list.before(intro);    
        
        $.each((data.results || data), function(i, item) {
          
          var from_user = item.from_user || item.user.screen_name;
          var profile_image_url = item.profile_image_url || item.user.profile_image_url;
          
          var avatar_template = '<a class="avatar" href="http://twitter.com/'+from_user+'"><img src="'+profile_image_url+'" height="'+s.avatar_size+'" width="'+s.avatar_size+'" alt="'+from_user+'\'s avatar" title="'+from_user+'\'s avatar" border="0"/></a>';
          var avatar = (s.avatar_size ? avatar_template : '');
          
          var text = $([item.text]).linkUrl().linkUser().linkHash().makeHeart().capAwesome().capEpic()[0];
          var date = '<a class="timestamp" href="http://twitter.com/'+from_user+'/statuses/'+item.id+'" title="Leggi il tweet su Twitter">' + relative_time(item.created_at) + '</a>';

          // until we create a template option, arrange the items below to alter a tweet's display.
          list.append('<li>' + text + avatar + date + '</li>');

          list.children('li:first').addClass('tweet_first');
          list.children('li:odd').addClass('tweet_even');
          list.children('li:even').addClass('tweet_odd');
        });
        if (s.outro_text) list.after(outro);
      });

    });
  };
})(jQuery);
