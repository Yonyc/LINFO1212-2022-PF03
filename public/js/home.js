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

async function getAllUsers() {
    let res = await fetch(api_url + "/user/getallusers", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
	});

	res = await res.json();

	document.querySelector("#getallusers").innerText = res;

}
document.addEventListener('DOMContentLoaded', function() {
	getAllUsers();
});


async function getAllAppointmentOfToday() {
    let res = await fetch(api_url + "/appointment/getallbooking", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
	});

	res = await res.json();

	document.querySelector("#getallbooking").innerText = res;

}
document.addEventListener('DOMContentLoaded', function() {
	getAllAppointmentOfToday();
});


async function getAllRooms() {
    let res = await fetch(api_url + "/room/getallrooms", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
	});

	res = await res.json();

	document.querySelector("#getallrooms").innerText = res;

}
document.addEventListener('DOMContentLoaded', function() {
	getAllRooms();
});

async function getAllTherapist() {
    let res = await fetch(api_url + "/therapist/getalltherapist", {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
	});

	res = await res.json();

	document.querySelector("#getalltherapist").innerText = res;

}
document.addEventListener('DOMContentLoaded', function() {
	getAllTherapist();
});
