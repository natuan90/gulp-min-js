(function(window, $) {
  var type = '';
  var clazyAtt = 'data-clazy';
  var clazyComp = 'clazy-complete';
  var clazyTimer = null;
  var cRender = function(entry, type, ioObj) {
    var ioImgObj;
    type === 'ioRender' ? ioImgObj = $(entry.target) : ioImgObj = $(entry);
    var ioImgChk = new Image();
    if(ioImgObj.attr(clazyAtt)){
      var ioImgPath = ioImgObj.attr(clazyAtt);
      ioImgChk.onload = function () {
        ioImgObj.animate({opacity : '0'}, {
          complete:function () {
            ioImgObj.attr('src', ioImgPath).animate({opacity : '1'}, 300);
            ioImgObj.removeAttr('style').addClass(clazyComp);
            if(type === 'ioRender'){ioObj.unobserve(entry.target);}
          }
        }, 200);
      }
      ioImgChk.onerror = function() {
        ioImgObj.animate({opacity : '0'}, {
          complete:function () {
            ioImgObj.attr('src', '//s.skygate.co.jp/images/common/lpframe/dmy_gene.jpg').animate({opacity : '1'}, 300);
            ioImgObj.removeAttr('style').addClass(clazyComp);
            if(type === 'ioRender'){ioObj.unobserve(entry.target);}
          }
        }, 200);
      }
      ioImgChk.src = ioImgPath;
    }
  }
  var clazyRender = function(entries) {
    entries.forEach(function(entry) {
      if(!$(entry).hasClass(clazyComp)){
        cRender(entry);
      }
    });
  }
  var ioClazyRender = function(entries, ioObj) {
    type = 'ioRender';
    entries.forEach(function(entry, i) {
      if (!entry.isIntersecting) return;
      cRender(entry, type, ioObj);
    });
  }
  $(function() {
    var clazySelector = '.clazy';
    $(clazySelector).css({
      'width': '48px',
      'height': '48px',
      'background-color':'rgba(255,255,255,0.9)',
      'border-radius': '6px',
      'display': 'block',
      'margin': '0 auto'
    });
    var clazyTarget = document.querySelectorAll(clazySelector);
    var clazyTargets = [].slice.call(clazyTarget,0);
    var clazyMargin = 200;
    if ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
      var options = {
        rootMargin: clazyMargin + 'px '+ clazyMargin +'px',
        threshold: [0]
      }
      var io = new IntersectionObserver(ioClazyRender, options);
      clazyTargets.forEach(function(ioItem) {
        io.observe(ioItem);
      });
    } else {
      clazyRender(clazyTargets);
    }
  });
})(window, jQuery);