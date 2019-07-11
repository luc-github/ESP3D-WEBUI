//alert dialog
function alertdlg(titledlg, textdlg, closefunc) {
    var modal = setactiveModal('alertdlg.html', closefunc);
    if (modal == null) return;
    var title = modal.element.getElementsByClassName("modal-title")[0];
    var body = modal.element.getElementsByClassName("modal-text")[0];
    title.innerHTML = titledlg;
    body.innerHTML = textdlg;
    showModal();
}