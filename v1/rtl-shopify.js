
console.log("ch 1")
function WebUiPopover(window, document, undefined) {

    !(function (t) {
        (function (t) {
            "use strict";
            t.fn.typeWatch = function (e) {
                var o = ["TEXT", "TEXTAREA", "PASSWORD", "TEL", "SEARCH", "URL", "EMAIL", "DATETIME", "DATE", "MONTH", "WEEK", "TIME", "DATETIME-LOCAL", "NUMBER", "RANGE", "DIV"];
                var i = t.extend({ wait: 750, callback: function () { }, highlight: true, captureLength: 2, allowSubmit: false, inputTypes: o }, e);
                function n(t, e) {
                    var o = t.type === "DIV" ? jQuery(t.el).html() : jQuery(t.el).val();
                    if ((o.length >= i.captureLength && o != t.text) || (e && (o.length >= i.captureLength || i.allowSubmit)) || (o.length == 0 && t.text)) {
                        t.text = o;
                        t.cb.call(t.el, o);
                    }
                }
                function r(t) {
                    var e = (t.type || t.nodeName).toUpperCase();
                    if (jQuery.inArray(e, i.inputTypes) >= 0) {
                        var o = { timer: null, text: e === "DIV" ? jQuery(t).html() : jQuery(t).val(), cb: i.callback, el: t, type: e, wait: i.wait };
                        if (i.highlight && e !== "DIV")
                            jQuery(t).focus(function () {
                                this.select();
                            });
                        var r = function (t) {
                            var i = o.wait;
                            var r = false;
                            var a = e;
                            if (typeof t.keyCode != "undefined" && t.keyCode == 13 && a !== "TEXTAREA" && e !== "DIV") {
                                console.log("OVERRIDE");
                                i = 1;
                                r = true;
                            }
                            var s = function () {
                                n(o, r);
                            };
                            clearTimeout(o.timer);
                            o.timer = setTimeout(s, i);
                        };
                        jQuery(t).on("keydown paste cut input", r);
                    }
                }
                return this.each(function () {
                    r(this);
                });
            };
        })(t.jQuery);
    })(window)

    'use strict';
    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            // Register as an anonymous AMD module.
            define(['jquery'], factory);
        } else if (typeof exports === 'object') {
            // Node/CommonJS
            module.exports = factory(require('jquery'));
        } else {
            // Browser globals
            factory(window.jQuery);
        }
    }

        (function () {
            const $ = window.jQuery
            // Create the defaults once
            var pluginName = 'webuiPopover';
            var pluginClass = 'webui-popover';
            var pluginType = 'webui.popover';
            var defaults = {
                placement: 'auto',
                container: null,
                width: 'auto',
                height: 'auto',
                trigger: 'click', //hover,click,sticky,manual
                style: '',
                selector: false, // jQuery selector, if a selector is provided, popover objects will be delegated to the specified. 
                delay: {
                    show: null,
                    hide: 300
                },
                async: {
                    type: 'GET',
                    before: null, //function(that, xhr, settings){}
                    success: null, //function(that, xhr){}
                    error: null //function(that, xhr, data){}
                },
                cache: true,
                multi: false,
                arrow: true,
                title: '',
                content: '',
                closeable: false,
                padding: true,
                url: '',
                type: 'html',
                direction: '', // ltr,rtl
                animation: null,
                template: '<div class="webui-popover">' +
                    '<div class="webui-arrow"></div>' +
                    '<div class="webui-popover-inner">' +
                    '<a href="#" class="close"></a>' +
                    '<h3 class="webui-popover-title"></h3>' +
                    '<div class="webui-popover-content"><i class="icon-refresh"></i> <p>&nbsp;</p></div>' +
                    '</div>' +
                    '</div>',
                backdrop: false,
                dismissible: true,
                onShow: null,
                onHide: null,
                abortXHR: true,
                autoHide: false,
                offsetTop: 0,
                offsetLeft: 0,
                iframeOptions: {
                    frameborder: '0',
                    allowtransparency: 'true',
                    id: '',
                    name: '',
                    scrolling: '',
                    onload: '',
                    height: '',
                    width: ''
                },
                hideEmpty: false
            };

            var rtlClass = pluginClass + '-rtl';
            var _srcElements = [];
            var backdrop = $('<div class="webui-popover-backdrop"></div>');
            var _globalIdSeed = 0;
            var _isBodyEventHandled = false;
            var _offsetOut = -2000; // the value offset  out of the screen
            var $document = $(document);

            var toNumber = function (numeric, fallback) {
                return isNaN(numeric) ? (fallback || 0) : Number(numeric);
            };

            var getPopFromElement = function ($element) {
                return $element.data('plugin_' + pluginName);
            };

            var hideAllPop = function () {
                var pop = null;
                for (var i = 0; i < _srcElements.length; i++) {
                    pop = getPopFromElement(_srcElements[i]);
                    if (pop) {
                        pop.hide(true);
                    }
                }
                $document.trigger('hiddenAll.' + pluginType);
            };

            var hideOtherPops = function (currentPop) {
                var pop = null;
                for (var i = 0; i < _srcElements.length; i++) {
                    pop = getPopFromElement(_srcElements[i]);
                    if (pop && pop.id !== currentPop.id) {
                        pop.hide(true);
                    }
                }
                $document.trigger('hiddenAll.' + pluginType);
            };

            var isMobile = ('ontouchstart' in document.documentElement) && (/Mobi/.test(navigator.userAgent));

            var pointerEventToXY = function (e) {
                var out = {
                    x: 0,
                    y: 0
                };
                if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                    var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    out.x = touch.pageX;
                    out.y = touch.pageY;
                } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'click') {
                    out.x = e.pageX;
                    out.y = e.pageY;
                }
                return out;
            };



            // The actual plugin constructor
            function WebuiPopover(element, options) {
                this.$element = $(element);
                if (options) {
                    if ($.type(options.delay) === 'string' || $.type(options.delay) === 'number') {
                        options.delay = {
                            show: options.delay,
                            hide: options.delay
                        }; // bc break fix
                    }
                }
                this.options = $.extend({}, defaults, options);
                this._defaults = defaults;
                this._name = pluginName;
                this._targetclick = false;
                this.init();
                _srcElements.push(this.$element);
                return this;

            }

            WebuiPopover.prototype = {
                //init webui popover
                init: function () {
                    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
                        throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
                    }

                    if (this.getTrigger() !== 'manual') {
                        //init the event handlers
                        if (isMobile) {
                            this.$element.off('touchend', this.options.selector).on('touchend', this.options.selector, $.proxy(this.toggle, this));
                        } else if (this.getTrigger() === 'click') {
                            this.$element.off('click', this.options.selector).on('click', this.options.selector, $.proxy(this.toggle, this));
                        } else if (this.getTrigger() === 'hover') {
                            this.$element
                                .off('mouseenter mouseleave click', this.options.selector)
                                .on('mouseenter', this.options.selector, $.proxy(this.mouseenterHandler, this))
                                .on('mouseleave', this.options.selector, $.proxy(this.mouseleaveHandler, this));
                        }
                    }
                    this._poped = false;
                    this._inited = true;
                    this._opened = false;
                    this._idSeed = _globalIdSeed;
                    this.id = pluginName + this._idSeed;
                    // normalize container
                    this.options.container = $(this.options.container || document.body).first();

                    if (this.options.backdrop) {
                        backdrop.appendTo(this.options.container).hide();
                    }
                    _globalIdSeed++;
                    if (this.getTrigger() === 'sticky') {
                        this.show();
                    }

                    if (this.options.selector) {
                        this._options = $.extend({}, this.options, {
                            selector: ''
                        });
                    }

                },
                /* api methods and actions */
                destroy: function () {
                    var index = -1;

                    for (var i = 0; i < _srcElements.length; i++) {
                        if (_srcElements[i] === this.$element) {
                            index = i;
                            break;
                        }
                    }

                    _srcElements.splice(index, 1);


                    this.hide();
                    this.$element.data('plugin_' + pluginName, null);
                    if (this.getTrigger() === 'click') {
                        this.$element.off('click');
                    } else if (this.getTrigger() === 'hover') {
                        this.$element.off('mouseenter mouseleave');
                    }
                    if (this.$target) {
                        this.$target.remove();
                    }
                },
                getDelegateOptions: function () {
                    var options = {};

                    this._options && $.each(this._options, function (key, value) {
                        if (defaults[key] !== value) {
                            options[key] = value;
                        }
                    });
                    return options;
                },
                /*
                    param: force    boolean value, if value is true then force hide the popover
                    param: event    dom event,
                */
                hide: function (force, event) {

                    if (!force && this.getTrigger() === 'sticky') {
                        return;
                    }
                    if (!this._opened) {
                        return;
                    }
                    if (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    if (this.xhr && this.options.abortXHR === true) {
                        this.xhr.abort();
                        this.xhr = null;
                    }


                    var e = $.Event('hide.' + pluginType);
                    this.$element.trigger(e, [this.$target]);
                    if (this.$target) {
                        this.$target.removeClass('in').addClass(this.getHideAnimation());
                        var that = this;
                        setTimeout(function () {
                            that.$target.hide();
                            if (!that.getCache()) {
                                that.$target.remove();
                                //that.getTriggerElement.removeAttr('data-target');
                            }
                        }, that.getHideDelay());
                    }
                    if (this.options.backdrop) {
                        backdrop.hide();
                    }
                    this._opened = false;
                    this.$element.trigger('hidden.' + pluginType, [this.$target]);

                    if (this.options.onHide) {
                        this.options.onHide(this.$target);
                    }

                },
                resetAutoHide: function () {
                    var that = this;
                    var autoHide = that.getAutoHide();
                    if (autoHide) {
                        if (that.autoHideHandler) {
                            clearTimeout(that.autoHideHandler);
                        }
                        that.autoHideHandler = setTimeout(function () {
                            that.hide();
                        }, autoHide);
                    }
                },
                delegate: function (eventTarget) {
                    var self = $(eventTarget).data('plugin_' + pluginName);
                    if (!self) {
                        self = new WebuiPopover(eventTarget, this.getDelegateOptions());
                        $(eventTarget).data('plugin_' + pluginName, self);
                    }
                    return self;
                },
                toggle: function (e) {
                    var self = this;
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (this.options.selector) {
                            self = this.delegate(e.currentTarget);
                        }
                    }
                    self[self.getTarget().hasClass('in') ? 'hide' : 'show']();
                },
                hideAll: function () {
                    hideAllPop();
                },
                hideOthers: function () {
                    hideOtherPops(this);
                },
                /*core method ,show popover */
                show: function () {
                    if (this._opened) {
                        return;
                    }
                    //removeAllTargets();
                    var
                        $target = this.getTarget().removeClass().addClass(pluginClass).addClass(this._customTargetClass);
                    if (!this.options.multi) {
                        this.hideOthers();
                    }

                    // use cache by default, if not cache setted  , reInit the contents
                    if (!this.getCache() || !this._poped || this.content === '') {
                        this.content = '';
                        this.setTitle(this.getTitle());
                        if (!this.options.closeable) {
                            $target.find('.close').off('click').remove();
                        }
                        if (!this.isAsync()) {
                            this.setContent(this.getContent());
                        } else {
                            this.setContentASync(this.options.content);
                        }

                        if (this.canEmptyHide() && this.content === '') {
                            return;
                        }
                        $target.show();
                    }

                    this.displayContent();

                    if (this.options.onShow) {
                        this.options.onShow($target);
                    }

                    this.bindBodyEvents();
                    if (this.options.backdrop) {
                        backdrop.show();
                    }
                    this._opened = true;
                    this.resetAutoHide();
                },
                displayContent: function () {
                    var
                        //element postion
                        elementPos = this.getElementPosition(),
                        //target postion
                        $target = this.getTarget().removeClass().addClass(pluginClass).addClass(this._customTargetClass),
                        //target content
                        $targetContent = this.getContentElement(),
                        //target Width
                        targetWidth = $target[0].offsetWidth,
                        //target Height
                        targetHeight = $target[0].offsetHeight,
                        //placement
                        placement = 'bottom',
                        e = $.Event('show.' + pluginType);

                    if (this.canEmptyHide()) {

                        var content = $targetContent.children().html();
                        if (content !== null && content.trim().length === 0) {
                            return;
                        }
                    }

                    //if (this.hasContent()){
                    this.$element.trigger(e, [$target]);
                    //}
                    // support width as data attribute
                    var optWidth = this.$element.data('width') || this.options.width;
                    if (optWidth === '') {
                        optWidth = this._defaults.width;
                    }

                    if (optWidth !== 'auto') {
                        $target.width(optWidth);
                    }

                    // support height as data attribute
                    var optHeight = this.$element.data('height') || this.options.height;
                    if (optHeight === '') {
                        optHeight = this._defaults.height;
                    }

                    if (optHeight !== 'auto') {
                        $targetContent.height(optHeight);
                    }

                    if (this.options.style) {
                        this.$target.addClass(pluginClass + '-' + this.options.style);
                    }

                    //check rtl
                    if (this.options.direction === 'rtl' && !$targetContent.hasClass(rtlClass)) {
                        $targetContent.addClass(rtlClass);
                    }

                    //init the popover and insert into the document body
                    if (!this.options.arrow) {
                        $target.find('.webui-arrow').remove();
                    }
                    $target.detach().css({
                        top: _offsetOut,
                        left: _offsetOut,
                        display: 'block'
                    });

                    if (this.getAnimation()) {
                        $target.addClass(this.getAnimation());
                    }
                    $target.appendTo(this.options.container);


                    placement = this.getPlacement(elementPos);

                    //This line is just for compatible with knockout custom binding
                    this.$element.trigger('added.' + pluginType);

                    this.initTargetEvents();

                    if (!this.options.padding) {
                        if (this.options.height !== 'auto') {
                            $targetContent.css('height', $targetContent.outerHeight());
                        }
                        this.$target.addClass('webui-no-padding');
                    }

                    // add maxHeight and maxWidth support by limodou@gmail.com 2016/10/1
                    if (this.options.maxHeight) {
                        $targetContent.css('maxHeight', this.options.maxHeight);
                    }

                    if (this.options.maxWidth) {
                        $targetContent.css('maxWidth', this.options.maxWidth);
                    }
                    // end

                    targetWidth = $target[0].offsetWidth;
                    targetHeight = $target[0].offsetHeight;

                    var postionInfo = this.getTargetPositin(elementPos, placement, targetWidth, targetHeight);

                    this.$target.css(postionInfo.position).addClass(placement).addClass('in');

                    if (this.options.type === 'iframe') {
                        var $iframe = $target.find('iframe');
                        var iframeWidth = $target.width();
                        var iframeHeight = $iframe.parent().height();

                        if (this.options.iframeOptions.width !== '' && this.options.iframeOptions.width !== 'auto') {
                            iframeWidth = this.options.iframeOptions.width;
                        }

                        if (this.options.iframeOptions.height !== '' && this.options.iframeOptions.height !== 'auto') {
                            iframeHeight = this.options.iframeOptions.height;
                        }

                        $iframe.width(iframeWidth).height(iframeHeight);
                    }

                    if (!this.options.arrow) {
                        this.$target.css({
                            'margin': 0
                        });
                    }
                    if (this.options.arrow) {
                        var $arrow = this.$target.find('.webui-arrow');
                        $arrow.removeAttr('style');

                        //prevent arrow change by content size
                        if (placement === 'left' || placement === 'right') {
                            $arrow.css({
                                top: this.$target.height() / 2
                            });
                        } else if (placement === 'top' || placement === 'bottom') {
                            $arrow.css({
                                left: this.$target.width() / 2
                            });
                        }

                        if (postionInfo.arrowOffset) {
                            //hide the arrow if offset is negative
                            if (postionInfo.arrowOffset.left === -1 || postionInfo.arrowOffset.top === -1) {
                                $arrow.hide();
                            } else {
                                $arrow.css(postionInfo.arrowOffset);
                            }
                        }

                    }
                    this._poped = true;
                    this.$element.trigger('shown.' + pluginType, [this.$target]);
                },

                isTargetLoaded: function () {
                    return this.getTarget().find('i.glyphicon-refresh').length === 0;
                },

                /*getter setters */
                getTriggerElement: function () {
                    return this.$element;
                },
                getTarget: function () {
                    if (!this.$target) {
                        var id = pluginName + this._idSeed;
                        this.$target = $(this.options.template)
                            .attr('id', id);
                        this._customTargetClass = this.$target.attr('class') !== pluginClass ? this.$target.attr('class') : null;
                        this.getTriggerElement().attr('data-target', id);
                    }
                    if (!this.$target.data('trigger-element')) {
                        this.$target.data('trigger-element', this.getTriggerElement());
                    }
                    return this.$target;
                },
                removeTarget: function () {
                    this.$target.remove();
                    this.$target = null;
                    this.$contentElement = null;
                },
                getTitleElement: function () {
                    return this.getTarget().find('.' + pluginClass + '-title');
                },
                getContentElement: function () {
                    if (!this.$contentElement) {
                        this.$contentElement = this.getTarget().find('.' + pluginClass + '-content');
                    }
                    return this.$contentElement;
                },
                getTitle: function () {
                    return this.$element.attr('data-title') || this.options.title || this.$element.attr('title');
                },
                getUrl: function () {
                    return this.$element.attr('data-url') || this.options.url;
                },
                getAutoHide: function () {
                    return this.$element.attr('data-auto-hide') || this.options.autoHide;
                },
                getOffsetTop: function () {
                    return toNumber(this.$element.attr('data-offset-top')) || this.options.offsetTop;
                },
                getOffsetLeft: function () {
                    return toNumber(this.$element.attr('data-offset-left')) || this.options.offsetLeft;
                },
                getCache: function () {
                    var dataAttr = this.$element.attr('data-cache');
                    if (typeof (dataAttr) !== 'undefined') {
                        switch (dataAttr.toLowerCase()) {
                            case 'true':
                            case 'yes':
                            case '1':
                                return true;
                            case 'false':
                            case 'no':
                            case '0':
                                return false;
                        }
                    }
                    return this.options.cache;
                },
                getTrigger: function () {
                    return this.$element.attr('data-trigger') || this.options.trigger;
                },
                getDelayShow: function () {
                    var dataAttr = this.$element.attr('data-delay-show');
                    if (typeof (dataAttr) !== 'undefined') {
                        return dataAttr;
                    }
                    return this.options.delay.show === 0 ? 0 : this.options.delay.show || 100;
                },
                getHideDelay: function () {
                    var dataAttr = this.$element.attr('data-delay-hide');
                    if (typeof (dataAttr) !== 'undefined') {
                        return dataAttr;
                    }
                    return this.options.delay.hide === 0 ? 0 : this.options.delay.hide || 100;
                },
                getAnimation: function () {
                    var dataAttr = this.$element.attr('data-animation');
                    return dataAttr || this.options.animation;
                },
                getHideAnimation: function () {
                    var ani = this.getAnimation();
                    return ani ? ani + '-out' : 'out';
                },
                setTitle: function (title) {
                    var $titleEl = this.getTitleElement();
                    if (title) {
                        //check rtl
                        if (this.options.direction === 'rtl' && !$titleEl.hasClass(rtlClass)) {
                            $titleEl.addClass(rtlClass);
                        }
                        $titleEl.html(title);
                    } else {
                        $titleEl.remove();
                    }
                },
                hasContent: function () {
                    return this.getContent();
                },
                canEmptyHide: function () {
                    return this.options.hideEmpty && this.options.type === 'html';
                },
                getIframe: function () {
                    var $iframe = $('<iframe></iframe>').attr('src', this.getUrl());
                    var self = this;
                    $.each(this._defaults.iframeOptions, function (opt) {
                        if (typeof self.options.iframeOptions[opt] !== 'undefined') {
                            $iframe.attr(opt, self.options.iframeOptions[opt]);
                        }
                    });

                    return $iframe;
                },
                getContent: function () {
                    if (this.getUrl()) {
                        switch (this.options.type) {
                            case 'iframe':
                                this.content = this.getIframe();
                                break;
                            case 'html':
                                try {
                                    this.content = $(this.getUrl());
                                    if (!this.content.is(':visible')) {
                                        this.content.show();
                                    }
                                } catch (error) {
                                    throw new Error('Unable to get popover content. Invalid selector specified.');
                                }
                                break;
                        }
                    } else if (!this.content) {
                        var content = '';
                        if ($.isFunction(this.options.content)) {
                            content = this.options.content.apply(this.$element[0], [this]);
                        } else {
                            content = this.options.content;
                        }
                        this.content = this.$element.attr('data-content') || content;
                        if (!this.content) {
                            var $next = this.$element.next();

                            if ($next && $next.hasClass(pluginClass + '-content')) {
                                this.content = $next;
                            }
                        }
                    }
                    return this.content;
                },
                setContent: function (content) {
                    var $target = this.getTarget();
                    var $ct = this.getContentElement();
                    if (typeof content === 'string') {
                        $ct.html(content);
                    } else if (content instanceof $) {
                        $ct.html('');
                        //Don't want to clone too many times.
                        if (!this.options.cache) {
                            content.clone(true, true).removeClass(pluginClass + '-content').appendTo($ct);
                        } else {
                            content.removeClass(pluginClass + '-content').appendTo($ct);
                        }
                    }
                    this.$target = $target;
                },
                isAsync: function () {
                    return this.options.type === 'async';
                },
                setContentASync: function (content) {
                    var that = this;
                    if (this.xhr) {
                        return;
                    }
                    this.xhr = $.ajax({
                        url: this.getUrl(),
                        type: this.options.async.type,
                        cache: this.getCache(),
                        beforeSend: function (xhr, settings) {
                            if (that.options.async.before) {
                                that.options.async.before(that, xhr, settings);
                            }
                        },
                        success: function (data) {
                            that.bindBodyEvents();
                            if (content && $.isFunction(content)) {
                                that.content = content.apply(that.$element[0], [data]);
                            } else {
                                that.content = data;
                            }
                            that.setContent(that.content);
                            var $targetContent = that.getContentElement();
                            $targetContent.removeAttr('style');
                            that.displayContent();
                            if (that.options.async.success) {
                                that.options.async.success(that, data);
                            }
                        },
                        complete: function () {
                            that.xhr = null;
                        },
                        error: function (xhr, data) {
                            if (that.options.async.error) {
                                that.options.async.error(that, xhr, data);
                            }
                        }
                    });
                },

                bindBodyEvents: function () {
                    if (_isBodyEventHandled) {
                        return;
                    }
                    if (this.options.dismissible && this.getTrigger() === 'click') {
                        if (isMobile) {
                            $document.off('touchstart.webui-popover').on('touchstart.webui-popover', $.proxy(this.bodyTouchStartHandler, this));
                        } else {
                            $document.off('keyup.webui-popover').on('keyup.webui-popover', $.proxy(this.escapeHandler, this));
                            $document.off('click.webui-popover').on('click.webui-popover', $.proxy(this.bodyClickHandler, this));
                        }
                    } else if (this.getTrigger() === 'hover') {
                        $document.off('touchend.webui-popover')
                            .on('touchend.webui-popover', $.proxy(this.bodyClickHandler, this));
                    }
                },

                /* event handlers */
                mouseenterHandler: function (e) {
                    var self = this;

                    if (e && this.options.selector) {
                        self = this.delegate(e.currentTarget);
                    }

                    if (self._timeout) {
                        clearTimeout(self._timeout);
                    }
                    self._enterTimeout = setTimeout(function () {
                        if (!self.getTarget().is(':visible')) {
                            self.show();
                        }
                    }, this.getDelayShow());
                },
                mouseleaveHandler: function () {
                    var self = this;
                    clearTimeout(self._enterTimeout);
                    //key point, set the _timeout  then use clearTimeout when mouse leave
                    self._timeout = setTimeout(function () {
                        self.hide();
                    }, this.getHideDelay());
                },
                escapeHandler: function (e) {
                    if (e.keyCode === 27) {
                        this.hideAll();
                    }
                },
                bodyTouchStartHandler: function (e) {
                    var self = this;
                    var $eventEl = $(e.currentTarget);
                    $eventEl.on('touchend', function (e) {
                        self.bodyClickHandler(e);
                        $eventEl.off('touchend');
                    });
                    $eventEl.on('touchmove', function () {
                        $eventEl.off('touchend');
                    });
                },
                bodyClickHandler: function (e) {
                    _isBodyEventHandled = true;
                    var canHide = true;
                    for (var i = 0; i < _srcElements.length; i++) {
                        var pop = getPopFromElement(_srcElements[i]);
                        if (pop && pop._opened) {
                            var offset = pop.getTarget().offset();
                            var popX1 = offset.left;
                            var popY1 = offset.top;
                            var popX2 = offset.left + pop.getTarget().width();
                            var popY2 = offset.top + pop.getTarget().height();
                            var pt = pointerEventToXY(e);
                            var inPop = pt.x >= popX1 && pt.x <= popX2 && pt.y >= popY1 && pt.y <= popY2;
                            if (inPop) {
                                canHide = false;
                                break;
                            }
                        }
                    }
                    if (canHide) {
                        hideAllPop();
                    }
                },

                /*
                targetClickHandler: function() {
                    this._targetclick = true;
                },
                */

                //reset and init the target events;
                initTargetEvents: function () {
                    if (this.getTrigger() === 'hover') {
                        this.$target
                            .off('mouseenter mouseleave')
                            .on('mouseenter', $.proxy(this.mouseenterHandler, this))
                            .on('mouseleave', $.proxy(this.mouseleaveHandler, this));
                    }
                    this.$target.find('.close').off('click').on('click', $.proxy(this.hide, this, true));
                    //this.$target.off('click.webui-popover').on('click.webui-popover', $.proxy(this.targetClickHandler, this));
                },
                /* utils methods */
                //caculate placement of the popover
                getPlacement: function (pos) {
                    var
                        placement,
                        container = this.options.container,
                        clientWidth = container.innerWidth(),
                        clientHeight = container.innerHeight(),
                        scrollTop = container.scrollTop(),
                        scrollLeft = container.scrollLeft(),
                        pageX = Math.max(0, pos.left - scrollLeft),
                        pageY = Math.max(0, pos.top - scrollTop);
                    //arrowSize = 20;

                    //if placement equals auto，caculate the placement by element information;
                    if (typeof (this.options.placement) === 'function') {
                        placement = this.options.placement.call(this, this.getTarget()[0], this.$element[0]);
                    } else {
                        placement = this.$element.data('placement') || this.options.placement;
                    }

                    var isH = placement === 'horizontal';
                    var isV = placement === 'vertical';
                    var detect = placement === 'auto' || isH || isV;

                    if (detect) {
                        if (pageX < clientWidth / 3) {
                            if (pageY < clientHeight / 3) {
                                placement = isH ? 'right-bottom' : 'bottom-right';
                            } else if (pageY < clientHeight * 2 / 3) {
                                if (isV) {
                                    placement = pageY <= clientHeight / 2 ? 'bottom-right' : 'top-right';
                                } else {
                                    placement = 'right';
                                }
                            } else {
                                placement = isH ? 'right-top' : 'top-right';
                            }
                            //placement= pageY>targetHeight+arrowSize?'top-right':'bottom-right';
                        } else if (pageX < clientWidth * 2 / 3) {
                            if (pageY < clientHeight / 3) {
                                if (isH) {
                                    placement = pageX <= clientWidth / 2 ? 'right-bottom' : 'left-bottom';
                                } else {
                                    placement = 'bottom';
                                }
                            } else if (pageY < clientHeight * 2 / 3) {
                                if (isH) {
                                    placement = pageX <= clientWidth / 2 ? 'right' : 'left';
                                } else {
                                    placement = pageY <= clientHeight / 2 ? 'bottom' : 'top';
                                }
                            } else {
                                if (isH) {
                                    placement = pageX <= clientWidth / 2 ? 'right-top' : 'left-top';
                                } else {
                                    placement = 'top';
                                }
                            }
                        } else {
                            //placement = pageY>targetHeight+arrowSize?'top-left':'bottom-left';
                            if (pageY < clientHeight / 3) {
                                placement = isH ? 'left-bottom' : 'bottom-left';
                            } else if (pageY < clientHeight * 2 / 3) {
                                if (isV) {
                                    placement = pageY <= clientHeight / 2 ? 'bottom-left' : 'top-left';
                                } else {
                                    placement = 'left';
                                }
                            } else {
                                placement = isH ? 'left-top' : 'top-left';
                            }
                        }
                    } else if (placement === 'auto-top') {
                        if (pageX < clientWidth / 3) {
                            placement = 'top-right';
                        } else if (pageX < clientWidth * 2 / 3) {
                            placement = 'top';
                        } else {
                            placement = 'top-left';
                        }
                    } else if (placement === 'auto-bottom') {
                        if (pageX < clientWidth / 3) {
                            placement = 'bottom-right';
                        } else if (pageX < clientWidth * 2 / 3) {
                            placement = 'bottom';
                        } else {
                            placement = 'bottom-left';
                        }
                    } else if (placement === 'auto-left') {
                        if (pageY < clientHeight / 3) {
                            placement = 'left-top';
                        } else if (pageY < clientHeight * 2 / 3) {
                            placement = 'left';
                        } else {
                            placement = 'left-bottom';
                        }
                    } else if (placement === 'auto-right') {
                        if (pageY < clientHeight / 3) {
                            placement = 'right-bottom';
                        } else if (pageY < clientHeight * 2 / 3) {
                            placement = 'right';
                        } else {
                            placement = 'right-top';
                        }
                    }
                    return placement;
                },
                getElementPosition: function () {
                    // If the container is the body or normal conatiner, just use $element.offset()
                    var elRect = this.$element[0].getBoundingClientRect();
                    var container = this.options.container;
                    var cssPos = container.css('position');

                    if (container.is(document.body) || cssPos === 'static') {
                        return $.extend({}, this.$element.offset(), {
                            width: this.$element[0].offsetWidth || elRect.width,
                            height: this.$element[0].offsetHeight || elRect.height
                        });
                        // Else fixed container need recalculate the  position
                    } else if (cssPos === 'fixed') {
                        var containerRect = container[0].getBoundingClientRect();
                        return {
                            top: elRect.top - containerRect.top + container.scrollTop(),
                            left: elRect.left - containerRect.left + container.scrollLeft(),
                            width: elRect.width,
                            height: elRect.height
                        };
                    } else if (cssPos === 'relative') {
                        return {
                            top: this.$element.offset().top - container.offset().top,
                            left: this.$element.offset().left - container.offset().left,
                            width: this.$element[0].offsetWidth || elRect.width,
                            height: this.$element[0].offsetHeight || elRect.height
                        };
                    }
                },

                getTargetPositin: function (elementPos, placement, targetWidth, targetHeight) {
                    var pos = elementPos,
                        container = this.options.container,
                        //clientWidth = container.innerWidth(),
                        //clientHeight = container.innerHeight(),
                        elementW = this.$element.outerWidth(),
                        elementH = this.$element.outerHeight(),
                        scrollTop = document.documentElement.scrollTop + container.scrollTop(),
                        scrollLeft = document.documentElement.scrollLeft + container.scrollLeft(),
                        position = {},
                        arrowOffset = null,
                        arrowSize = this.options.arrow ? 20 : 0,
                        padding = 10,
                        fixedW = elementW < arrowSize + padding ? arrowSize : 0,
                        fixedH = elementH < arrowSize + padding ? arrowSize : 0,
                        refix = 0,
                        pageH = document.documentElement.clientHeight + scrollTop,
                        pageW = document.documentElement.clientWidth + scrollLeft;

                    var validLeft = pos.left + pos.width / 2 - fixedW > 0;
                    var validRight = pos.left + pos.width / 2 + fixedW < pageW;
                    var validTop = pos.top + pos.height / 2 - fixedH > 0;
                    var validBottom = pos.top + pos.height / 2 + fixedH < pageH;


                    switch (placement) {
                        case 'bottom':
                            position = {
                                top: pos.top + pos.height,
                                left: pos.left + pos.width / 2 - targetWidth / 2
                            };
                            break;
                        case 'top':
                            position = {
                                top: pos.top - targetHeight,
                                left: pos.left + pos.width / 2 - targetWidth / 2
                            };
                            break;
                        case 'left':
                            position = {
                                top: pos.top + pos.height / 2 - targetHeight / 2,
                                left: pos.left - targetWidth
                            };
                            break;
                        case 'right':
                            position = {
                                top: pos.top + pos.height / 2 - targetHeight / 2,
                                left: pos.left + pos.width
                            };
                            break;
                        case 'top-right':
                            position = {
                                top: pos.top - targetHeight,
                                left: validLeft ? pos.left - fixedW : padding
                            };
                            arrowOffset = {
                                left: validLeft ? Math.min(elementW, targetWidth) / 2 + fixedW : _offsetOut
                            };
                            break;
                        case 'top-left':
                            refix = validRight ? fixedW : -padding;
                            position = {
                                top: pos.top - targetHeight,
                                left: pos.left - targetWidth + pos.width + refix
                            };
                            arrowOffset = {
                                left: validRight ? targetWidth - Math.min(elementW, targetWidth) / 2 - fixedW : _offsetOut
                            };
                            break;
                        case 'bottom-right':
                            position = {
                                top: pos.top + pos.height,
                                left: validLeft ? pos.left - fixedW : padding
                            };
                            arrowOffset = {
                                left: validLeft ? Math.min(elementW, targetWidth) / 2 + fixedW : _offsetOut
                            };
                            break;
                        case 'bottom-left':
                            refix = validRight ? fixedW : -padding;
                            position = {
                                top: pos.top + pos.height,
                                left: pos.left - targetWidth + pos.width + refix
                            };
                            arrowOffset = {
                                left: validRight ? targetWidth - Math.min(elementW, targetWidth) / 2 - fixedW : _offsetOut
                            };
                            break;
                        case 'right-top':
                            refix = validBottom ? fixedH : -padding;
                            position = {
                                top: pos.top - targetHeight + pos.height + refix,
                                left: pos.left + pos.width
                            };
                            arrowOffset = {
                                top: validBottom ? targetHeight - Math.min(elementH, targetHeight) / 2 - fixedH : _offsetOut
                            };
                            break;
                        case 'right-bottom':
                            position = {
                                top: validTop ? pos.top - fixedH : padding,
                                left: pos.left + pos.width
                            };
                            arrowOffset = {
                                top: validTop ? Math.min(elementH, targetHeight) / 2 + fixedH : _offsetOut
                            };
                            break;
                        case 'left-top':
                            refix = validBottom ? fixedH : -padding;
                            position = {
                                top: pos.top - targetHeight + pos.height + refix,
                                left: pos.left - targetWidth
                            };
                            arrowOffset = {
                                top: validBottom ? targetHeight - Math.min(elementH, targetHeight) / 2 - fixedH : _offsetOut
                            };
                            break;
                        case 'left-bottom':
                            position = {
                                top: validTop ? pos.top - fixedH : padding,
                                left: pos.left - targetWidth
                            };
                            arrowOffset = {
                                top: validTop ? Math.min(elementH, targetHeight) / 2 + fixedH : _offsetOut
                            };
                            break;

                    }
                    position.top += this.getOffsetTop();
                    position.left += this.getOffsetLeft();

                    return {
                        position: position,
                        arrowOffset: arrowOffset
                    };
                }
            };
            $.fn[pluginName] = function (options, noInit) {
                var results = [];
                var $result = this.each(function () {

                    var webuiPopover = $.data(this, 'plugin_' + pluginName);
                    if (!webuiPopover) {
                        if (!options) {
                            webuiPopover = new WebuiPopover(this, null);
                        } else if (typeof options === 'string') {
                            if (options !== 'destroy') {
                                if (!noInit) {
                                    webuiPopover = new WebuiPopover(this, null);
                                    results.push(webuiPopover[options]());
                                }
                            }
                        } else if (typeof options === 'object') {
                            webuiPopover = new WebuiPopover(this, options);
                        }
                        $.data(this, 'plugin_' + pluginName, webuiPopover);
                    } else {
                        if (options === 'destroy') {
                            webuiPopover.destroy();
                        } else if (typeof options === 'string') {
                            results.push(webuiPopover[options]());
                        }
                    }
                });
                return (results.length) ? results : $result;
            };

            //Global object exposes to window.
            var webuiPopovers = (function () {
                var _hideAll = function () {
                    hideAllPop();
                };
                var _create = function (selector, options) {
                    options = options || {};
                    $(selector).webuiPopover(options);
                };
                var _isCreated = function (selector) {
                    var created = true;
                    $(selector).each(function (i, item) {
                        created = created && $(item).data('plugin_' + pluginName) !== undefined;
                    });
                    return created;
                };
                var _show = function (selector, options) {
                    if (options) {
                        $(selector).webuiPopover(options).webuiPopover('show');
                    } else {
                        $(selector).webuiPopover('show');
                    }
                };
                var _hide = function (selector) {
                    $(selector).webuiPopover('hide');
                };

                var _setDefaultOptions = function (options) {
                    defaults = $.extend({}, defaults, options);
                };

                var _updateContent = function (selector, content) {
                    var pop = $(selector).data('plugin_' + pluginName);
                    if (pop) {
                        var cache = pop.getCache();
                        pop.options.cache = false;
                        pop.options.content = content;
                        if (pop._opened) {
                            pop._opened = false;
                            pop.show();
                        } else {
                            if (pop.isAsync()) {
                                pop.setContentASync(content);
                            } else {
                                pop.setContent(content);
                            }
                        }
                        pop.options.cache = cache;
                    }
                };

                var _updateContentAsync = function (selector, url) {
                    var pop = $(selector).data('plugin_' + pluginName);
                    if (pop) {
                        var cache = pop.getCache();
                        var type = pop.options.type;
                        pop.options.cache = false;
                        pop.options.url = url;

                        if (pop._opened) {
                            pop._opened = false;
                            pop.show();
                        } else {
                            pop.options.type = 'async';
                            pop.setContentASync(pop.content);
                        }
                        pop.options.cache = cache;
                        pop.options.type = type;
                    }
                };

                return {
                    show: _show,
                    hide: _hide,
                    create: _create,
                    isCreated: _isCreated,
                    hideAll: _hideAll,
                    updateContent: _updateContent,
                    updateContentAsync: _updateContentAsync,
                    setDefaultOptions: _setDefaultOptions
                };
            })();
            window.WebuiPopovers = webuiPopovers;
        }));
};

