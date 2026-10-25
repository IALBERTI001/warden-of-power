// Entry gate (Oct 25 2026): index.html is the game's front door. New players drop straight into the tutorial;
// returning players (tutorial cleared) open the hub instead. Any ?mission=... link plays that battle directly.
try{if(!location.search){var _p=JSON.parse(localStorage.getItem('warden.profile.v1')||'{}');if(_p&&_p.seals&&_p.seals.tutorial&&_p.seals.tutorial.cleared)location.replace('hub.html')}}catch(e){}
