var bwin = window.bwin || (function ($) {

    var that = function ($el, options) {
        options = $.extend({drag:{cursor:"move", title:""}}, options);
        this.options = options;
        this.$popup = $($el);
        this.$popup.delegate('[data-dismiss="bwin"]', 'click.bwin', $.proxy(this.hide, this));
        this.isShown = false;
    }

    that.prototype = {
        constructor:that,
        zIndex:1400,
        toggle:function () {
            return this[!this.isShown ? 'show' : 'hide']()
        },
        show:function () {
            this.isShown = true;

            e = $.Event('show')
            this.$popup.trigger(e)

            var $this = this;
            this.$popup.css({ zIndex:this.zIndex++ });

            if (this.$popup.has('.bwin-header').length) {
                var head = $('.bwin-header', this.$popup);
            }
            else {
                var head = $('<div>')
                    .addClass('bwin-header')
                    .prependTo(this.$popup);
            }

            if (head.has('h3').length) {
                var title = $('h3', head);
            } else {
                var title = $('<h3/>').prependTo(head);
            }

            if (this.options.title !== '') {
                title.html(this.options.title);
            }

            head.addClass('clearfix');
            if ( head.has('.elements').length == 0 ) {
                var closeLink = $('<a>')
                    .attr('href', '#')
                    .attr('data-dismiss', 'bwin')
                    .html('&times;')
                    .addClass('elements')
                    .addClass('close');
                closeLink.attr('data-close', 'bwin');
                head.append(closeLink);
            }


            if (this.options.remote) {
                var body = $('<div/>').addClass('bwin-body');
                body.html('<h4>Идет загрузка...</h4>')
                    .load(this.options.remote, {}, $.proxy(this._calculateBody, this))
                    .appendTo(this.$popup);
            }


            if (this.options.css !== undefined) {
                body.css(this.options.css);
            }

            this._calculateBody();
            this._startDrag(this.$popup);
            this._windows.push(this.options.id);
            this.$popup.appendTo(document.body);
            if (this._windows.length === 1) {
                this.overlay.show();
            }
            this.$popup.show().trigger('shown');
        },
        hide:function (e) {
            e && e.preventDefault();

            this.isShown = false;

            var popupId = this.$popup.attr('id');

                var e = $.Event('hide');
                this.$popup.trigger(e);
                this.$popup.hide().trigger('hidden');

            this._windows.splice(this._windows.indexOf(popupId), 1);
            if (this._windows.length === 0) {
                this.overlay.remove();
            }
        },
        overlay:{
            show:function () {
                $('<div>').attr('id', 'bwin-overlay').css({top:0, right:0, left:0, bottom:0}).addClass('bwin-backdrop')
                    .appendTo(document.body);
                $('body').addClass('bwin-open');
            },
            remove:function () {
                $('#bwin-overlay').remove();
                $('body').removeClass('bwin-open');
            }
        },

        _calculateBody:function () {
            this.$popup.find('.bwin-body').css({
                maxHeight:$(window).height() - 150,
                maxWidth:$(window).width() - 150
            })
            this._center();
        },
        _center:function () {
            var top = (($(window).height() - this.$popup.outerHeight(true)) / 2);
            var left = (($(window).width() - this.$popup.outerWidth(true)) / 2);
            this.$popup.css({position:'absolute', margin:0, top:(top > 0 ? top : 0) + 'px', left:(left > 0 ? left : 0) + 'px'});
        },
        _startDrag:function (popup) {
            opt = this.options.drag;

            var $el = popup.find('.bwin-header').filter(':not(.elements)');

            return $el.css('cursor', opt.cursor).on("mousedown.bwin",function (e) {

                var $drag = popup.addClass('draggable');

                var z_idx = popup.zIndex,
                    drg_h = $drag.outerHeight(true),
                    drg_w = $drag.outerWidth(true),
                    pos_y = $drag.offset().top + drg_h - e.pageY,
                    pos_x = $drag.offset().left + drg_w - e.pageX;
                $drag.css('z-index', 1000).parents().on("mousemove.bwin", function (e) {
                    $('.draggable').offset({
                        top:e.pageY + pos_y - drg_h,
                        left:e.pageX + pos_x - drg_w
                    }).on("mouseup.bwin", function () {
                            $(this).removeClass('draggable').css('z-index', z_idx + 1);
                        });
                });

                e.preventDefault(); // disable selection
            }).on("mouseup.bwin", function () {
                    $(this).parents('.bwin').removeClass('draggable');

                });
        },
        _windows:[]
    };


    $.fn.bwin = function (option) {
        return this.each(function () {

            var $this = $(this)
                , data = $this.data('bwin')
                , options = $.extend({}, $.fn.bwin.defaults, $this.data(), typeof option == 'object' && option);

            if (!data) $this.data('modal', (data = new that(this, options)))
            if (typeof option == 'string')data[option]()
            else if (options.show)data.show()
        })
    }

    $.fn.bwin.index = 1000;
    $.fn.bwin.defaults = {drag:{cursor:"move"}, show:true, title:""};
    $.fn.bwin.Constructor = that;

    $(document).ready(function () {
        $('body').on('click.bwin.data-api', '[data-toggle="bwin"]', function (e) {
            var $this = $(this)
                , href = $this.attr('href')
                , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
                , option = $target.data('bwin') ? 'show' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

            e.preventDefault()

            $target.bwin(option)
                .one('hide', function () {
                    $this.focus()
                })
        })
    })

    return that;

})(window.jQuery)