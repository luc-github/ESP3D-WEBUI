function store_localdata(key, value){
    if (typeof localStorage !== 'undefined'){
        localStorage.setItem(key, value);
        return true;
    }
    return false;
}

function get_localdata(key){
     if (typeof localStorage !== 'undefined'){
        return localStorage.getItem(key);
    }
    return "";
}

function delete_localdata(key){
     if (typeof localStorage !== 'undefined')window.localStorage.removeItem(key);
}
