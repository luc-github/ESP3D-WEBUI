//setup dialog
function setupdlg () {
    var modal = setactiveModal('setupdlg.html');
    if ( modal == null) return;
    showModal() ;
    //removeIf(production)

    return;
    //endRemoveIf(production)
    refreshsetup ();
}


function setupsuccess(response){
       // console.log(response);
		//removeIf(production)
		return;
		//endRemoveIf(production)
		closeModal("setupion successful");
        //setupfailed(500, "Wrong data")
}

function setupfailed(errorcode, response){
    //document.getElementById('setupbtn').style.display='block';
    //document.getElementById('failed_setup_msg').style.display='block';
    //document.getElementById('setuping_msg').style.display='none';
    console.log("Error " + errorcode + " : " + response);
}

function refreshsetup () {
    document.getElementById('refreshsetupbtn').style.display='none';
    //document.getElementById('failed_setup_msg').style.display='none';
    //document.getElementById('setuping_msg').style.display='block';
	// var url = "/command?plain="+encodeURIComponent("[ESP800]");;
    //SendGetHttp(url, setupsuccess, setupfailed)
}
