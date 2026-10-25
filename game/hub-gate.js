// First visit goes to the tutorial; the hub opens once the tutorial is cleared (moved out of hub.html for the CSP).
try{var _p=JSON.parse(localStorage.getItem("warden.profile.v1")||"{}");if(!(_p.seals&&_p.seals.tutorial&&_p.seals.tutorial.cleared)&&!/[?&]stay(&|$)/.test(location.search))location.replace("index.html")}catch(e){}
