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
                    Sage.common.gaTrackDocumentLinks();
                    Sage.common.gaTrackMailtoLinks();
                    Sage.common.gaTrackOutboundLinks();
                }

                // Function to enable L1 navigation dropdown item links
                // Tested on bootstrap 3.3.1
                $('#menu-primary-navigation .dropdown').on('show.bs.dropdown', function (e) {
                    e.preventDefault();
                });

                // requires .videoWrapper style
                // change static sized iframe video to responsive sized ( add checks to apply for any other than Youtube)
                if ($("iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']").length) {
                    $("iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']").removeAttr('height').removeAttr('width').wrap("<div class='videoWrapper'></div>");
                }

                // Uncomment this section if using breakpoints in JavaScript.
                // Update breakpoint value cache on window resize.
                //$(window).resize(function () {
                //    Sage.common.breakpoint.refreshValue();
                //}).resize();

                // RESPONSIVE TABLE FIXER
                // UNCOMMENT THIS SECTION IF YOU WANT RESPONSIVE TABLES
                //Sage.common.responsiveTable();

                // To use sticky footer functionality:
                // Include sticky-footer.php template instead of footer.php template
                // Uncomment line in main.scss to include _sticky-footer.scss
                // If desired, update 1/3 in the function call below to match the vh you want (preconfigured as 1/4 viewport height)
                // If updating the value below, the corresponding vh variable in _sticky-footer.scss will need to be updated.
                // Uncomment this line:
                //Sage.common.stickyFooter.init('.sticky-footer', 1/4);
            },
            breakpoint : {
                refreshValue: function () {
                    this.value = window.getComputedStyle(
                        document.querySelector('body'), ':before'
                    ).getPropertyValue('content').replace(/['"]+/g, '');
                }
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
            gaTrackDocumentLinks: function () {

                // Set up tracking on clicks on documents, such as PDFs
                $('a:not([href^="mailto"])').filter(function () {

                    // If this anchor doesn't have an HREF, ignore it.
                    if (typeof this.href !== 'string') {
                        return false;
                    }

                    // Try to split the HREF into pathinfo sements.
                    var pathinfo = this.href.split('/');
                    if (pathinfo.length === 0) {
                        return false;
                    }

                    // If the last segment contains a period, then it is most likely a document. Set up tracking.
                    return (pathinfo[pathinfo.length - 1].indexOf('.') > 0);
                }).each(function () {
                    $(this).on('click', {
                        category: 'Downloads',
                        action: this.href.substr(this.href.lastIndexOf('.') + 1).toUpperCase(),
                        label: this.href.substr(this.href.lastIndexOf('/') + 1)
                    }, Sage.common.gaLogEvent);
                });
            },
            gaTrackMailtoLinks: function () {

                // Listen for links that start with mailto: and fire an event when clicked
                $('a[href^="mailto:"]').each(function () {
                    $(this).on('click', {
                        category: 'Mailto Intent',
                        action: 'Click',
                        label: this.href.substr(7)
                    }, Sage.common.gaLogEvent);
                });
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
            stickyFooter: {

                /**
                 * @var A variable to keep track of the height of the document.
                 */
                documentHeight: 0,

                /**
                 * @var A variable to keep track of the bottom position of the selected element.
                 */
                elementBottom: 0,

                /**
                 * @var A variable to keep track of the top position of the selected element.
                 */
                elementTop: 0,

                /**
                 * @var A variable to keep track of whether the sticky footer is currently stuck.
                 */
                stuck: false,

                /**
                 * @var A variable to keep track of the target percentage for sticky footer visibility.
                 */
                targetPercent: 0,

                /**
                 * @var A variable to keep track of the number of pixels from the bottom of the element are visible.
                 */
                visibleBottom: 0,

                /**
                 * @var A variable to keep track of the percentage of the screen the unstuck footer takes up.
                 */
                visiblePercent: 0,

                /**
                 * @var A variable to keep track of the number of pixels the unstuck footer takes up.
                 */
                visiblePixels: 0,

                /**
                 * @var A variable to keep track of the number of pixels from the top of the element are visible.
                 */
                visibleTop: 0,

                /**
                 * @var A variable to keep track of the viewport height.
                 */
                windowHeight: 0,

                /**
                 * @var A variable to keep track of the scrolled pixel distance relative to the bottom of the viewport.
                 */
                windowScrollBottom: 0,

                /**
                 * @var A variable to keep track of the scrolled pixel distance relative to the top of the viewport.
                 */
                windowScrollTop: 0,

                /**
                 * Initialization function. Sets up object references and begins tracking.
                 *
                 * @param selector The jQuery selector to use.
                 * @param percentage The percentage of the screen that the footer should take up.
                 *
                 * @return void
                 */
                init: function (selector, percentage) {

                    // Configure target percentage.
                    this.targetPercent = percentage;

                    // Set up local caches of objects.
                    this.document = $(document);
                    this.element = $(selector);
                    this.elementParent = this.element.parent();
                    this.window = $(window);
                    this.windowHeight = this.window.height();

                    // Set up a listener for various actions that would affect object position.
                    this.window.on('DOMContentLoaded load scroll', this.poll);

                    // Set up a listener specifically for resize to update window height and poll.
                    this.window.on('resize', this.updateViewport);

                    // Set up a listener for jump link clicks within the sticky footer.
                    this.document.on('click', 'a[href^="#"]', this.handleJumpLinks);

                    // Set up a listener to hide and show the sticky footer on form events.
                    this.document.on('focus', 'input, select', this.hideOnInputFocus);
                    this.document.on('blur', 'input, select', this.showOnInputBlur);
                    this.document.on('submit', 'form', this.showOnInputBlur);
                },

                /**
                 * A function to handle jump link clicks without breaking the sticky footer.
                 *
                 * @param e The click event.
                 *
                 * @return void
                 */
                handleJumpLinks: function (e) {
                    e.preventDefault();
                    Sage.common.stickyFooter.unstick();
                    $('html, body').animate({
                        scrollTop: $($(this).attr('href')).offset().top
                    }, 0);
                },

                /**
                 * A function to handle the input focus event. Hides the sticky footer, if stuck.
                 *
                 * @return void
                 */
                hideOnInputFocus: function () {
                    if (Sage.common.stickyFooter.stuck === true) {
                        Sage.common.stickyFooter.element.hide();
                    }
                },

                /**
                 * Polling function. Updates tracking information about positioning and determines whether to change state.
                 *
                 * @return void
                 */
                poll: function () {

                    // Always keep window scrollTop and window scrollBottom up to date.
                    Sage.common.stickyFooter.windowScrollTop = Sage.common.stickyFooter.window.scrollTop();
                    Sage.common.stickyFooter.windowScrollBottom = Sage.common.stickyFooter.windowScrollTop + Sage.common.stickyFooter.windowHeight;

                    // If the footer isn't stuck, update position tracking variables for the sticky footer.
                    if (!Sage.common.stickyFooter.stuck) {
                        Sage.common.stickyFooter.elementTop = Sage.common.stickyFooter.element.offset().top;
                        Sage.common.stickyFooter.elementBottom = Sage.common.stickyFooter.elementTop + Sage.common.stickyFooter.element.outerHeight();
                        Sage.common.stickyFooter.visibleTop = Sage.common.stickyFooter.elementTop < Sage.common.stickyFooter.windowScrollTop ? Sage.common.stickyFooter.windowScrollTop : Sage.common.stickyFooter.elementTop;
                        Sage.common.stickyFooter.visibleBottom = Sage.common.stickyFooter.elementBottom > Sage.common.stickyFooter.windowScrollBottom ? Sage.common.stickyFooter.windowScrollBottom : Sage.common.stickyFooter.elementBottom;
                        Sage.common.stickyFooter.visiblePixels = Sage.common.stickyFooter.visibleBottom - Sage.common.stickyFooter.visibleTop;
                        Sage.common.stickyFooter.visiblePercent = Sage.common.stickyFooter.visiblePixels / Sage.common.stickyFooter.windowHeight;

                        // Determine if the visible percent is less than the target - if so, stick.
                        if (Sage.common.stickyFooter.visiblePercent < Sage.common.stickyFooter.targetPercent) {
                            Sage.common.stickyFooter.stick();
                        }
                    } else {
                        if (Sage.common.stickyFooter.windowScrollBottom >= Sage.common.stickyFooter.document.height()) {
                            Sage.common.stickyFooter.unstick();
                        }
                    }
                },

                /**
                 * A function to handle the input blur event. Shows the sticky footer.
                 *
                 * @return void
                 */
                showOnInputBlur: function () {
                    Sage.common.stickyFooter.element.show();
                },

                /**
                 * A function to transition the sticky footer from an unstuck state to a stuck state.
                 *
                 * @return void
                 */
                stick: function () {
                    this.stuck = true;
                    this.element.addClass('stuck');
                    this.elementParent.addClass('has-stuck-footer');
                },

                /**
                 * A function to transition the sticky footer from a stuck state to an unstuck state.
                 *
                 * @return void
                 */
                unstick: function () {
                    this.stuck = false;
                    this.element.removeClass('stuck');
                    this.elementParent.removeClass('has-stuck-footer');
                },

                /**
                 * A function to handle viewport resizes.
                 *
                 * @return void
                 */
                updateViewport: function () {
                    Sage.common.stickyFooter.windowHeight = Sage.common.stickyFooter.window.height();
                    Sage.common.stickyFooter.poll();
                }
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
