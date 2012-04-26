jQuery.fn.searchtabs = function ($panes){
    this.click(function (){
        var $this = $(this);
        var index = $this.index();
        var $currentpane = $panes.eq(index);
        $currentpane.toggle();
//        $currentpane.slideToggle();
        $this.toggleClass('current');

        $panes.not($currentpane).hide();
        $this.siblings().removeClass('current')
        return false;
    });
};


(function ($){
    // hide with javascript only
    $('.field > label, .field  .formHelp').hide();
    $('.formControls').hide()
    // tab
//    $("ul#filterpanel_filters").tabs("div.flowsearchpanes > div");

    $("#filterpanel_filters li").searchtabs($("div.flowsearchpanes > div"));

    var equalHeight = function (group) {
        var tallest = 0;
        group.each(function() {
            var thisHeight = $(this).height();
            if(thisHeight > tallest) {
                tallest = thisHeight;
            }
        });
        group.height(tallest);
    };

    var setup_search = function (){
        var tabs = $('div.field');
        equalHeight(tabs);
        $('a#divlegend-textpanel').click();
        $('.flowsearchpanels SearchableText').focus();
    };

    setup_search();

    var resetpanel = {
        textpanel : function () {
            $('input#SearchableText').val('').change();
        },
        pathpanel : function () {
            $('input[name=path.depth:record:int]').attr('checked', false).change();
        },
        typespanel : function () {
            $('input[name=portal_type:list]').removeAttr('checked').change();
        },
        createdpanel : function (){
            $('select#created').val('1970/02/01').change();
        },
        reviewstatepanel : function (){
            $('input[name=review_state:list]').removeAttr('checked').change();
        },
        creatorpanel : function (){
            var $sel = $('select#Creator');
            if ($sel.html() == null){
                $sel = $('#creatorpanel input');
            };
            $sel.val('').change();
        },
        sortonpanel : function (){
            $('select#sort_on').val("").change();
        }
    };

    $('#reset-search').click(function(event){
        event.preventDefault();
        for (panel in resetpanel){
            resetpanel[panel]();
        } 
    });

    //depth
    var path_all_site = function (){
        if ($('#path_query input.all_site').is(':checked')){
            $('#path_depth input').removeAttr('checked');
            $('#path_depth').hide();
        }
        else {
            $('#path_depth').show();
        }
    };

    $('#path_query input').change(function (){
        path_all_site();
    });

    // click the next button (infinite scrolling)
    $(window).scroll(function(){
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
    var $searchform = $('#searchform');
    var $all_results = $('#results');

    var append_search = function (url){

        $.get(url, function (data){
            var $results = $(data).find(".searchResults");
            var $listing = $(data).find(".listingBar");
            $listing.children().not('.next').remove();

            var $next = $all_results
                .append($results)
                .append($listing)
                .find('.next a');
            $next.click(function (){
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
        pathpanel        : function ($panel){
            var label = $panel.children('label').text();
            var checkedradio = $('#path_query input:checked');
            var value = $('label[for=' + checkedradio.attr('id') + ']').text();
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a></dd>';
            $('#path_depth input:checked').each(function (){
                out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + $(this).parent().text() + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
                out += '</dd>';
            });
            return out;
        },
        textpanel        : function ($panel){
            var label = $panel.children('label').text();
            var value = $panel.find('#SearchableText').val();
            if (! value.length){
                return '';
            }
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        },
        subjectspanel    : function ($panel){
            var rules = '';
            var label = $panel.children('label').text();

            var value = $.map($panel.find('input[name=Subject:list]:checked').get(), function (element){
                return $(element).next().text();
            });

            if (! value.length){
                return '';
            }

            if (value.length > 1){
                var rules = ' (' + $('input[name=Subject_usage:ignore_empty]:checked').next().text() + ')';
            }
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value.join(', ') + rules + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        },
        typespanel       : function ($panel){
            var label = $panel.children('label').text();
            var value = $.map($panel.find('input[name=portal_type:list]:checked').get(), function (element){
                return $(element).next().text();
            });
            if (! value.length){
                return '';
            }
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value.join(', ') + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        },
        createdpanel     : function ($panel){
            var label = $panel.children('label').text();
            var $opt = $panel.find('option:selected');
            if ($opt.is('.default_option')){
                return '';
            }
            var value = $opt.text();
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        },
        reviewstatepanel : function ($panel){
            var label = $panel.children('label').text();
            var value = $.map($panel.find('input[name=review_state:list]:checked').get(), function (element){
                return $(element).next().text();
            });
            if (! value.length){
                return '';
            }
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value.join(', ') + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        },
        creatorpanel     : function ($panel){
            var label = $panel.children('label').text();
            var $opt = $panel.find('option:selected');
            if ($opt.is('.default_option')){
                return '';
            }
            var value = $opt.text();
            if($opt.html() == null){
                value = $panel.find('input[name=Creator]').val();
            }
            if (value == ''){
                return '';
            }
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id')+ '">' + value + '</a>';
//            out += ' <a class="remove-filter" href="#' + $panel.attr('id') + '">X</a>'
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        },
        sortonpanel      : function ($panel){
            var label = $panel.children('label').text();
            var $opt = $panel.find('option:selected');
            if ($opt.is('.default_option')){
                return '';
            }
            var value = $opt.text();
            var out = '<dt>' + label + ':</dt>';
            out += '<dd><a class="edit-filter" href="#' + $panel.attr('id') + '">' + value + '</a>';
            out += ' <span class="remove-filter"><a href="#' + $panel.attr('id') + '">X</a></span>'
            out += '</dd>';
            return out;
        }
    };

    var refresh_overview = function (){
        $overview.empty();
        
        $('.flowsearchpanes .field').each(function (){
            var $this = $(this);
            var content;
            var action = write_overview[$this.attr('id')];
            if (action){
                content = action($this);
                if (content){
                    $overview.append('<dl id="parameter-' + $this.attr('id') + '">' + content + '</dl>');
                    $('#parameter-' + $this.attr('id') + ' a.edit-filter').click(function(evt){
                        evt.preventDefault();
                        var nodehref = $(this).attr('href');
                        var panel = nodehref.split('#')[1];
                        $('#divlegend-' + panel).click();
                    });
                    $('#parameter-' + $this.attr('id') + ' .remove-filter a').click(function(evt){
                        evt.preventDefault();
                        $(this).parent().parent().parent().fadeOut();
                        var nodehref = $(this).attr('href');
                        console.log(nodehref);
                        var panel = nodehref.split('#')[1];
                        resetpanel[panel]();
                    });
                }
            }
        });
        
    };

    var addstar = function (query){
        var re = /SearchableText=([^&]*)/;
        var groups = query.match(re);

        // searchabletext not found
        if (! groups.length){ 
            return query;
        }

        if (groups[1].length && groups[1].charAt(groups[1].length - 1) !== '*'){
            return query.replace(re,"$&*");
        }
        // searchabletext empty or last char == "*"
        return query;
    };

    var refresh = function (){
        refresh_overview();
        window.location.hash = $searchform.serialize();
        var query = window.location.hash.slice(1);

        query = addstar(query);
        $all_results.empty();
        append_search('search?' + query);

    };
    
    if (window.location.hash){
        $searchform.deserialize(window.location.hash.slice(1));
        path_all_site();

    }
    refresh();

    $searchform.bind('change keypress submit',function (evt) {
        var $target = $(evt.target);
        if ($target.is(':input')){
            if(timeoutid){
                clearTimeout(timeoutid);
            }
            timeoutid = setTimeout(function (){
                refresh();                
            }, 400);
            
        }

    });
    
}(jQuery));

