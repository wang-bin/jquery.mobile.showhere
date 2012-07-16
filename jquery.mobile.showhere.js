/*
 * jquery.mobile.showhere
 *
 * Copyright (c) 2012, WangBin
 * Dual licensed under the MIT and GPL Version 2 licenses.
 * 
 * Date: 2012-06-12 19:52:10
 */
 /*
  * TODO: popup message, effect, speed. onShow()
 */
(function($,window){
	$.widget("mobile.showhere",$.mobile.widget,{
		options: {
			ok: undefined,
			cancel: undefined,
			block: true ,//true: wallpaper ignore click. false: click wallpaper to close
			page: undefined
		},
		ok_call: undefined,
		cancel_call: undefined,
		wallpaper: undefined,
		content: undefined,
		exists: false,
		parentPage: undefined,
		_init: function() {
			this.ok_call = this.options.ok;
			this.cancel_call = this.options.cancel;
			this.block = this.options.block;
			this.parentPage = this.options.page || $.mobile.activePage;
			this.exists = this.parentPage.find(this.content).size() != 0;
			
			var self = this; //or use $.proxy in events
			if (!this.exists) {
				console.log('new content');
				this.content = this.element.addClass('ui-showhere-content');
				this.content.trigger('create'); //render the element correctly with jqm style
				this.content.find(':jqmData(rel="ok")').addClass('ui-showhere-closebtn');
				this.content.find(':jqmData(rel="cancel")').addClass('ui-showhere-closebtn');

				if($(':jqmData(role="content")', $.mobile.activePage).length !== 0) {
					this.content.buttonMarkup(); //important. or checkbox won't work
				}
				this.content.undelegate().delegate(':jqmData(rel="ok")', 'mousedown', function(){
					if (self.ok_call !== undefined)
						if (self.ok_call() == false)
							return;
					self.close();
				}).delegate(':jqmData(rel="cancel")', 'mousedown', function(){
					console.log('cancel');
					if (self.cancel_call !== undefined)
						self.cancel_call();
					self.close();
				});
				this.content.appendTo(this.parentPage);
				$wallpaper = this.parentPage.find('div.ui-showhere-wallpaper');
				if ($wallpaper.size() != 0) {
					console.log('new wallpaper');
					$wallpaper.remove();
					
				}
				this.wallpaper = $('<div>', {'class':'ui-showhere-wallpaper'}).appendTo(this.parentPage).hide();
					this.wallpaper.bind("click",$.proxy(function(e) {
						if (!this.block)
							this.close();
					},this));
			}
		},
		//call backs
		open: function(callbacks){
			//console.log(this.wallpaper);
			//var self = this;
			if (callbacks.ok !== undefined)
				this.ok_call = callbacks.ok;
			if (callbacks.cancel !== undefined)
				this.cancel_call = callbacks.ok;
			this._moveContent();

			$(window).bind('orientationchange.showhere',$.proxy(function() {
				this._moveContent();
			}, this));

			if( $.support.cssTransitions ) {console.log('animation start');
				this.content.animationComplete(function(event) {
						$(event.target).removeClass("ui-showhere-animateIn");
					});
				this.content.addClass("ui-showhere-animateIn").show();
			} else {
				this.content.fadeIn();
			}
			this.content.show();
			//wallpaper is the same size of window so we forbid scrolling vertically. freeze the content. NOT WORK ON MOBILES
			$('body').css('overflow-y','hidden');
			this.wallpaper.css('top',$(window).scrollTop()).css('height',$(window).height()).show(); //smaller wallpaper better performance
		},
		close: function() {
			var self = this;
			$(window).unbind('orientationchange.showhere');
			if( $.support.cssTransitions ) {
				this.content.addClass("ui-showhere-animateOut");
				this.content.animationComplete(function() {
					self._reset();
				});
			} else {
				this.content.fadeOut();
			}
			//this.content.hide();
			this.wallpaper.hide();
			$('body').css('overflow-y','scroll'); //scroll is enabled again
		},
		_reset: function() {
			this.wallpaper.hide();
			this.content.hide().removeClass("ui-showhere-animateOut").removeClass("ui-showhere-animateIn");
			var self = this;
		},
		_moveContent: function() {
			var height = $(window).height(),
				width = $.mobile.activePage.width(), //page center, not window center
				scrollPosition = $(window).scrollTop();
			this.content.css({
				'top': (scrollPosition + height / 2 - this.content.height() / 2),
				'left': (width / 2 - this.content.width() / 2)
			});
		}
	});
}) (jQuery,this);
