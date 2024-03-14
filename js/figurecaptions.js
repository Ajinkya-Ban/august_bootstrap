


;(function($){
	var defaults = {fx: 'default', duration: 0.5}
	var basefx = 'figurefx'
	var fixstickyhoverlink_id = 'stickyhoverfixios'

	document.createElement('figure')
	document.createElement('figcaption')

	var $fixstickyhoverlink
	var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) // detect iOS devices, which has a sticky :hover effect problem
	var ie9below = /MSIE [1-9]\./.test( navigator.userAgent ) // detect IE9 and below, which doesn't support 3d rotation like rotatex

	function createfigure($el, caption){
		var $figure, $figcaption
		if ( $el.prop('tagName') == 'IMG' ){
			$el.wrap( '<figure class="' + basefx +'" />' )
			$figure = $el.parent()
		}
		else if ( $el.prop('tagName').toLowerCase() == 'figure' ){
			$el.addClass(basefx)
			$figure = $el
		}
		if ( $figure && $figure.find('figcaption').length == 0 ){
			if (caption == 'title'){
				caption = $el.attr('title')
				$el.attr('title', '')
			}
			$figcaption = $('<figcaption>' + caption + '</figcaption>').appendTo( $figure )
		}
		else{
			$figcaption = $figure.find('figcaption:eq(0)')
		}
		return $figure
	}

	function addeffect($figure, type){
		var $img = $figure.find('img')
		var $figcaption = $figure.find('figcaption')
		var $veils = (function(){
			return $('<div class="veils" /><div class="veils" />')
							.appendTo($figure)
		})()

		var timeline = new TimelineLite({paused: true})
		TweenLite.set($figcaption, {top:'50%', y:'-50%'}) // center align caption by default

		if ($figcaption.outerHeight() > $figure.outerHeight()){ // if caption height greater than figure, reconfigure caption position accordingly
			TweenLite.set($figcaption, {top:'0%', y:'0%', height:'100%'}) // center align caption by default			
		}

		if (type == "default"){
			var $veilA = $veils.eq(0)
			TweenLite.set($veilA, {y:'-100%', visibility:'visible'})
			TweenLite.set($figcaption, {x:'-100%', opacity:1})
			timeline.add( TweenLite.to($veilA, 1, {y:'0%'}) )
			timeline.add( TweenLite.to($figcaption, 1, {x:'0%', zIndex:101}))
		}
		else if (type == "zoomin"){
			TweenLite.set($figcaption, {scale: 2, opacity: 0})
			timeline.add( TweenLite.to($img, 1, {opacity:0, scale:2}))
			timeline.add( TweenLite.to($figcaption, 1, {scale: 1, opacity: 1, zIndex:101}), 0 )
		}
		else if (type == "dualpanels"){
			var $veilA = $veils.eq(0)
			var $veilB = $veils.eq(1)
			TweenLite.set($veilA, {y:'-100%', visibility:'visible'})
			TweenLite.set($veilB, {y:'100%', visibility:'visible'})
			TweenLite.set($figcaption, {x:'-100%', opacity:1})
			timeline.add( TweenLite.to($veilA, 1, {y:'-50%'}) )
			timeline.add( TweenLite.to($veilB, 1, {y:'50%'}), "-=1" )
			timeline.add( TweenLite.to($figcaption, 1, {x:'0%', zIndex:101}))
		}
		else if (type == "dualpanels2"){
			var $veilA = $veils.eq(0)
			var $veilB = $veils.eq(1)
			TweenLite.set($veilA, {x:'-100%', visibility:'visible'})
			TweenLite.set($veilB, {x:'100%', visibility:'visible'})
			TweenLite.set($figcaption, {x:'-100%', opacity:1})
			timeline.add( TweenLite.to($veilA, 1, {x:'-50%'}) )
			timeline.add( TweenLite.to($veilB, 1, {x:'50%'}), "-=1" )
			timeline.add( TweenLite.to($figcaption, 1, {x:'0%', zIndex:101}))
		}
		else if (type == "pushup"){
			TweenLite.set($figcaption, {top:'100%', y:'0%', opacity:1}) // bottom align caption and past edge
			timeline.add( TweenLite.to($img, 1, {y:'-20px'}) )
			timeline.add( TweenLite.to($figcaption, 1, {y:'-100%', zIndex:101}), 0)
		}
		else if (type == "flipopen"){
			TweenLite.set($figure, {overflow:'visible', perspective: '2000px'})
			TweenLite.set($img, {position:'relative', transformOrigin:'0 0', zIndex:101})
			TweenLite.set($figcaption, {opacity:1})
			timeline.add( TweenLite.to($img, 1, {rotationX:180, autoAlpha: (ie9below)? 0 : 1}) )
		}
		else if (type == "flipreveal"){
			TweenLite.set($figure, {overflow:'visible', perspective: '900px'})
			TweenLite.set($img, {position:'relative', backfaceVisibility:'hidden', zIndex:101})
			TweenLite.set($figcaption, {opacity:1, rotationX:180})
			timeline.add( TweenLite.to($img, 1, {rotationX:180, autoAlpha: (ie9below)? 0 : 1}) )
			timeline.add( TweenLite.to($figcaption, 1, {rotationX:360}), 0 )
		}

		return timeline
	}

	jQuery.fn.addCaption=function(options){
		var s = $.extend({}, defaults, options)
		if ( iOS ){ // in iOS, fix sticky hover issue by creating a link that spans whole page during mouseenter state. Clicking this link activates mouseleave state in iOS
			var $fixstickyhoverlink = $('#' + fixstickyhoverlink_id)
			if ( $fixstickyhoverlink.length == 0 ){
				$fixstickyhoverlink = $('<a href="#" id="' + fixstickyhoverlink_id +'">').appendTo(document.body)
				$fixstickyhoverlink.on('click', function(){this.style.display='none'; return false})
			}
		}
		return this.each(function(){ //return jQuery obj
			var $figure = createfigure( $(this), s.caption)
			if (!$figure){
				return true // move on to next matched element
			}
			var timeline = addeffect($figure, s.fx)
			timeline.timeScale(1/s.duration)
			$figure.on('mouseenter', function(e){
				timeline.play()
				if (iOS){
					$fixstickyhoverlink.css('display', 'block')
				}
				e.stopPropagation()
			})
		
			$figure.on('mouseleave', function(){
				if (iOS){
					$fixstickyhoverlink.css('display', 'none')
				}
				timeline.reverse()
			})
			$figure.on('click', function(e){
				e.stopPropagation()
			})
		}) // end return this.each
	}

})(jQuery);