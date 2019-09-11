(function(window, $) {
  var $document = $(document);
  var output = function(message) {
    if (window.console) {
      console.log(message);
    }
  };

  var hostName = document.location.hostname;
  var apiPath = "";
  if( hostName == "localhost" || hostName == "192.168.33.10"){
      apiPath = "https://www.skygate.co.jp";
  }

  var getUnderScoreTemplateString = function(id) {
    var str = $(id).html() || '';
    str = str.split('\r\n').join('\n');
    str = str.split('\r').join('\n');
    return _.map(str.split('\n'), function(s) {
      return $.trim(s);
    }).join('');
  };

  var framePromiseMapById = {};
  var framePromiseMapByKey = {};
  var getFrame = function(frameInfo) {
    var req = {};
    var frameId = frameInfo.frameId;
    var frameKey = frameInfo.frameKey;
    if (frameId) {
      if (framePromiseMapById[frameId]) {
        return framePromiseMapById[frameId];
      }
      if (frameId.indexOf(',') !== -1) {
        req.frameIds = _.map(frameId.split(','), function(id) {
          return $.trim(id);
        });
      } else {
        var promise = $.ajax(apiPath + '/common/frame?frameId=' + frameId, {
          cache: false
        });
        framePromiseMapById[frameId] = promise;
        return promise;
      }
    } else if (frameKey) {
      if (framePromiseMapByKey[frameKey]) {
        return framePromiseMapByKey[frameKey];
      }
      if (frameKey.indexOf(',') !== -1) {
        req.frameKeys = _.map(frameKey.split(','), function(key) {
          return $.trim(key);
        });
      } else {
        var promise = $.ajax(apiPath + '/common/frame?frameKey=' + frameKey, {
          cache: false
        });
        framePromiseMapByKey[frameKey] = promise;
        return promise;
      }
    } else { 
      return $.Deferred().reject();
    }
    return getFrames(req);
  };

  var getFrames = function(frameInfo) {
    var frameIds = frameInfo.frameIds;
    var frameKeys = frameInfo.frameKeys;
    var dfd = $.Deferred();
    var promises;
    if (frameIds) {
      promises = _.map(frameIds, function(id) {
        return getFrame({'frameId': id});
      });
    } else if (frameKeys) {
      promises = _.map(frameKeys, function(key) {
        return getFrame({'frameKey': key});
      });
    } else {
      return dfd.reject();
    }
    $.when.apply($, promises).done(function(var_args) {
      var results =  Array.prototype.slice.call(arguments);
      var args = frameIds || frameKeys
      var datas =  _.reduce(args, function(ret, arg, index) {
        ret[arg] = results[index][0];
        return ret;
      }, {});
      dfd.resolve({
        results: datas
      });
    });
    return dfd.promise();
  };

  var metaFramesMap = {};
  var getMetaFrames = function() {
    return _.reduce($('input[name=metaFrameIds]'), function(promises, target) {
      var promise = getFrame({'frameId': target.value}).done(function(data) {
        if (data.content && data.content.metaFrameIds) {
          $.extend(metaFramesMap, data.content.metaFrameIds);
        }
      });
      promises.push(promise);
      return promises;
    }, []);
  };

  var templateMap = {};
  var renderTemplates = function() {
    return _.reduce($('.frameItem'), function(renderingPromises, target) {
      var dfd = $.Deferred();
      var $target = $(target);
      var frameId = $target.attr('data-frameid');
      var frameKey = $target.attr('data-framekey');
      var frameName = $target.attr('data-framename');
      if (frameName) {
        frameId = metaFramesMap[frameName];
        if (!frameId) {
          output('frameName: ' + frameName + ' is undefined');
          dfd.resolve();
          return;
        }
      }
      if (!frameId && !frameKey) {
        output('frameId and frameKey are undefined');
        dfd.resolve();
        return;
      }
      var req = {};
      if (frameId) {
        req.frameId = frameId;
      } else {
        req.frameKey = frameKey;
      }
      getFrame(req).done(function(data) {
        if (!data) {
          $document.trigger('loadFrameItem', {
            frameData: data,
            targetElement: target
          });
          dfd.resolve();
          return;
        }
        var templateId = $target.attr('data-template');
        var template = templateMap[templateId];
        if (!template) {
          template = _.template(getUnderScoreTemplateString('#' + templateId));
          templateMap[templateId] = template;
        }
        $target.append(template(data));
        $document.trigger('loadFrameItem', {
          frameData: data,
          targetElement: target
        });
        dfd.resolve();
      });
      renderingPromises.push(dfd.promise());
      return renderingPromises;
    }, []);
  }

  $(function() {
    var metaFramePromises = getMetaFrames();
    $.when.apply($, metaFramePromises).done(function() {
      var renderingPromises = renderTemplates();
      $.when.apply($, renderingPromises).done(function() {
        _.each(_.keys(templateMap), function(id) {
          $('#' + id).remove();
        });
      });
    });
  });
})(window, jQuery);