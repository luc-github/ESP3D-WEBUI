function store_localdata(key, value) {

    if (typeof localStorage !== 'undefined') {
        try {
            localStorage.setItem(key, value);
        } catch (exception) {
            return false;
        }
        return true;
    }
    return false;
}

function get_localdata(key) {
    if (typeof localStorage !== 'undefined') {
        var r = "";
        try {
            r = localStorage.getItem(key);
        } catch (exception) {
            r = "";
        }
        return r;
    }
    return "";
}

function delete_localdata(key) {
    if (typeof localStorage !== 'undefined') {
        try {
            window.localStorage.removeItem(key);
        } catch (exception) {}
    }
}