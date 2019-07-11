//login dialog
function logindlg(closefunc, check_first) {
    var modal = setactiveModal('logindlg.html', closefunc);
    var need_query_auth = false;
    if (modal == null) return;
    document.getElementById('login_title').innerHTML = translate_text_item("Identification requested");
    document.getElementById('login_loader').style.display = "none";
    document.getElementById('login_content').style.display = "block";
    if (typeof check_first !== 'undefined') need_query_auth = check_first;
    if (need_query_auth) {
        var url = "/login";
        SendGetHttp(url, checkloginsuccess);
    } else {
        showModal();
    }
}

function checkloginsuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') {
        if (response.authentication_lvl != "guest") {
            if (typeof(response.authentication_lvl) !== 'undefined') document.getElementById('current_auth_level').innerHTML = "(" + translate_text_item(response.authentication_lvl) + ")";
            if (typeof(response.user) !== 'undefined') document.getElementById('current_ID').innerHTML = response.user;
            closeModal('cancel');
        } else showModal();
    } else {
        showModal();
    }
}

function login_id_OnKeyUp(event) {
    //console.log(event.keyCode);
    if ((event.keyCode == 13)) document.getElementById('login_password_text').focus();
}

function login_password_OnKeyUp(event) {
    //console.log(event.keyCode);
    if ((event.keyCode == 13)) document.getElementById('login_submit_btn').click();
}


function loginfailed(errorcode, response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.status) !== 'undefined') document.getElementById('login_title').innerHTML = translate_text_item(response.status);
    else document.getElementById('login_title').innerHTML = translate_text_item("Identification invalid!");
    console.log("Error " + errorcode + " : " + response_text);
    document.getElementById('login_content').style.display = "block";
    document.getElementById('login_loader').style.display = "none";
    document.getElementById('current_ID').innerHTML = translate_text_item("guest");
    document.getElementById('logout_menu').style.display = "none";
    document.getElementById('logout_menu_divider').style.display = "none";
    document.getElementById("password_menu").style.display = "none";
}

function loginsuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') document.getElementById('current_auth_level').innerHTML = "(" + translate_text_item(response.authentication_lvl) + ")";
    document.getElementById('login_loader').style.display = "none";
    document.getElementById('logout_menu').style.display = "block";
    document.getElementById('logout_menu_divider').style.display = "block";
    document.getElementById("password_menu").style.display = "block";
    closeModal("Connection successful");
}

function SubmitLogin() {
    var user = document.getElementById('login_user_text').value.trim();
    var password = document.getElementById('login_password_text').value.trim();
    var url = "/login?USER=" + encodeURIComponent(user) + "&PASSWORD=" + encodeURIComponent(password) + "&SUBMIT=yes";
    document.getElementById('current_ID').innerHTML = user;
    document.getElementById('current_auth_level').innerHTML = "";
    document.getElementById('login_content').style.display = "none";
    document.getElementById('login_loader').style.display = "block";
    SendGetHttp(url, loginsuccess, loginfailed);
}

function GetIdentificationStatus() {
    var url = "/login";
    SendGetHttp(url, GetIdentificationStatusSuccess);
}

function GetIdentificationStatusSuccess(response_text) {
    var response = JSON.parse(response_text);
    if (typeof(response.authentication_lvl) !== 'undefined') {
        if (response.authentication_lvl == "guest") {
            document.getElementById('current_ID').innerHTML = translate_text_item("guest");
            document.getElementById('current_auth_level').innerHTML = "";
        }
    }
}

function DisconnectionSuccess(response_text) {
    document.getElementById('current_ID').innerHTML = translate_text_item("guest");
    document.getElementById('current_auth_level').innerHTML = "";
    document.getElementById('logout_menu').style.display = "none";
    document.getElementById('logout_menu_divider').style.display = "none";
    document.getElementById("password_menu").style.display = "none";
}

function DisconnectionFailed(errorcode, response) {
    document.getElementById('current_ID').innerHTML = translate_text_item("guest");
    document.getElementById('current_auth_level').innerHTML = "";
    document.getElementById('logout_menu').style.display = "none";
    document.getElementById('logout_menu_divider').style.display = "none";
    document.getElementById("password_menu").style.display = "none";
    console.log("Error " + errorcode + " : " + response);
}

function DisconnectLogin(answer) {
    if (answer == "yes") {
        var url = "/login?DISCONNECT=yes";
        SendGetHttp(url, DisconnectionSuccess, DisconnectionFailed);
    }
}