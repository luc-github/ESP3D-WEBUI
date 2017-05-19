var cam_is_checked=false;
function OnCheckCam() {
     if (typeof document.getElementById('camcheck') != "undefined") {
         cam_is_checked = !cam_is_checked;
         document.getElementById("camcheck").checked = cam_is_checked;
         if (typeof document.getElementById('camtab') != "undefined") {
             if (cam_is_checked){
                 document.getElementById('camtablink').style.display = "block";
                 document.getElementById("camtablink").click();                 
                 var saddress = document.getElementById('camera_webaddress').value
                 if (saddress.length == 0)camera_GetAddress();
             }
             else {
                 document.getElementById("maintablink").click();
                 document.getElementById('camtablink').style.display = "none";
             }
         }
     }
}

function cameraformataddress() {
    var saddress = document.getElementById('camera_webaddress').value;
    var saddressl =saddress.trim().toLowerCase();
    saddress =saddress.trim();
   if (saddress.length > 0) {
       if ( !(saddressl.indexOf("https://") != -1 || saddressl.indexOf("http://") != -1 || saddressl.indexOf("rtp://") != -1 || saddressl.indexOf("rtps://") != -1 || saddressl.indexOf("rtp://") != -1 )) {
           saddress = "http://" + saddress;
       } 
   } 
   document.getElementById('camera_webaddress').value = saddress;
 } 

function camera_loadframe(){
    var saddress = document.getElementById('camera_webaddress').value;
    saddress =saddress.trim();
    if(saddress.length == 0) {
        document.getElementById('camera_frame').src = "";
        document.getElementById('camera_frame_display').style.display = "none";
        }
    else{
        cameraformataddress();
        document.getElementById('camera_frame').src = document.getElementById('camera_webaddress').value;
        document.getElementById('camera_frame_display').style.display = "block";
    } 
}

function camera_OnKeyUp(event){
    if (event.keyCode == 13) {
                camera_loadframe();
            }
    return true;
}

 function DisplayAddress(webaddress){
    document.getElementById('camera_webaddress').value = webaddress;
    cameraformataddress();
    camera_loadframe();
}

function camera_GetAddress(){
        var url = "/command?plain="+encodeURIComponent("[ESP301]");
        SendGetHttp(url, camera_GetAddressSuccess, camera_GetAddressFailed);
}

function camera_saveaddress(){
    var saddress = "";
    var url  = "";
    cameraformataddress();
    saddress = document.getElementById('camera_webaddress').value;
    url  = "/command?plain="+encodeURIComponent("[ESP300]" + saddress);
    SendGetHttp(url, camera_saveaddressSuccess, camera_saveaddressFailed);
}

function camera_detachcam(){
    var webaddress = document.getElementById('camera_frame').src;
    document.getElementById('camera_frame').src = "";
    document.getElementById('camera_frame_display').style.display = "none";
    window.open(webaddress);
}

function camera_GetAddressSuccess(response){
    //console.log(response);
    DisplayAddress(response);
}

function camera_GetAddressFailed(error_code,response){
     console.log("Error " + error_code + " :" + response);
}

function camera_saveaddressSuccess(response){
    //console.log(response);
}

function camera_saveaddressFailed(error_code,response){
     console.log("Error " + error_code + " :" + response);
}
