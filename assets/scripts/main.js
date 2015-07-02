/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 * ======================================================================== */

(function ($) {

    // Use this variable to set up the common and page specific functions. If you
    // rename this variable, you will also need to rename the namespace below.
    var Sage = {
        // All pages
        'common': {
            init: function () {
                // JavaScript to be fired on all pages

                // Set up Google Analytics events
                if (typeof ga === 'function') {
                    Sage.common.gaTrackOutboundLinks();
                }


                // requires .videoWrapper style
                // change static sized iframe video to responsive sized ( add checks to apply for any other than Youtube)
                if ($("iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']").length) {
                    $("iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']").removeAttr('height').removeAttr('width').wrap("<div class='videoWrapper'></div>");
                }


                // RESPONSIVE BREAKPOINT READER
                Sage.breakpoint.refreshValue();
                // UNCOMMENT THIS SECTION IF YOU WANT TO READ BREAKPOINT ON RESIZE
                // REQUIRES CLASSES LOCATED IN: _common.scss
                // $(window).resize(function () {
                //     Sage.breakpoint.refreshValue();
                //     //TEST VIEW BREAKPOINT
                //     //console.log( Sage.breakpoint.value);
                // }).resize();


                // RESPONSIVE TABLE FIXER
                // UNCOMMENT THIS SECTION IF YOU WANT RESPONSIVE TABLES
                //Sage.responsiveTable();
            },
            finalize: function () {
                // JavaScript to be fired on all pages, after page specific JS is fired
            },
            gaLogEvent: function (event) {
                // General event logging function, intended to be used with .on('click') event handlers
                if (typeof event.data.label !== 'undefined') {
                    if (typeof event.data.value !== 'undefined') {
                        ga('send', 'event', event.data.category, event.data.action, event.data.label, event.data.value);
                    } else {
                        ga('send', 'event', event.data.category, event.data.action, event.data.label);
                    }
                } else {
                    ga('send', 'event', event.data.category, event.data.action);
                }
            },
            gaTrackOutboundLinks: function () {
                // Listen for links that don't match the current base URL and fire an event when clicked
                var currentUrl = window.location.href.substr(0, window.location.href.indexOf('/', 10));
                $('a[href^="http"]').not('[href^="' + currentUrl + '"]').each(function () {
                    $(this).on('click', {
                        category: 'Outbound Links',
                        action: 'Click',
                        label: this.href
                    }, Sage.common.gaLogEvent);
                });
            }
        },
        responsiveTable: function () {
            if ($('table').length) {
                // just get the user created tables
                $table = $('table').not('.crayon-table');

                //first fix any tables without theads
                $($table).each(function () {
                    $hasHead = $('thead td, thead th', this).length;
                    if (!$hasHead) {
                        $(this).prepend('<thead></thead>').find("tr:first").prependTo($('thead', this));
                    }
                });

                //second update tables to have data attrs
                $($table).each(function () {
                    $hasHead = $('thead td, thead th', this).length;
                    $col_titles = [];

                    if ($hasHead) {//make sure our current table has what we need to get started.
                        // cache our column titles (include td for bad html)
                        $(this).find('th, td').each(function () {
                            $content = $(this).text() + ': ';
                            $col_titles.push($content);
                        });

                        // add our column titles to data attrs on each tr>td
                        $(this).find('tr').each(function () {
                            $row = $(this);
                            $row.children("td").each(function (key) {
                                $(this).attr('data-label', $col_titles[key]);
                            });
                        });
                    }
                });
            }
        },
        breakpoint : {
            refreshValue : function () {
                this.value = window.getComputedStyle(
                    document.querySelector('body'), ':before'
                ).getPropertyValue('content').replace(/['"]+/g, '');
            }
        }
    };

    // The routing fires all common scripts, followed by the page specific scripts.
    // Add additional events for more control over timing e.g. a finalize event
    var UTIL = {
        fire: function (func, funcname, args) {
            var fire;
            var namespace = Sage;
            funcname = (funcname === undefined) ? 'init' : funcname;
            fire = func !== '';
            fire = fire && namespace[func];
            fire = fire && typeof namespace[func][funcname] === 'function';

            if (fire) {
                namespace[func][funcname](args);
            }
        },
        loadEvents: function () {
            // Fire common init JS
            UTIL.fire('common');

            // Fire page-specific init JS, and then finalize JS
            $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function (i, classnm) {
                UTIL.fire(classnm);
                UTIL.fire(classnm, 'finalize');
            });

            // Fire common finalize JS
            UTIL.fire('common', 'finalize');
        }
    };

    // Load Events
    $(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.