function UUID() {
    !function (t, e) { "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = t || self).rtl_uuid = e() }(this, (function () { "use strict"; var t = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && "function" == typeof msCrypto.getRandomValues && msCrypto.getRandomValues.bind(msCrypto), e = new Uint8Array(16); function n() { if (!t) throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"); return t(e) } for (var o = [], r = 0; r < 256; ++r)o.push((r + 256).toString(16).substr(1)); return function (t, e, r) { "string" == typeof t && (e = "binary" === t ? new Uint8Array(16) : null, t = null); var u = (t = t || {}).random || (t.rng || n)(); if (u[6] = 15 & u[6] | 64, u[8] = 63 & u[8] | 128, e) { for (var i = r || 0, d = 0; d < 16; ++d)e[i + d] = u[d]; return e } return function (t, e) { var n = e || 0, r = o; return (r[t[n + 0]] + r[t[n + 1]] + r[t[n + 2]] + r[t[n + 3]] + "-" + r[t[n + 4]] + r[t[n + 5]] + "-" + r[t[n + 6]] + r[t[n + 7]] + "-" + r[t[n + 8]] + r[t[n + 9]] + "-" + r[t[n + 10]] + r[t[n + 11]] + r[t[n + 12]] + r[t[n + 13]] + r[t[n + 14]] + r[t[n + 15]]).toLowerCase() }(u) } }));
}


