/*!
 * prettySelect Javascript Library v0.0.1
 *
 * Copyright 2012, Kirill Kalachev aka dhampik
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Requires and uses JQuery
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Released under the MIT and GPL Version 2 licenses.
 *
 * Date: Thu Jan 19 01:56:00 2012 +0300
 */

(function($, window, document, undefined){

	var collapseExpandedPrettySelects = function () {
		$('.pretty-select-wrapper ul.pretty-select-options:visible').hide();
		$('.pretty-select-wrapper').css('z-index', 0);
	}

	var processExternalClick = function(event) {
		if ($(event.target).closest('.pretty-select-wrapper').length === 0) { collapseExpandedPrettySelects(); }
	};

	var methods = {
		'init': function(options) {
			var opts = $.extend({}, $.fn.prettySelect.defaults, options);
			
			return this.each(function () {

				var $select = $(this);
				
				if ($select.prop('multiple')) { return; }
				
				if (!$(document).data('pretty-select-click-handler')) {
					$(document).mousedown(processExternalClick);
					$(document).data('pretty-select-click-handler', 1);
				}
				
				if ($select.data('pretty-select-disabler-iid')) {
					clearInterval($select.data('pretty-select-disabler-iid'));
					$.removeData($select, 'pretty-select-disabler-iid')
				}
				
				if ($select.data('pretty-select-wrapped')) {
					var $auxWrapper = $select.closest('.pretty-select-wrapper');
					$auxWrapper.find('.pretty-select-control').remove();
					$auxWrapper.find('.pretty-select-options').remove();
					$select.unwrap();
				}

				var $wrapper = $select
					.addClass('pretty-select-hidden')
					.wrap('<div class="pretty-select-wrapper"></div>')
					.parent();
				
				$wrapper.prepend('<a href="#" class="pretty-select-control"><span class="pretty-select-value-text"></span><span class="pretty-select-arrow"></span></a><ul class="pretty-select-options"></ul>');
				
				var $control = $('a.pretty-select-control', $wrapper);
				$control.click(function () {
					if( $ulOptions.css('display') == 'none' ) { collapseExpandedPrettySelects(); } 
					if ($select.attr('disabled')) {
						if (!$control.hasClass('pretty-select-disabled')) { // to avoid jitter in IE
							$control.addClass('pretty-select-disabled');
						}
						return false;
					} else {
						if ($control.hasClass('pretty-select-disabled')) { // to avoid jitter in IE
							$control.removeClass('pretty-select-disabled')
						}
					}

					if ($wrapper.css('z-index') == 0) {
						$wrapper.css('z-index', 80);
					} else {
						$wrapper.css('z-index', 0);
					}
					$ulOptions.toggle();
					return false;
				});
				
				var $ulOptions = $('ul.pretty-select-options', $wrapper);
				/* Now we add the options */
				$('option', this).each(function(i){
					var $liOption = $('<li><a href="#">'+ $(this).html() +'</a></li>');
					$liOption.find('a').data('pretty-select-option', {index: i});
					$liOption.find('a').click(function () {
						$('a.pretty-select-selected', $wrapper).removeClass('pretty-select-selected');
						$(this).addClass('pretty-select-selected');
						/* Fire the onchange event */
						if ($select.prop('selectedIndex') != $(this).data('pretty-select-option').index && $select.get(0).onchange) {
							$select.prop('selectedIndex', $(this).data('pretty-select-option').index);
							$select.get(0).onchange();
						}
						$select.prop('selectedIndex', $(this).data('pretty-select-option').index);
						$('.pretty-select-value-text', $control).html($(this).html());
						$ulOptions.hide();
						return false;
					});
					$ulOptions.append($liOption);
				});
				$('a:eq('+ this.selectedIndex +')', $ulOptions).click();
				
				var $wrapperShadow = $wrapper.clone().css({'position': 'absolute', 'display': 'block', 'visibility': 'hidden', 'opacity': 0}).appendTo('body');
				
				if ($wrapperShadow.find('select').get(0).style.width !== '' && $wrapperShadow.find('select').get(0).style.width !== 'auto' && $wrapperShadow.find('select').get(0).style.width !== undefined) {
					$control.css('width', $wrapperShadow.find('select').css('width'));
					$control.find('.pretty-select-value-text').width($wrapperShadow.find('select').width()-$wrapperShadow.find('.pretty-select-arrow').outerWidth());
				} else {
					$control.width($wrapperShadow.find('ul').width()+$wrapperShadow.find('.pretty-select-arrow').outerWidth());
					$control.find('.pretty-select-value-text').width($wrapperShadow.find('ul').width());
				}
				
				//$control.find('.pretty-select-value-text').width($ulOptions.width());
				//$control.width($control.find('.pretty-select-value-text').outerWidth() + $control.find('.pretty-select-value-arrow').outerWidth());
				$wrapperShadow.remove();
				
				$wrapperShadow = $wrapper.clone().css({'position': 'absolute', 'display': 'block', 'visibility': 'hidden', 'opacity': 0}).appendTo('body');
				
				var optionsScrollRequired = true;
				if (5 >= $('li', $ulOptions).length) { // should use size attr instead of 5
					optionsScrollRequired = false;
				} else {
					$ulOptions.height(5*$('li:first', $wrapperShadow).height()); // should use size attr instead of 5
				}
				
				if ($wrapperShadow.find('ul').outerWidth() < $wrapperShadow.find('.pretty-select-control').outerWidth()) {
					var width1 = $wrapperShadow.find('ul').width()+(optionsScrollRequired?20:0);
					var width2 = $wrapperShadow.find('.pretty-select-control').outerWidth() - 2*parseInt($ulOptions.css('left'), 10) - parseInt($ulOptions.css('border-left-width'), 10) - parseInt($ulOptions.css('border-right-width'), 10);
					$ulOptions.width(Math.max(width1, width2));
				} else if (optionsScrollRequired) {
					$ulOptions.width($wrapperShadow.find('ul').width()+20);
				}
				
				$wrapperShadow.remove();
				
				if ($select.attr('disabled')) {
					$control.addClass('pretty-select-disabled');
				}
				
				$ulOptions.css('display', 'none');
				
				$select.data('pretty-select-wrapped', 1);
				
				if (!$select.data('pretty-select-disabler-iid')) {
					var iid = setInterval(function () {
						if ($select.attr('disabled')) {
							if (!$control.hasClass('pretty-select-disabled')) { // to avoid jitter in IE
								$control.addClass('pretty-select-disabled');
							}
							return;
						} else {
							if ($control.hasClass('pretty-select-disabled')) { // to avoid jitter in IE
								$control.removeClass('pretty-select-disabled')
							}
						}
						if ($('li a.pretty-select-selected', $ulOptions).data('pretty-select-option').index != $select.val()){
							$('a.pretty-select-selected', $ulOptions).removeClass('pretty-select-selected');
							$('a:eq('+ $select.get(0).selectedIndex +')', $ulOptions).addClass('pretty-select-selected');
							$('.pretty-select-value-text', $control).html($('a:eq('+ $select.get(0).selectedIndex +')', $ulOptions).html());
						}
					}, 100);
					$select.data('pretty-select-disabler-iid', iid);
				}
			});
		}
	};

	$.fn.prettySelect = function(method) {

		if ( methods[method] ) {
			return methods[method].apply(this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on $.yiiScrollingLoader' );
		}

	};

	$.fn.prettySelect.defaults = {};

})(jQuery, window, document);