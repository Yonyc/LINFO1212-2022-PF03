/* Provide script for home page and for carousel slider */

export function loadCarousel() {
	(function ($) {
		"use strict";
		var fullHeight = function() {
	
			$('.js-fullheight').css('height', $(window).height());
			$(window).resize(function(){
				$('.js-fullheight').css('height', $(window).height());
			});
	
		};
		fullHeight();
		var carousel = function() {
			$('.home-slider').owlCarousel({
				loop:true,
				autoplay: true,
				margin:0,
				animateOut: 'fadeOut',
				animateIn: 'fadeIn',
				nav:true,
				lazyLoad: true,
				dots: true,
				autoplayHoverPause: false,
				items: 3,
				navText : ["<span class='ion-ios-arrow-back'></span>","<span class='ion-ios-arrow-forward'></span>"],
				responsive:{
					0:{
						items:1
					},
					600:{
						items:1
					},
					1000:{
						items:1
					}
				}
			});
	
		};
		carousel();
	})(jQuery);
}

async function countData(url, selector) {
	let res = await fetch(api_url + url, {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
	});

	res = await res.json();

	document.querySelector(selector).innerText = res.data.count;
}

export function main(){
	countData("/user/getallusers", "#getallusers");
	countData("/appointment/getallbooking", "#getallbooking");
	countData("/room/getallrooms", "#getallrooms");
	countData("/therapist/getalltherapist", "#getalltherapist");
}