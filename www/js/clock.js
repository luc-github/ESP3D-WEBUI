// Set Clock in Menutab------------------------------------------->		
		
function clock(){
	  var stunden, minuten, sekunden;
	  var StundenZahl, MinutenZahl, SekundenZahl;
	  var heute;
	 
	  heute = new Date();
	  StundenZahl = heute.getHours();
	  MinutenZahl = heute.getMinutes();
	  SekundenZahl = heute.getSeconds();
	 
	  stunden = StundenZahl+":";
	  if (MinutenZahl < 10) {minuten = "0" + MinutenZahl + ":";}
		else {minuten = MinutenZahl + ":";}
	  if (SekundenZahl < 10) {sekunden = "0" + SekundenZahl + " ";}
		else {sekunden = SekundenZahl + " ";}
	  zeit = stunden + minuten + sekunden + " Clock";
	  clocks.innerHTML = zeit;
	 
	  window.setTimeout("clock();", 1000);
	}
 
window.onload = clock;		