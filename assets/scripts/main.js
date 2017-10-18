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

(function($) {
	// Use this variable to set up the common and page specific functions. If you
	// rename this variable, you will also need to rename the namespace below.
	var Sage = {
		// All pages
		common: {
			init: function() {
				// JavaScript to be fired on all pages

				// Set up Google Analytics events
				if (typeof ga === "function") {
					Sage.common.gaTrackDocumentLinks();
					Sage.common.gaTrackMailtoLinks();
					Sage.common.gaTrackOutboundLinks();
				}

				// Function to enable L1 navigation dropdown item links
				// Tested on bootstrap 3.3.1
				$("#menu-primary-navigation .dropdown").on("show.bs.dropdown", function(e) {
					e.preventDefault();
				});

				// requires .videoWrapper style
				// change static sized iframe video to responsive sized ( add checks to apply for any other than Youtube)
				if ($("iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']").length) {
					$("iframe[src^='http://www.youtube.com'], iframe[src^='https://www.youtube.com']")
						.removeAttr("height")
						.removeAttr("width")
						.wrap("<div class='videoWrapper'></div>");
				}

				/* SVG Polyfill for svg animations for unsupported browsers
					USAGE: uncoment and fill in SvgPolyfill.init(); with the appropreate selectors
				*/
				var SvgPolyfill = {
					init: function(selectors) {
						// Only init for Edge and MSIE
						if (navigator.userAgent.indexOf("Edge") === -1 && navigator.userAgent.indexOf("MSIE") === -1 && navigator.userAgent.indexOf("Trident") === -1) {
							return;
						}
						// Cache reference to SVG sub-elements via provided selectors
						this.elements = document.querySelectorAll(selectors);
						// Set up interval to monitor and update elements
						setInterval(this.transformEach.bind(this), 10);
					},
					setTransform: function(element) {
						var style = getComputedStyle(element),
							matrix = style.getPropertyValue("transform").match(/\(([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+),\s+([0-9\.]+)\)/),
							transformOrigin = style.getPropertyValue("transform-origin").match(/([0-9\.]+).*?([0-9\.]+)/);
						// Remove first match from matches (copy of entire string)
						matrix.shift();
						transformOrigin.shift();
						// Compute translate parameters dynamically
						matrix[4] = (1 - matrix[0]) * transformOrigin[0];
						matrix[5] = (1 - matrix[3]) * transformOrigin[1];
						// Recompile matrix as string
						matrix = "matrix(" + matrix.join() + ")";
						element.setAttribute("transform", matrix);
					},
					transformEach: function() {
						Array.prototype.forEach.call(this.elements, this.setTransform);
					}
				};

				// SvgPolyfill.init('.grow, #house1, g[data-name="Box1"]');

				// Uncomment this section if using breakpoints in JavaScript.
				// Update breakpoint value cache on window resize.
				//$(window).resize(function () {
				//    Sage.common.breakpoint.refreshValue();
				//}).resize();

				//RESPONSIVE TABLE FIXER
				//UNCOMMENT THIS SECTION IF YOU WANT RESPONSIVE TABLES
				//Sage.common.responsiveTable();

				//To use sticky footer functionality:
				//Uncomment ISI include in footer.php template
				//Uncomment line in main.scss to include _sticky-footer.scss
				//Uncomment this line:
				//Sage.common.stickyISI();
			},
			breakpoint: {
				refreshValue: function() {
					this.value = window
						.getComputedStyle(document.querySelector("body"), ":before")
						.getPropertyValue("content")
						.replace(/['"]+/g, "");
				}
			},
			finalize: function() {
				// JavaScript to be fired on all pages, after page specific JS is fired
			},
			gaLogEvent: function(event) {
				// General event logging function, intended to be used with .on('click') event handlers
				if (typeof event.data.label !== "undefined") {
					if (typeof event.data.value !== "undefined") {
						ga("send", "event", event.data.category, event.data.action, event.data.label, event.data.value);
					} else {
						ga("send", "event", event.data.category, event.data.action, event.data.label);
					}
				} else {
					ga("send", "event", event.data.category, event.data.action);
				}
			},
			gaTrackDocumentLinks: function() {
				// Set up tracking on clicks on documents, such as PDFs
				$('a:not([href^="mailto"])')
					.filter(function() {
						// If this anchor doesn't have an HREF, ignore it.
						if (typeof this.href !== "string") {
							return false;
						}

						// Try to split the HREF into pathinfo sements.
						var pathinfo = this.href.split("/");
						if (pathinfo.length === 0) {
							return false;
						}

						// If the last segment contains a period, then it is most likely a document. Set up tracking.
						return pathinfo[pathinfo.length - 1].indexOf(".") > 0;
					})
					.each(function() {
						$(this).on(
							"click",
							{
								category: "Downloads",
								action: this.href.substr(this.href.lastIndexOf(".") + 1).toUpperCase(),
								label: this.href.substr(this.href.lastIndexOf("/") + 1)
							},
							Sage.common.gaLogEvent
						);
					});
			},
			gaTrackMailtoLinks: function() {
				// Listen for links that start with mailto: and fire an event when clicked
				$('a[href^="mailto:"]').each(function() {
					$(this).on(
						"click",
						{
							category: "Mailto Intent",
							action: "Click",
							label: this.href.substr(7)
						},
						Sage.common.gaLogEvent
					);
				});
			},
			gaTrackOutboundLinks: function() {
				// Listen for links that don't match the current base URL and fire an event when clicked
				var currentUrl = window.location.href.substr(0, window.location.href.indexOf("/", 10));
				$('a[href^="http"]')
					.not('[href^="' + currentUrl + '"]')
					.each(function() {
						$(this).on(
							"click",
							{
								category: "Outbound Links",
								action: "Click",
								label: this.href
							},
							Sage.common.gaLogEvent
						);
					});
			},
			responsiveTable: function() {
				if ($("table").length) {
					// just get the user created tables
					$table = $("table").not(".crayon-table");

					//first fix any tables without theads
					$($table).each(function() {
						$hasHead = $("thead td, thead th", this).length;
						if (!$hasHead) {
							$(this)
								.prepend("<thead></thead>")
								.find("tr:first")
								.prependTo($("thead", this));
						}
					});

					//second update tables to have data attrs
					$($table).each(function() {
						$hasHead = $("thead td, thead th", this).length;
						$col_titles = [];

						if ($hasHead) {
							//make sure our current table has what we need to get started.
							// cache our column titles (include td for bad html)
							$(this)
								.find("th, td")
								.each(function() {
									$content = $(this).text() + ": ";
									$col_titles.push($content);
								});

							// add our column titles to data attrs on each tr>td
							$(this)
								.find("tr")
								.each(function() {
									$row = $(this);
									$row.children("td").each(function(key) {
										$(this).attr("data-label", $col_titles[key]);
									});
								});
						}
					});
				}
			},

			stickyISI: function() {
				var scrollTopSave = 0;
				var expanded = false;
				var expanding = false;

				var expandLink = $(".expand_isi"); // The Link that will trigger the ISI expansion
				var cloneTarget = $(".clone_target");
				var stickyContentTarget = $(".sticky_content"); // The container the cloned content will be appended to
				var staticElement = $("#isi-container"); // The highest level container of the ISI at the bottom of the page. Not the sticky part
				var stickyElement = $("#isi_sticky"); // The top level container of the sticky section
				var scroller = cloneTarget.clone();

				function hideShow(stickyElement, staticElement) {
					var isiScrollContainerSelector = ".isi-wrapper"; // The section that should scroll while the footer is stuck
					var clonedElement = stickyElement;

					if (stickyElement.offset().top > staticElement.offset().top || expanding) {
						//console.log('is on screen');
						clonedElement.removeClass("show");
						var page_url = window.location.href;
						if (page_url.includes("/importantSafetyInformation.html") === false) {
							$(".isi-header").show();
						} else {
							$(".isi-header").hide();
						}
					} else {
						//console.log('is not on screen');
						$(".isi-header").hide();
						if (!clonedElement.hasClass("show")) {
							$(isiScrollContainerSelector).scrollTop(0);
						}
						clonedElement.addClass("show");
						$(".clone_target").removeClass("expanded");
						expanded = false;
					}
				}

				function toggleISI(cloneTarget) {
					var offset = cloneTarget.offset();
					offset.top -= 20;
					offset.left -= 20;
					if (!expanded) {
						scrollTopSave = $(document).scrollTop();
						expanded = true;
						expanding = true;
						cloneTarget.addClass("expanded");
						$("html, body").animate(
							{
								scrollTop: offset.top,
								scrollLeft: offset.left
							},
							275,
							function() {
								expanding = false;
							}
						);
					} else {
						expanded = false;
						cloneTarget.removeClass("expanded");
						$("html, body").animate(
							{
								scrollTop: scrollTopSave,
								scrollLeft: 0
							},
							275
						);
					}
				}

				jQuery.extend({
					getQueryParameters: function(str) {
						return (str || document.location.search)
							.replace(/(^\?)/, "")
							.split("&")
							.map(
								function(n) {
									return (n = n.split("=")), (this[n[0]] = n[1]), this;
								}.bind({})
							)[0];
					}
				});

				//run onload
				function scrollVisible(element) {
					var docViewTop = $(window).scrollTop();
					var isiHeight = $("#isi_sticky").height();
					var docViewBottom = docViewTop + $(window).height() - isiHeight;
					var elemTop = element.offset().top;
					var elemHeight = element.height();
					return docViewBottom > elemTop + elemHeight * 0.2;
				}

				/**
				 * Generic function to handle slide up scroll triggered animations
				 *
				 */
				if (!Modernizr.touchevents && !Modernizr.pointerevents) {
					var scrollPosTriggers = $("body").find(".slide-up-anim");

					scrollPosTriggers.each(function() {
						if (!scrollVisible($(this))) {
							$(this).removeClass("in");
						}
					});

					if (scrollPosTriggers.length > 0) {
						$(window).on("scroll", function(e) {
							scrollPosTriggers.each(function() {
								// Animate content when we see 20% of the element
								if (scrollVisible($(this))) {
									$(this).addClass("in");
									// Remove shown element from the jquery object so e don't hvae to check again
									scrollPosTriggers = scrollPosTriggers.not($(this));
								}
							});
						});
					}
				}

				// Add ?sticky-isi=false  to the URL to remove for screenshots
				if ($.getQueryParameters()["sticky-isi"] === "false") {
					return;
				}

				scroller.removeClass("clone_target").removeAttr("id");
				stickyElement.css("bottom", 0);
				stickyContentTarget.append(scroller);
				hideShow(stickyElement, staticElement);

				$(window).on("scroll resize", function() {
					hideShow(stickyElement, staticElement);
				});

				expandLink.click(function() {
					toggleISI(cloneTarget);
				});
				//stickyISI end
			}
		}
	};

	// The routing fires all common scripts, followed by the page specific scripts.
	// Add additional events for more control over timing e.g. a finalize event
	var UTIL = {
		fire: function(func, funcname, args) {
			var fire;
			var namespace = Sage;
			funcname = funcname === undefined ? "init" : funcname;
			fire = func !== "";
			fire = fire && namespace[func];
			fire = fire && typeof namespace[func][funcname] === "function";

			if (fire) {
				namespace[func][funcname](args);
			}
		},
		loadEvents: function() {
			// Fire common init JS
			UTIL.fire("common");

			// Fire page-specific init JS, and then finalize JS
			$.each(document.body.className.replace(/-/g, "_").split(/\s+/), function(i, classnm) {
				UTIL.fire(classnm);
				UTIL.fire(classnm, "finalize");
			});

			// Fire common finalize JS
			UTIL.fire("common", "finalize");
		}
	};

	// Load Events
	$(document).ready(UTIL.loadEvents);
})(jQuery); // Fully reference jQuery after this point.
