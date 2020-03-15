// Set Clock in Navbar/Header------------------------------------------->		
		
var viewclock = setInterval (clock, 1000);
function clock(){
	  var stunden, minuten, sekunden;
	  var StundenZahl, MinutenZahl, SekundenZahl;
	  var heute;
	 
	  heute = new Date();
	  StundenZahl = heute.getHours();
	  MinutenZahl = heute.getMinutes();
	  SekundenZahl = heute.getSeconds();
	 
	  if (StundenZahl < 10) {stunden = "0" + StundenZahl + ":";}
		else {stunden = StundenZahl + ":";}
	  if (MinutenZahl < 10) {minuten = "0" + MinutenZahl + ":";}
		else {minuten = MinutenZahl + ":";}
	  if (SekundenZahl < 10) {sekunden = "0" + SekundenZahl + " ";}
		else {sekunden = SekundenZahl + " ";}
	  zeit = stunden + minuten + sekunden;
	  clocks.innerHTML = zeit;	 
	}

