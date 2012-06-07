jQuery.fn.searchtabs = function ($panes) {
    this.click(function () {
        var $this = jQuery(this),
            index = $this.index(),
            $currentpane = $panes.eq(index);
        $currentpane.toggle();
        $this.toggleClass('current');

        $panes.not($currentpane).hide();
        $this.siblings().removeClass('current');
        return false;
    });
};


(function ($) {
    // hide with javascript only
    $('.formControls').hide();

    // tab
    $("#filterpanel_filters li").searchtabs($("div.flowsearchpanes > div"));

    var setup_search = function () {
        var tabs = $('div.field');
        $('.flowsearchpanels SearchableText').focus();
    };

    setup_search();

    var resetpanel = {
        textpanel : function () {
            $('input#SearchableText').val('').change();
        },
        pathpanel : function () {
            $('input[name=path.depth:record:int]').first().attr('checked', true).change();
            $('input[name=path.depth:record:int]').last().attr('checked', false).change();
        },
        typespanel : function () {
            $('input[name=portal_type:list]').removeAttr('checked').change();
        },
        createdpanel : function () {
            $('select#created').val('1970/02/01').change();
        },
        reviewstatepanel : function () {
            $('input[name=review_state:list]').removeAttr('checked').change();
        },
        creatorpanel : function () {
            var $sel = $('select#Creator');
            if ($sel.html() === null) {
                $sel = $('#creatorpanel input');
            }
            $sel.val('').change();
        },
        sortonpanel : function () {
            $('select#sort_on').val("").change();
        },
        subjectspanel : function () {
            $('#subjectspanel input:checkbox').removeAttr('checked').change();
        }

    };

    $('#reset-search').click(function(event) {
        var panel;
        for (panel in resetpanel) {
            resetpanel[panel]();
        }
        return false;
    });

    //depth
    var path_all_site = function () {
        if ($('#path_query input.all_site').is(':checked')) {
            $('#path_depth input').removeAttr('checked');
            $('#path_depth').hide();
        } else {
            $('#path_depth').show();
        }
    };

    $('#path_query input').change(function () {
        path_all_site();
    });

    // click the next button (infinite scrolling)
    $(window).scroll(function() {
        var top, bottom, y, $next = $('.next a');
        if ($next.length){
            y = $next.offset().top;
            top = $(window).scrollTop();
            bottom = $(window).scrollTop() + $(window).height();
            if(y > top && y < bottom){
                $next.click();
            }
        }
    });

    var timeoutid;
    var $searchform = $('#flowsearchform');
    var $all_results = $('#results');

    $all_results.ajaxError(function(event, request, settings){
      $(this).html("Error requesting page");
    });

    var append_search = function (url) {

        $.get(url, function (data) {
            var $results = $(data).find(".searchResults, #content-core div p strong");
            var $listing = $(data).find(".listingBar");
            $listing.children().not('.next').remove();

            var $next = $all_results
                .append($results)
                .append($listing)
                .find('.next a');
            $next.click(function () {
                var $this = $(this);
                var url = $this.attr('href');
                $this.closest('.listingBar').remove();
                append_search(url);
            });

        });
        return false;
    };

    //overview
    var $overview = $('#overview');
    var write_overview = {
        pathpanel        : function ($panel) {
            var label = $panel.children('label').text();
            var checkedradio = $panel.find('input:checked');
            var value = $('label[for=' + checkedradio.attr('id') + ']').text();
            

            var out = '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a></span>';
            return out;
        },
        textpanel        : function ($panel) {
            var label = $panel.children('label').text();
            var value = $panel.find('#SearchableText').val();
            var title = $panel.find('#SearchableText').attr('title');
            if (! value.length || value === title){
                return '';
            }
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a>';
            out += '</span>';
            return out;
        },
        subjectspanel    : function ($panel) {
            var rules = '';
            var label = $panel.children('label').text();

            var value = $.map($panel.find('input[name=Subject:list]:checked').get(), function (element) {
                return $(element).next().text();
            });

            if (! value.length) {
                return '';
            }

            if (value.length > 1) {
                rules = ' (' + $('input[name=Subject_usage:ignore_empty]:checked').next().text() + ')';
            }
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value.join(', ') + rules + '</a>';
            out += '</span>';
            return out;
        },
        typespanel       : function ($panel) {
            var label = $panel.children('label').text();
            var value = $.map($panel.find('input[name=portal_type:list]:checked').get(), function (element) {
                return $(element).next().text();
            });
            if (! value.length) {
                return '';
            }
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value.join(', ') + '</a>';
            out += '</span>';
            return out;
        },
        createdpanel     : function ($panel) {
            var label = $panel.children('label').text();
            var $opt = $panel.find('option:selected');
            if ($opt.is('.default_option')) {
                return '';
            }
            var value = $opt.text();
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a>';
            out += '</span>';
            return out;
        },
        reviewstatepanel : function ($panel) {
            var label = $panel.children('label').text();
            var value = $.map($panel.find('input[name=review_state:list]:checked').get(), function (element) {
                return $(element).next().text();
            });
            if (! value.length){
                return '';
            }
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value.join(', ') + '</a>';
            out += '</span>';
            return out;
        },
        creatorpanel     : function ($panel) {
            var label = $panel.children('label').text();
            var $opt = $panel.find('option:selected');
            if ($opt.is('.default_option')) {
                return '';
            }
            var value = $opt.text();
            if($opt.html() == null) {
                value = $panel.find('input[name=Creator]').val();
            }
            if (value === '') {
                return '';
            }
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a>';
            out += '</span>';
            return out;
        },
        sortonpanel      : function ($panel) {
            var label = $panel.children('label').text();
            var $opt = $panel.find('option:selected');
            if ($opt.is('.default_option')) {
                return '';
            }
            var value = $opt.text();
            var out = '<span class="remove-filter"><a class="resetbutton" href="#' + $panel.attr('id') + '">⨯</a></span>';
            out += '<span class="label">' + label + ':</span>';
            out += '<span><a class="edit-filter" href="#' + $panel.attr('id') + '">' + value + '</a>';
            out += '</span>';
            return out;
        }
    };

    var refresh_overview = function () {
        $overview.empty();
        
        $('.flowsearchpanes .field').each(function () {
            var $this = $(this);
            var content;
            var action = write_overview[$this.attr('id')];
            if (action) {
                content = action($this);
                if (content){
                    $overview.append('<div class="overview-item" id="parameter-' + $this.attr('id') + '">' + content + '</div>');
                    $('#parameter-' + $this.attr('id') + ' a.edit-filter').click(function(evt) {
                        evt.preventDefault();
                        var nodehref = $(this).attr('href');
                        var panel = nodehref.split('#')[1];
                        $('#divlegend-' + panel).click();
                    });
                    $('#parameter-' + $this.attr('id') + ' .remove-filter a').click(function(evt) {
                        evt.preventDefault();
                        $(this).parent().parent().fadeOut();
                        var nodehref = $(this).attr('href');
                        var panel = nodehref.split('#')[1];
                        resetpanel[panel]();
                    });
                }
            }
        });
        
    };

    var addstar = function (query) {
        var re = /SearchableText=([^&]*)/;
        var groups = query.match(re);

        // searchabletext not found
        if (! groups.length) { 
            return query;
        }

        if (groups[1].length && groups[1].charAt(groups[1].length - 1) !== '*') {
            return query.replace(re,"$&*");
        }
        // searchabletext empty or last char == "*"
        return query;
    };

    var refresh = function () {
        refresh_overview();
        window.location.hash = $searchform.serialize();
        var query = window.location.hash.slice(1);

        query = addstar(query);
        $all_results.empty();
        append_search('search?' + query);
    };
    
    if (window.location.hash) {
        $searchform.deserialize(window.location.hash.slice(1));
        path_all_site();

    }
    refresh();

    $searchform.bind('change keypress',function (evt) {
        var $target = $(evt.target);
        if ($target.is(':input')){
            if(timeoutid){
                clearTimeout(timeoutid);
            }
            timeoutid = setTimeout(function () {
                refresh();                
            }, 400);
            
        }

    });
    $searchform.bind('submit',function (evt) {
        evt.preventDefault();
        var $target = $(evt.target);
        if ($target.is(':input')) {
            if(timeoutid){
                clearTimeout(timeoutid);
            }
            timeoutid = setTimeout(function () {
                refresh();                
            }, 400);
            
        }

    });


    $('#flowsearch-breadcrumbs a').click(function () {
        var href = $(this).attr('href');
        var hash = window.location.hash;
        window.location = href + '/@@flowsearch' + hash;
        return false;
    });

    
}(jQuery));

