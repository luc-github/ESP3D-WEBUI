	// LocalStorage Notes------------------------------------------->		
		
			// ruft localStorage.setItem(key, value) auf und
			// zeigt alle gespeicherten Key-Value-Paare an
			function setItemToStorage() {
				// Felder für Key-Name und Wert aus dem Formular
				var nameField = document.getElementById("name");
				var valueField = document.getElementById("value");
				//save the note
				localStorage.setItem(nameField.value, valueField.value);
				showStorage();
			}

			// ruft localStorage.getItem(key) auf und
			// zeigt das gespeicherte Key-Value-Paar an
			function getItemFromStorage() {
				var VariablezumAuslesen = document.getElementById('name').value;
 				document.getElementById('value').value = window.localStorage.getItem(VariablezumAuslesen);
			}			
			
			//Betreffzeile in Notiz übernehmen
			function getItemtoNote() {
			document.getElementById('value').value = document.getElementById('name').value;
			}
			
			// ruft localStorage.removeItem(key) auf und
			// zeigt alle gespeicherten Key-Value-Paare und löscht das Key-Value-Paar
			function removeItemFromStorage() {				
				//window.confirm('Notiz löschen?');
				if (confirm('Delete this Note?')) {
					var nameField = document.getElementById("name");
					localStorage.removeItem(nameField.value);
					//localStorage.removeItem(valueField.value);	wird nicht benötigt					
					//document.getElementById("value").value = '';
					//document.getElementById("name").value = '';	
					showStorage();
				}
				else {
					return "";
				}
			}


			// zeigt alle gespeicherten Key-Value-Paare an 
			function showStorage() {
			  var keyValuePairs = '';
			  for (var key in localStorage) {
				if (! localStorage.hasOwnProperty(key)) continue;
				keyValuePairs += '<div class="notizeintrag" id="notiz" >' + '<div class="notizheader" id="header">' + key + '</div>' + '<div class="img" >' + '►' + '</div>' + '<div class="notiz">' + localStorage.getItem(key) + '</div>' + '</div>';
			  }
			  document.getElementById('keyvalues').innerHTML = keyValuePairs;
			  // zeigt die Anzahl der Notizen Summe als Zahl
			  document.getElementById('num_keyvalues').innerHTML = '(Number ' + localStorage.length + ')';
			}


			// ruft localStorage.clear() auf und
			// löscht alle gespeicherten Key-Value-Paare
			function clearStorage() {				
				if (confirm('Are you sure, you want delete ALL Notes?')) {
					localStorage.clear();
					showStorage();
				}
				else {
					return "";
				}
			}
			
			
// Drag an Drope - Trash can ------experimental----------------------->	
			var addEvent = (function () {
			  if (document.addEventListener) {
			    return function (el, type, fn) {
			      if (el && el.nodeName || el === window) {
			        el.addEventListener(type, fn, false);
			      } else if (el && el.length) {
			        for (var i = 0; i < el.length; i++) {
			          addEvent(el[i], type, fn);
			        }
			      }
			    };
			  } else {
			    return function (el, type, fn) {
			      if (el && el.nodeName || el === window) {
			        el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
			      } else if (el && el.length) {
			        for (var i = 0; i < el.length; i++) {
			          addEvent(el[i], type, fn);
			        }
			      }
			    };
			  }
			})();			
			
			addEvent(window, 'load', function() {
			  var draggableEins = document.getElementById('.notizheader');
			  var draggableZwei = document.getElementById('.notizeintrag'); 
			  var drop          = document.getElementById('drop');
			 
			  function cancel(e) {
			    if (e.preventDefault) e.preventDefault();
			    return false;
			  }
			
			  //Tells the browser that we can drop on this target
			  addEvent(drop, 'dragover', cancel);  //DOM event
			  addEvent(drop, 'dragenter', cancel); //IE event				
			  
			  addEvent(drop, 'drop', function (e) {
			    			    
			    if (e.preventDefault) e.preventDefault(); // stops the browser from redirecting off to the text.
			      { 
			      var notizfeld = document.getElementById("name");
				  var noitzeintrag = document.getElementById("value");		
			      localStorage.removeItem(notizfeld.value);
			      localStorage.removeItem(noitzeintrag.value);		
				  document.getElementById("value").value = '';
				  document.getElementById("name").value = '';	
				  
			      //Output on Dropbox
			      this.innerHTML = "<strong>Note deleted!</strong>";
				  this.style.backgroundColor="#ececec"; 
				  showStorage();
				  }
				  
				  //funktioniert leider noch nicht, kann dann mit mehr verschoben werden (drag geht nicht)
				  //else {
				  //	return "";
				  //}
				  
				  //this.style.backgroundImage="images/note-small.png"; 
				  //localStorage.clear();   ---------------- funktioniert einwandfrei!!!!!!
			      //showStorage();  ----- zeigt aktuellen local storage
					//return false;
			  });
			});			