document.addEventListener("DOMContentLoaded", function () {
    if (typeof jQuery == "undefined") {
        // alert("jquery undefined");

        function getScript(url, success) {
            let script = document.createElement('script');
            script.src = url;
            let head = document.getElementsByTagName('head')[0],
                done = false;
            // Attach handlers for all browsers
            script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
                    done = true;
                    // callback function provided as param
                    success();
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
                }
            };
            head.appendChild(script);
        }

        let jquery_url = "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js";
        if (retainful_cart_data.jquery_url !== undefined) {
            jquery_url = retainful_cart_data.jquery_url;
        }
        getScript(jquery_url, function () {
            if (typeof jQuery == "undefined") {
                console.log("retainful unable to include jQuery");
            } else {
                jQuery.noConflict();
                initRtlShopify && initRtlShopify()
            }
        });
    } else {
        initRtlShopify && initRtlShopify()
    }
});

function initRtlShopify() {


    class Helpers {

        constructor(params) {
            this.defaultLanguage = params.defaultLanguage || "en"
            this.texts = params.texts || {}
            this.params = params
        }


        addPopoverStyleToDOM() {
            var t, e;
            e = '.webui-popover-content{display:none}.webui-popover-rtl{direction:rtl;text-align:right}.webui-popover{position:absolute;top:-1;left:0;z-index:999999999999999;display:none;min-width:50px;min-height:32px;padding:1px;text-align:left;white-space:normal;background-color:#fff;background-clip:padding-box;border:1px solid #ccc;border:1px solid rgba(0,0,0,0.2);border-radius:6px;-webkit-box-shadow:0 5px 10px rgba(0,0,0,0.2);box-shadow:0 5px 10px rgba(0,0,0,0.2)}.webui-popover.top,.webui-popover.top-left,.webui-popover.top-right{margin-top:-10px}.webui-popover.right,.webui-popover.right-top,.webui-popover.right-bottom{margin-left:10px}.webui-popover.bottom,.webui-popover.bottom-left,.webui-popover.bottom-right{margin-top:10px}.webui-popover.left,.webui-popover.left-top,.webui-popover.left-bottom{margin-left:-10px}.webui-popover.pop{-webkit-transform:scale(0.8);-o-transform:scale(0.8);transform:scale(0.8);-webkit-transition:transform .15s cubic-bezier(0.3,0,0,1.5);-o-transition:transform .15s cubic-bezier(0.3,0,0,1.5);transition:transform .15s cubic-bezier(0.3,0,0,1.5);opacity:0;filter:alpha(opacity=0)}.webui-popover.pop-out{-webkit-transition-property:"opacity,transform";-o-transition-property:"opacity,transform";transition-property:"opacity,transform";-webkit-transition:.15s linear;-o-transition:.15s linear;transition:.15s linear;opacity:0;filter:alpha(opacity=0)}.webui-popover.fade,.webui-popover.fade-out{-webkit-transition:opacity .15s linear;-o-transition:opacity .15s linear;transition:opacity .15s linear;opacity:0;filter:alpha(opacity=0)}.webui-popover.out{opacity:0;filter:alpha(opacity=0)}.webui-popover.in{-webkit-transform:none;-o-transform:none;transform:none;opacity:1;filter:alpha(opacity=100)}.webui-popover .webui-popover-content{padding:9px 14px;overflow:auto;display:block;overflow-x:hidden}.webui-popover .webui-popover-content>div:first-child{width:99%}.webui-popover-inner .close{font-family:arial;margin:8px 10px 0 0;float:right;font-size:16px;font-weight:bold;line-height:16px;color:#000;text-shadow:0 1px 0 #fff;opacity:.2;filter:alpha(opacity=20);text-decoration:none}.webui-popover-inner .close:hover,.webui-popover-inner .close:focus{opacity:.5;filter:alpha(opacity=50)}.webui-popover-inner .close:after{content:"\0D7";width:.8em;height:.8em;padding:4px;position:relative}.webui-popover-title{padding:8px 14px;margin:0;font-size:14px;font-weight:bold;line-height:18px;background-color:#fff;border-bottom:1px solid #f2f2f2;border-radius:5px 5px 0 0}.webui-popover-content{padding:9px 14px;overflow:auto;display:none}.webui-popover-inverse{background-color:#333;color:#eee}.webui-popover-inverse .webui-popover-title{background:#333;border-bottom:1px solid #3b3b3b;color:#eee}.webui-no-padding .webui-popover-content{padding:0}.webui-no-padding .list-group-item{border-right:0;border-left:0}.webui-no-padding .list-group-item:first-child{border-top:0}.webui-no-padding .list-group-item:last-child{border-bottom:0}.webui-popover>.webui-arrow,.webui-popover>.webui-arrow:after{position:absolute;display:block;width:0;height:0;border-color:transparent;border-style:solid}.webui-popover>.webui-arrow{border-width:11px}.webui-popover>.webui-arrow:after{border-width:10px;content:""}.webui-popover.top>.webui-arrow,.webui-popover.top-right>.webui-arrow,.webui-popover.top-left>.webui-arrow{bottom:-11px;left:50%;margin-left:-11px;border-top-color:#999;border-top-color:rgba(0,0,0,0.25);border-bottom-width:0}.webui-popover.top>.webui-arrow:after,.webui-popover.top-right>.webui-arrow:after,.webui-popover.top-left>.webui-arrow:after{content:" ";bottom:1px;margin-left:-10px;border-top-color:#fff;border-bottom-width:0}.webui-popover.right>.webui-arrow,.webui-popover.right-top>.webui-arrow,.webui-popover.right-bottom>.webui-arrow{top:50%;left:-11px;margin-top:-11px;border-left-width:0;border-right-color:#999;border-right-color:rgba(0,0,0,0.25)}.webui-popover.right>.webui-arrow:after,.webui-popover.right-top>.webui-arrow:after,.webui-popover.right-bottom>.webui-arrow:after{content:" ";left:1px;bottom:-10px;border-left-width:0;border-right-color:#fff}.webui-popover.bottom>.webui-arrow,.webui-popover.bottom-right>.webui-arrow,.webui-popover.bottom-left>.webui-arrow{top:-11px;left:50%;margin-left:-11px;border-bottom-color:#999;border-bottom-color:rgba(0,0,0,0.25);border-top-width:0}.webui-popover.bottom>.webui-arrow:after,.webui-popover.bottom-right>.webui-arrow:after,.webui-popover.bottom-left>.webui-arrow:after{content:" ";top:1px;margin-left:-10px;border-bottom-color:#fff;border-top-width:0}.webui-popover.left>.webui-arrow,.webui-popover.left-top>.webui-arrow,.webui-popover.left-bottom>.webui-arrow{top:50%;right:-11px;margin-top:-11px;border-right-width:0;border-left-color:#999;border-left-color:rgba(0,0,0,0.25)}.webui-popover.left>.webui-arrow:after,.webui-popover.left-top>.webui-arrow:after,.webui-popover.left-bottom>.webui-arrow:after{content:" ";right:1px;border-right-width:0;border-left-color:#fff;bottom:-10px}.webui-popover-inverse.top>.webui-arrow,.webui-popover-inverse.top-left>.webui-arrow,.webui-popover-inverse.top-right>.webui-arrow,.webui-popover-inverse.top>.webui-arrow:after,.webui-popover-inverse.top-left>.webui-arrow:after,.webui-popover-inverse.top-right>.webui-arrow:after{border-top-color:#333}.webui-popover-inverse.right>.webui-arrow,.webui-popover-inverse.right-top>.webui-arrow,.webui-popover-inverse.right-bottom>.webui-arrow,.webui-popover-inverse.right>.webui-arrow:after,.webui-popover-inverse.right-top>.webui-arrow:after,.webui-popover-inverse.right-bottom>.webui-arrow:after{border-right-color:#333}.webui-popover-inverse.bottom>.webui-arrow,.webui-popover-inverse.bottom-left>.webui-arrow,.webui-popover-inverse.bottom-right>.webui-arrow,.webui-popover-inverse.bottom>.webui-arrow:after,.webui-popover-inverse.bottom-left>.webui-arrow:after,.webui-popover-inverse.bottom-right>.webui-arrow:after{border-bottom-color:#333}.webui-popover-inverse.left>.webui-arrow,.webui-popover-inverse.left-top>.webui-arrow,.webui-popover-inverse.left-bottom>.webui-arrow,.webui-popover-inverse.left>.webui-arrow:after,.webui-popover-inverse.left-top>.webui-arrow:after,.webui-popover-inverse.left-bottom>.webui-arrow:after{border-left-color:#333}.webui-popover i.icon-refresh:before{content:""}.webui-popover i.icon-refresh{display:block;width:30px;height:30px;font-size:20px;top:50%;left:50%;position:absolute;margin-left:-15px;margin-right:-15px;background:url(../img/loading.gif) no-repeat}@-webkit-keyframes rotate{100%{-webkit-transform:rotate(360deg)}}@keyframes rotate{100%{transform:rotate(360deg)}}.webui-popover-backdrop{background-color:rgba(0,0,0,0.65);width:100%;height:100%;position:fixed;top:0;left:0;z-index:9998}.webui-popover .dropdown-menu{display:block;position:relative;top:0;border:0;box-shadow:none;float:none}' + "#jilt-popover-content {\n  max-width: 270px\n}\n#jilt-popover-content .jilt-popover-email-input-group {\n  position: relative;\n  margin-bottom: 1em;\n  white-space: nowrap\n}\n#jilt-popover-content .jilt-popover-email-input {\n  display: inline-block;\n  width: 100%;\n  min-width: 180px\n}\n#jilt-popover-content>span {\n  display: block;\n  font-size: .75em;\n  width: 100%\n}\n#jilt-popover-content>span a {\n  text-decoration: underline !important\n}\n#jilt-popover-content>span a.js-wc-jilt-popover-bypass {\n  display: block;\n  text-align: center\n}\n#jilt-popover-content .js-jilt-popover-email {\n  display: block;\n  width: 100%;\n  min-width: 180px;\n  padding: .6em 2.5em .6em .8em;\n  margin-bottom: 1em;\n  line-height: 1.6em\n}\n#jilt-popover-content .jilt-popover-email-addon {\n  display: inline-block;\n  white-space: nowrap;\n  text-align: center;\n  vertical-align: middle;\n  color: #666;\n  position: relative;\n  right: 2em;\n  width: 1em !important;\n}\n#jilt-popover-content .jilt-popover-email-addon img {\n  margin: 0px;\n}\n#jilt-popover-content .js-jilt-popover-email-icon {\n  display: inline-block;\n  height: 20px;\n  width: 20px;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  vertical-align: text-top\n}\n#jilt-popover-content .js-jilt-popover-email-typing-indicator {\n  text-align: center;\n  width: 1em;\n  height: 1em\n}\n#jilt-popover-content .js-jilt-popover-email-typing-indicator .dot {\n  display: inline-block;\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  margin-right: 4px;\n  animation: typewave .75s linear infinite\n}\n#jilt-popover-content .js-jilt-popover-email-typing-indicator .dot:nth-child(2) {\n  animation-delay: -0.55s\n}\n#jilt-popover-content .js-jilt-popover-email-typing-indicator .dot:nth-child(3) {\n  animation-delay: -0.45s\n}\n#jilt-popover-content .jilt-email-success {\n  animation: zoomfly .3s linear\n}\n.webui-popover h3.webui-popover-title {\n  padding: 8px 14px\n}\n@-moz-keyframes spin {\n  100% {\n    transform: rotate(360deg)\n  }\n}\n@-webkit-keyframes spin {\n  100% {\n    transform: rotate(360deg)\n  }\n}\n@keyframes spin {\n  100% {\n    transform: rotate(360deg)\n  }\n}\n@keyframes typewave {\n  0%,\n  60%,\n  100% {\n    transform: initial\n  }\n  30% {\n    transform: translateY(-7px)\n  }\n}\n@keyframes zoomfly {\n  100% {\n    transform: scale(2, 2);\n    opacity: .5\n  }\n}\n@media only screen and (min-width: 576px) {\n  #jilt-popover-content {\n    max-width: 350px;\n  }\n\n  #jilt-popover-content .jilt-popover-email-input {\n    width: 100%;\n    min-width: 300px;\n  }\n\n  #jilt-popover-content .js-jilt-popover-email {\n    width: 100%;\n    min-width: 300px;\n  }\n}"
            t = document.createElement("style")
            t.type = "text/css"
            t.styleSheet ? (t.styleSheet.cssText = e) : (t.innerHTML = e)
            document.head.appendChild(t)
        }

        addPopoverToDOM() {
            var t,
                e,
                o,
                i,
                n,
                r,
                a,
                s,
                l,
                u,
                c,
                d,
                p = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0],
                h = p.enterYourEmail,
                m = h === undefined ? Retainful.helpers.getText("Enter your email", this.params.enter_your_email_message) : h,
                f = p.dismissMessage,
                g = f === undefined ? Retainful.helpers.getText("dismissMessage", this.params.popover_dismiss_message) : f;

            d = document.createElement("div");
            d.style.display = "none";
            d.id = "jilt-popover-content";
            s = document.createElement("div"); s.className = "jilt-popover-email-input-group";
            u = document.createElement("span"); u.className = "jilt-popover-email-input";
            l = document.createElement("input"); l.name = "jilt-popover-email"; l.className = "js-jilt-popover-email";
            l.type = "email";
            l.autocomplete = "email";
            l.placeholder = m;
            t = document.createElement("span"); t.className = "jilt-popover-email-addon";
            e = document.createElement("img"); e.className = "js-jilt-popover-email-icon";
            e.src =
                "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjY0cHgiIGhlaWdodD0iNjRweCIgdmlld0JveD0iMCAwIDUxMS42MjYgNTExLjYyNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjYyNiA1MTEuNjI2OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTQ5LjEwNiwxNzguNzI5YzYuNDcyLDQuNTY3LDI1Ljk4MSwxOC4xMzEsNTguNTI4LDQwLjY4NWMzMi41NDgsMjIuNTU0LDU3LjQ4MiwzOS45Miw3NC44MDMsNTIuMDk5ICAgIGMxLjkwMywxLjMzNSw1Ljk0Niw0LjIzNywxMi4xMzEsOC43MWM2LjE4Niw0LjQ3NiwxMS4zMjYsOC4wOTMsMTUuNDE2LDEwLjg1MmM0LjA5MywyLjc1OCw5LjA0MSw1Ljg1MiwxNC44NDksOS4yNzcgICAgYzUuODA2LDMuNDIyLDExLjI3OSw1Ljk5NiwxNi40MTgsNy43YzUuMTQsMS43MTgsOS44OTgsMi41NjksMTQuMjc1LDIuNTY5aDAuMjg3aDAuMjg4YzQuMzc3LDAsOS4xMzctMC44NTIsMTQuMjc3LTIuNTY5ICAgIGM1LjEzNy0xLjcwNCwxMC42MTUtNC4yODEsMTYuNDE2LTcuN2M1LjgwNC0zLjQyOSwxMC43NTItNi41MiwxNC44NDUtOS4yNzdjNC4wOTMtMi43NTksOS4yMjktNi4zNzYsMTUuNDE3LTEwLjg1MiAgICBjNi4xODQtNC40NzcsMTAuMjMyLTcuMzc1LDEyLjEzNS04LjcxYzE3LjUwOC0xMi4xNzksNjIuMDUxLTQzLjExLDEzMy42MTUtOTIuNzljMTMuODk0LTkuNzAzLDI1LjUwMi0yMS40MTEsMzQuODI3LTM1LjExNiAgICBjOS4zMzItMTMuNjk5LDEzLjk5My0yOC4wNywxMy45OTMtNDMuMTA1YzAtMTIuNTY0LTQuNTIzLTIzLjMxOS0xMy41NjUtMzIuMjY0Yy05LjA0MS04Ljk0Ny0xOS43NDktMTMuNDE4LTMyLjExNy0xMy40MThINDUuNjc5ICAgIGMtMTQuNjU1LDAtMjUuOTMzLDQuOTQ4LTMzLjgzMiwxNC44NDRDMy45NDksNzkuNTYyLDAsOTEuOTM0LDAsMTA2Ljc3OWMwLDExLjk5MSw1LjIzNiwyNC45ODUsMTUuNzAzLDM4Ljk3NCAgICBDMjYuMTY5LDE1OS43NDMsMzcuMzA3LDE3MC43MzYsNDkuMTA2LDE3OC43Mjl6IiBmaWxsPSIjNjY2NjY2Ii8+CgkJPHBhdGggZD0iTTQ4My4wNzIsMjA5LjI3NWMtNjIuNDI0LDQyLjI1MS0xMDkuODI0LDc1LjA4Ny0xNDIuMTc3LDk4LjUwMWMtMTAuODQ5LDcuOTkxLTE5LjY1LDE0LjIyOS0yNi40MDksMTguNjk5ICAgIGMtNi43NTksNC40NzMtMTUuNzQ4LDkuMDQxLTI2Ljk4LDEzLjcwMmMtMTEuMjI4LDQuNjY4LTIxLjY5Miw2Ljk5NS0zMS40MDEsNi45OTVoLTAuMjkxaC0wLjI4NyAgICBjLTkuNzA3LDAtMjAuMTc3LTIuMzI3LTMxLjQwNS02Ljk5NWMtMTEuMjI4LTQuNjYxLTIwLjIyMy05LjIyOS0yNi45OC0xMy43MDJjLTYuNzU1LTQuNDctMTUuNTU5LTEwLjcwOC0yNi40MDctMTguNjk5ICAgIGMtMjUuNjk3LTE4Ljg0Mi03Mi45OTUtNTEuNjgtMTQxLjg5Ni05OC41MDFDMTcuOTg3LDIwMi4wNDcsOC4zNzUsMTkzLjc2MiwwLDE4NC40Mzd2MjI2LjY4NWMwLDEyLjU3LDQuNDcxLDIzLjMxOSwxMy40MTgsMzIuMjY1ICAgIGM4Ljk0NSw4Ljk0OSwxOS43MDEsMTMuNDIyLDMyLjI2NCwxMy40MjJoNDIwLjI2NmMxMi41NiwwLDIzLjMxNS00LjQ3MywzMi4yNjEtMTMuNDIyYzguOTQ5LTguOTQ5LDEzLjQxOC0xOS42OTQsMTMuNDE4LTMyLjI2NSAgICBWMTg0LjQzN0M1MDMuNDQxLDE5My41NjksNDkzLjkyNywyMDEuODU0LDQ4My4wNzIsMjA5LjI3NXoiIGZpbGw9IiM2NjY2NjYiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
            r = document.createElement("span"); r.className = "js-jilt-popover-email-typing-indicator";
            r.style = "display: none;";

            o = document.createElement("img"); o.className = "dot";
            o.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzOC41MzMgNDM4LjUzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUzMyA0MzguNTMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTQwOS4xMzMsMTA5LjIwM2MtMTkuNjA4LTMzLjU5Mi00Ni4yMDUtNjAuMTg5LTc5Ljc5OC03OS43OTZDMjk1LjczNiw5LjgwMSwyNTkuMDU4LDAsMjE5LjI3MywwICAgYy0zOS43ODEsMC03Ni40Nyw5LjgwMS0xMTAuMDYzLDI5LjQwN2MtMzMuNTk1LDE5LjYwNC02MC4xOTIsNDYuMjAxLTc5LjgsNzkuNzk2QzkuODAxLDE0Mi44LDAsMTc5LjQ4OSwwLDIxOS4yNjcgICBjMCwzOS43OCw5LjgwNCw3Ni40NjMsMjkuNDA3LDExMC4wNjJjMTkuNjA3LDMzLjU5Miw0Ni4yMDQsNjAuMTg5LDc5Ljc5OSw3OS43OThjMzMuNTk3LDE5LjYwNSw3MC4yODMsMjkuNDA3LDExMC4wNjMsMjkuNDA3ICAgczc2LjQ3LTkuODAyLDExMC4wNjUtMjkuNDA3YzMzLjU5My0xOS42MDIsNjAuMTg5LTQ2LjIwNiw3OS43OTUtNzkuNzk4YzE5LjYwMy0zMy41OTYsMjkuNDAzLTcwLjI4NCwyOS40MDMtMTEwLjA2MiAgIEM0MzguNTMzLDE3OS40ODUsNDI4LjczMiwxNDIuNzk1LDQwOS4xMzMsMTA5LjIwM3oiIGZpbGw9IiM2NjY2NjYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
            i = document.createElement("img"); i.className = "dot"
            i.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzOC41MzMgNDM4LjUzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUzMyA0MzguNTMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTQwOS4xMzMsMTA5LjIwM2MtMTkuNjA4LTMzLjU5Mi00Ni4yMDUtNjAuMTg5LTc5Ljc5OC03OS43OTZDMjk1LjczNiw5LjgwMSwyNTkuMDU4LDAsMjE5LjI3MywwICAgYy0zOS43ODEsMC03Ni40Nyw5LjgwMS0xMTAuMDYzLDI5LjQwN2MtMzMuNTk1LDE5LjYwNC02MC4xOTIsNDYuMjAxLTc5LjgsNzkuNzk2QzkuODAxLDE0Mi44LDAsMTc5LjQ4OSwwLDIxOS4yNjcgICBjMCwzOS43OCw5LjgwNCw3Ni40NjMsMjkuNDA3LDExMC4wNjJjMTkuNjA3LDMzLjU5Miw0Ni4yMDQsNjAuMTg5LDc5Ljc5OSw3OS43OThjMzMuNTk3LDE5LjYwNSw3MC4yODMsMjkuNDA3LDExMC4wNjMsMjkuNDA3ICAgczc2LjQ3LTkuODAyLDExMC4wNjUtMjkuNDA3YzMzLjU5My0xOS42MDIsNjAuMTg5LTQ2LjIwNiw3OS43OTUtNzkuNzk4YzE5LjYwMy0zMy41OTYsMjkuNDAzLTcwLjI4NCwyOS40MDMtMTEwLjA2MiAgIEM0MzguNTMzLDE3OS40ODUsNDI4LjczMiwxNDIuNzk1LDQwOS4xMzMsMTA5LjIwM3oiIGZpbGw9IiM2NjY2NjYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
            n = document.createElement("img"); n.className = "dot";
            n.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDQzOC41MzMgNDM4LjUzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjUzMyA0MzguNTMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTQwOS4xMzMsMTA5LjIwM2MtMTkuNjA4LTMzLjU5Mi00Ni4yMDUtNjAuMTg5LTc5Ljc5OC03OS43OTZDMjk1LjczNiw5LjgwMSwyNTkuMDU4LDAsMjE5LjI3MywwICAgYy0zOS43ODEsMC03Ni40Nyw5LjgwMS0xMTAuMDYzLDI5LjQwN2MtMzMuNTk1LDE5LjYwNC02MC4xOTIsNDYuMjAxLTc5LjgsNzkuNzk2QzkuODAxLDE0Mi44LDAsMTc5LjQ4OSwwLDIxOS4yNjcgICBjMCwzOS43OCw5LjgwNCw3Ni40NjMsMjkuNDA3LDExMC4wNjJjMTkuNjA3LDMzLjU5Miw0Ni4yMDQsNjAuMTg5LDc5Ljc5OSw3OS43OThjMzMuNTk3LDE5LjYwNSw3MC4yODMsMjkuNDA3LDExMC4wNjMsMjkuNDA3ICAgczc2LjQ3LTkuODAyLDExMC4wNjUtMjkuNDA3YzMzLjU5My0xOS42MDIsNjAuMTg5LTQ2LjIwNiw3OS43OTUtNzkuNzk4YzE5LjYwMy0zMy41OTYsMjkuNDAzLTcwLjI4NCwyOS40MDMtMTEwLjA2MiAgIEM0MzguNTMzLDE3OS40ODUsNDI4LjczMiwxNDIuNzk1LDQwOS4xMzMsMTA5LjIwM3oiIGZpbGw9IiM2NjY2NjYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";


            a = document.createElement("span")
            c = this.params.show_email_usage_notice ? "" + g : "<a href='#' class='js-jilt-popover-bypass'>" + g + "</a>"

            a.innerHTML = c
            r.appendChild(o)
            r.appendChild(i)
            r.appendChild(n)
            t.appendChild(e)
            t.appendChild(r)
            u.appendChild(l)
            s.appendChild(u)
            s.appendChild(t)
            d.appendChild(s)
            d.appendChild(a)
            document.body.appendChild(d)
        }

        popoverCheckmarkSrc() {
            return "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDQ0Mi41MzMgNDQyLjUzMyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDQyLjUzMyA0NDIuNTMzOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTQzNC41MzksOTguNDk5bC0zOC44MjgtMzguODI4Yy01LjMyNC01LjMyOC0xMS43OTktNy45OTMtMTkuNDEtNy45OTNjLTcuNjE4LDAtMTQuMDkzLDIuNjY1LTE5LjQxNyw3Ljk5M0wxNjkuNTksMjQ3LjI0OCAgIGwtODMuOTM5LTg0LjIyNWMtNS4zMy01LjMzLTExLjgwMS03Ljk5Mi0xOS40MTItNy45OTJjLTcuNjE2LDAtMTQuMDg3LDIuNjYyLTE5LjQxNyw3Ljk5Mkw3Ljk5NCwyMDEuODUyICAgQzIuNjY0LDIwNy4xODEsMCwyMTMuNjU0LDAsMjIxLjI2OWMwLDcuNjA5LDIuNjY0LDE0LjA4OCw3Ljk5NCwxOS40MTZsMTAzLjM1MSwxMDMuMzQ5bDM4LjgzMSwzOC44MjggICBjNS4zMjcsNS4zMzIsMTEuOCw3Ljk5NCwxOS40MTQsNy45OTRjNy42MTEsMCwxNC4wODQtMi42NjksMTkuNDE0LTcuOTk0bDM4LjgzLTM4LjgyOEw0MzQuNTM5LDEzNy4zMyAgIGM1LjMyNS01LjMzLDcuOTk0LTExLjgwMiw3Ljk5NC0xOS40MTdDNDQyLjUzNywxMTAuMzAyLDQzOS44NjQsMTAzLjgyOSw0MzQuNTM5LDk4LjQ5OXoiIGZpbGw9IiM2NjY2NjYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
        }

        isValidEmail(t) {
            return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(t);
        }

        getWindowLocationSearch() {
            return window.location.search;
        }

        parseQueryParams(t) {
            var e = {};
            return (
                "" === t
                    ? e
                    : (t.split("&").forEach(function (t) {
                        var o;
                        return (o = t.split("=", 2)), (e[o[0]] = "" === o[1] || void 0 === o[1] ? o[1] : decodeURIComponent(o[1]));
                    }))
            );
        }

        getText(t) {
            var e = arguments.length <= 1 || arguments[1] === undefined ? { key: undefined, defaultValue: undefined } : arguments[1],
                o = this.getLanguageLocale().language,
                i = this.texts,
                n = this.safeGet(i, "translation." + e.key, this.safeGet(i, "translation." + t));
            return (
                n ||
                ((n = this.safeGet(i, o + ".translation." + e.key, this.safeGet(i, o + ".translation." + t)))
                    ? n
                    : (n = this.safeGet(i, this.defaultLanguage + ".translation." + e.key, this.safeGet(i, this.defaultLanguage + ".translation." + t))) ||
                    e.defaultValue ||
                    ("string" == typeof e ? e : t))
            )
        }

        getLanguageLocale() {
            var t = (navigator.userLanguage || navigator.language).replace("-", "_").toLowerCase().split("_"),
                e = this._slicedToArray(t, 2);
            return { language: e[0], locale: e[1] };
        }

        safeGet(t, e, o) {
            if (!t) return o;
            var i, n;
            if ((Array.isArray(e) && (i = e.slice(0)), "string" == typeof e)) {
                var r = t[e];
                if (r !== undefined) return r;
                i = e.split(".");
            }
            if (("symbol" == typeof e && (i = [e]), !Array.isArray(i))) throw new Error("props arg must be an array, a string or a symbol");
            for (; i.length;) {
                if (((n = i.shift()), !t)) return o;
                var a = t[n] && t[n][i.join(".")];
                if (a !== undefined) return a;
                if ((t = t[n]) === undefined) return o;
            }
            return t;
        }

        _slicedToArray() {
            function t(t, e) {
                var o = [],
                    i = !0,
                    n = !1,
                    r = undefined;
                try {
                    for (var a, s = t[Symbol.iterator](); !(i = (a = s.next()).done) && (o.push(a.value), !e || o.length !== e); i = !0);
                } catch (l) {
                    (n = !0), (r = l);
                } finally {
                    try {
                        !i && s["return"] && s["return"]();
                    } finally {
                        if (n) throw r;
                    }
                }
                return o;
            }
            return function (e, o) {
                if (Array.isArray(e)) return e;
                if (Symbol.iterator in Object(e)) return t(e, o);
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            };
        }
    }


    class CustomerSession {

        constructor(params) {

            this.startSession();
            this.identifyCustomer();
        }

        setParams(key, value) {
            Retainful.API.params[key] = value
        }

        startSession() {

            var t, e;
            if (-1 !== document.cookie.indexOf("rtl_customer_session_id")) {
                e = document.cookie.replace(/(?:(?:^|.*;\s*)rtl_customer_session_id\s*\=\s*([^;]*).*$)|^.*$/, "$1");
                this.setParams("session_id", e)
            }
            else {
                e = this._generateUUID();
                (t = new Date()).setTime(t.getTime() + 7884e8);
                this.setParams("session_id", e)

                this.createCustomerSession(this._generateNewCustomerSessionData(e), "rtl_customer_session_id=" + e + ";path=/;max-age=788940000;expires=" + t);

            }
        }

        identifyCustomer() {
            var t, e, o;

            if (null != window.rtlStorefrontParams.customerID) t = { customer: { customer_id: window.rtlStorefrontParams.customerID } };
            else {
                if ("" === (o = Retainful.helpers.getWindowLocationSearch().substring(1))) return;
                null != (e = Retainful.helpers.parseQueryParams(o)).utm_customer_id && (t = { customer: { rtl_id: e.utm_customer_id } });
            }
            if (null != t) return this.updateCustomerSession(t);
        }

        _generateNewCustomerSessionData(t) {
            return {
                customer_session: {
                    session_id: t,
                    user_agent: navigator.userAgent,
                    browser_language: navigator.languages ? navigator.languages[0] : navigator.language || navigator.userLanguage,
                    initial_referrer: document.referrer,
                    landing_page: window.location.href,
                },
            };
        }
        createCustomerSession(t, cookie) {
            var e;
            e = Retainful.API.generateURL("customer");
            Retainful.API.request({ method: "POST", endpoint: e, data: t }, function (res) {
                if (res)
                    document.cookie = cookie
            });
        }

        updateCustomerSession(t) {
            var e,
                o = arguments.length <= 1 || arguments[1] === undefined ? function () { } : arguments[1];
            e = Retainful.API.generateURL("customer");
            Retainful.API.request({ method: "PUT", endpoint: e, data: t }, o, o);
        }
        _generateUUID(t) {
            if (window.rtl_uuid) {
                return rtl_uuid()
            }
            let u = Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16);
            let guid = [u.substr(0, 8), u.substr(8, 4), '4000-8' + u.substr(13, 3), u.substr(16, 12)].join('-');
            return guid
        }

    }

    class Retainful {

        constructor(params) {
            this.params = params
            this.add_to_cart_selectors = '#AddToCart, #AddToCart-product-template, #AddToCart--product-template, .AddToCartText, .add_to_cart, .add-to-cart, #add-to-cart, form[action^="/cart/add"] button[type="submit"]'
            this.params.capture_email_on_add_to_cart && this.initAddToCart()
            this.cart_data = null
            console.log("ch 2")
            Retainful.API.params = params
            Retainful.helpers = new Helpers(params)
            Retainful.CustomerSession = new CustomerSession(params)
        }

        static helpers
        static CustomerSession
        static params
        static $ = jQuery

        static API = {
            params: {},
            CONTACT_SOURCE_POPOVER: 'rtljs_add_to_cart_popover',
            CONTACT_SOURCE_CHECKOUT: 'rtljs_checkout',
            request: function (t, e) {
                var i, n, r, a, s, l, u, c, d, p, h;
                let { x_jilt_shop_domain, shop_uuid, session_id } = this.params

                return (
                    (l = t.method),
                    (s = t.endpoint),
                    (r = t.data),
                    (n = null != (u = t.contentType) ? u : "application/json"),
                    (a = null != (c = t.dataType) ? c : "text"),
                    (i = null == (d = t.async) || d),
                    (h = null != (p = t.timeout) ? p : 0),
                    "application/json" === n && (r = JSON.stringify(r)),
                    Retainful.$.ajax({ method: l, type: l, url: s, headers: { "x-rtl-shop-domain": x_jilt_shop_domain, "rtl-session_id": session_id, shop_id: shop_uuid, }, data: r, contentType: n, dataType: a, async: i, timeout: h })
                        .done(function (t) {
                            if ("function" == typeof e) return e(t || true);
                        })
                        .fail(function (t) {
                            if ("function" == typeof e) return e(false);
                        })
                );
            },
            sendByBeacon: function (t) {
                var e, o, i;

                o = t.params
                i = t.url
                e = t.data
                e.auth_token = o.public_key;
                if (null != navigator.sendBeacon) {
                    e.auth_token = o.public_key;
                    navigator.sendBeacon(i + "/beacon", new Blob([Retainful.$.param(e)], { type: "application/x-www-form-urlencoded" }))
                }
            },
            generateURL: function (t, e) {
                var o;
                let { app_url, shop_uuid } = this.params
                o = (app_url || "http://localhost:8080") + "/shopify/" + t;
                return null == e ? o : o + "/" + e;
            }
        }



        initAddToCart() {
            const checkCartData = this.checkCartData
            var t = this;

            if (
                Retainful.$(document.body).on("click.jilt_check_cart", this.add_to_cart_selectors, function () {
                    return setTimeout(function () {
                        return t.checkCartData(Retainful.updateCartData, !1);
                    }, 1e3);
                })
                &&
                !localStorage.getItem("rtl_customer_email")
            ) {

                return Retainful.$(document.body).on("click.jilt_capture_email", this.add_to_cart_selectors, function (e) {
                    var o;
                    e.preventDefault()
                    o = Retainful.$(e.currentTarget)
                    Retainful.handleAddedToCart(o, !0)
                });
            }
        }

        async checkCartData() {

            return new Promise((resolve, reject) => {
                jQuery.ajax({
                    type: "GET",
                    url: '/cart.js',
                    dataType: 'json'
                })
                    .done(function (data) {
                        this.cart_data = data
                        return resolve(data)
                    })
                    .fail(function (xhr, status, error) {
                        console.log(error)
                        reject(error)
                    });
            })
        }


        static handleAddedToCart(t, e) {

            var o;
            if (!localStorage.getItem("rtl_customer_email")) {

                Retainful.helpers.addPopoverStyleToDOM()
                Retainful.helpers.addPopoverToDOM()
                o = e
                    ? function () {
                        return t[0].click();
                    }
                    : null
                Retainful.initEmailCapture(t, o);
                setTimeout(function () {
                    if ("function" == typeof t.webuiPopover) return t.webuiPopover("show");
                }, 0)

                return
            }

            t[0].click()
        }

        static initEmailCapture(t, e) {
            var o,
                i,
                n,
                r,
                a = this;
            n = Retainful.$("input.js-jilt-popover-email")
            o = Retainful.$(".jilt-popover-email-addon")
            i = o.find(".js-jilt-popover-email-icon")
            r = o.find(".js-jilt-popover-email-typing-indicator")

            "function" != typeof t.webuiPopover
                ? this.handleEmailBypass(null, t, e)
                : (t.webuiPopover({
                    title: this.getText("Reserve this item in your cart!"),
                    animation: "pop",
                    url: "#jilt-popover-content",
                    onShow: function () {
                        return t.addClass("popover-shown"), n.focus(), o.width(o.height());
                    },
                    onHide: function () {
                        return Retainful.helpers.isValidEmail(n.val()) || t.hasClass("popover-dismissed") || a.handleEmailBypass(null, t, e), t.webuiPopover("destroy");
                    },
                }) &&
                    n.typeWatch({
                        callback: function (t) {
                            return t ? (i.hide(), r.show()) : (r.hide(), i.show());
                        },
                        wait: 150,
                        captureLength: 1,
                    }) &&
                    n.typeWatch({
                        callback: function (o) {
                            if (Retainful.helpers.isValidEmail(o)) {
                                r.hide();
                                i.show().addClass("jilt-email-success").attr("src", Retainful.helpers.popoverCheckmarkSrc);
                                setTimeout(function () {
                                    console.log("2nd callback")
                                    t.webuiPopover("hide")
                                    Retainful.setCustomerEmail(o, Retainful.API.CONTACT_SOURCE_POPOVER)
                                    Retainful.terminateAddToCart()
                                    e();
                                }, 500)
                            }
                        },
                        wait: 1250,
                        highlight: !0,
                        allowSubmit: !1,
                        captureLength: 6,
                    }) &&
                    Retainful.$(".js-jilt-popover-bypass").on("click", function (o) {
                        return t.addClass("popover-dismissed"), a.handleEmailBypass(o, t, e);
                    }))
        }


        static handleEmailBypass() {
            console.log('handleEmailBypass')
        }

        static terminateAddToCart() {
            return Retainful.$(document.body).off("click.jilt_capture_email", this.add_to_cart_selectors);
        }

        static setCustomerEmail(t, e) {
            var o;
            if (localStorage.setItem("rtl_customer_email", t), "false" !== t) {
                o = { customer: { email: t } };
                e && (localStorage.setItem("rtl_customer_contact_source", e));
                o.customer.contact_source = e;
                Retainful.CustomerSession.updateCustomerSession(o);
            }
        }

        static getText(t, e) {
            return Retainful.helpers.getText(t, e);
        }

        normalizeShopifyCartData(t) {
            return t.shop_id = this.params.shop_uuid, t.updated_at = new Date, t.cart_token = t.token, delete t.token, t.line_items = t.items, delete t.items, t
        }

    }


    /** Initializing utils */
    WebUiPopover(window, document)
    UUID()

    let rtl = new Retainful(rtlStorefrontParams) //customization: null customization is. 
}
