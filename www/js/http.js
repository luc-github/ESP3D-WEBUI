var http_communication_locked = false;

function SendGetHttp(url, resultfn, errorfn){
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        return;
        }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200 )
                {
                    if (typeof resultfn != 'undefined' && resultfn != null )resultfn(xmlhttp.responseText);
                }
            else {
                    if (xmlhttp.status == 401)GetIdentificationStatus();
                    if (typeof errorfn != 'undefined' && errorfn != null )errorfn(xmlhttp.status, xmlhttp.responseText);
            }
        }
    }
    //console.log(url);
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function SendPostHttp(url, postdata,resultfn, errorfn){
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        return;
        }
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200 )
                {
                    if (typeof resultfn != 'undefined' && resultfn != null )resultfn(xmlhttp.responseText);
                }
            else {
                    if (xmlhttp.status == 401)GetIdentificationStatus();
                    if (typeof errorfn != 'undefined' && errorfn != null)errorfn(xmlhttp.status, xmlhttp.responseText);
            }
        }
    }
    //console.log(url);
    xmlhttp.open("POST", url, true);
    xmlhttp.send(postdata);
}

function SendFileHttp(url, postdata, progressfn,resultfn, errorfn){
    if (http_communication_locked) {
        errorfn(503, translate_text_item("Communication locked!"));
        return;
        }
    http_communication_locked = true;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            http_communication_locked = false;
            if (xmlhttp.status == 200 )
                {
                    if (typeof resultfn != 'undefined' && resultfn != null )resultfn(xmlhttp.responseText);
                }
            else {
                    if (xmlhttp.status == 401)GetIdentificationStatus();
                    if (typeof errorfn != 'undefined' && errorfn != null)errorfn(xmlhttp.status, xmlhttp.responseText);
            }
        }
    }
    //console.log(url);
    xmlhttp.open("POST", url, true);
    if (typeof progressfn !='undefined' && progressfn != null)xmlhttp.upload.addEventListener("progress", progressfn, false);
    xmlhttp.send(postdata);
}
