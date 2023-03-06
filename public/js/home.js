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

async function refreshTherapists() {
	let therapists = [];
	try {
        let res = await fetch(api_url + "/therapist/list", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
        });
        
        if (res.status != 200) return false;
        
        res = await res.json();

		if (!res.success) {
			errorModal._element.querySelector(".error_text").innerText = res.data.message;
        	errorModal.show();
			return false;
		};

		therapists = res.data.therapists;

    } catch (err) {throw err;}


	let therapistList = document.querySelector(".therapist_list");
	if (!therapistList) return false;
	therapists.forEach(t => {
		therapistList.innerHTML += `<a class="tharpist_home text-decoration-none" href="/therapist/${t.id}">
			<img src="${t.User.url_pp}" alt="wrapkit" class="therapists img-fluid rounded-circle" />

			<div class="col-md-12 text-center">
				<div class="pt-2">
					<h5 class="mt-4 font-weight-medium mb-0">${t.User.firstname} ${t.User.lastname}</h5>
					<h6 class="subtitle mb-3">${t.job}</h6>
				</div>
			</div>
		</a>`;
	});
}

export function main(){
	countData("/user/getallusers", "#getallusers");
	countData("/appointment/getallbooking", "#getallbooking");
	countData("/room/getallrooms", "#getallrooms");
	countData("/therapist/getalltherapist", "#getalltherapist");
	refreshTherapists();
}