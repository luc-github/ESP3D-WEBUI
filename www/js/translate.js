var language = 'en';


var language_list = [
//removeIf(de_lang_disabled)
    ['de', 'Deutsch', 'germantrans'],
//endRemoveIf(de_lang_disabled)
//removeIf(en_lang_disabled)
    ['en', 'English', 'englishtrans'],
//endRemoveIf(en_lang_disabled)
//removeIf(es_lang_disabled)
    ['es', 'Espa&ntilde;ol', 'spanishtrans'],
//endRemoveIf(es_lang_disabled)
//removeIf(fr_lang_disabled)
    ['fr', 'Fran&ccedil;ais', 'frenchtrans'],
//endRemoveIf(fr_lang_disabled)
//removeIf(it_lang_disabled)
    ['it', 'Italiano', 'italiantrans'],
//endRemoveIf(it_lang_disabled)
//removeIf(ja_lang_disabled)
    ['ja', '&#26085;&#26412;&#35486;', 'japanesetrans'],
//endRemoveIf(ja_lang_disabled)
//removeIf(hu_lang_disabled)
    ['hu', 'Magyar', 'hungariantrans'],
//endRemoveIf(hu_lang_disabled)
//removeIf(pl_lang_disabled)
    ['pl', 'Polski', 'polishtrans'],
//endRemoveIf(pl_lang_disabled)
//removeIf(ptbr_lang_disabled)
    ['ptbr', 'Português-Br', 'ptbrtrans'],
//endRemoveIf(ptbr_lang_disabled)
//removeIf(ru_lang_disabled)
    ['ru', 'Русский', 'russiantrans'],
//endRemoveIf(ru_lang_disabled)
//removeIf(tr_lang_disabled)
    ['tr', 'T&uuml;rk&ccedil;e', 'turkishtrans'],
//endRemoveIf(tr_lang_disabled)
//removeIf(uk_lang_disabled)
    ['uk', 'Українська', 'ukrtrans'],
//endRemoveIf(uk_lang_disabled)
//removeIf(zh_cn_lang_disabled)
    ['zh_CN', '&#31616;&#20307;&#20013;&#25991;', 'zh_CN_trans'],
//endRemoveIf(zh_cn_lang_disabled)
//removeIf(zh_tw_lang_disabled)
    ['zh_TW', '&#32321;&#39636;&#20013;&#25991;;', 'zh_TW_trans'],
//endRemoveIf(zh_tw_lang_disabled)
];

//removeIf(production)
var translated_list = [];
//endRemoveIf(production)

function build_language_list(id_item) {
    var content = "<select class='form-control'  id='" + id_item + "' onchange='translate_text(this.value)'>\n";
    for (var lang_i = 0; lang_i < language_list.length; lang_i++) {
        content += "<option value='" + language_list[lang_i][0] + "'";
        if (language_list[lang_i][0] == language) content += " selected";
        content += ">" + language_list[lang_i][1] + "</option>\n";
    }
    content += "</select>\n";
    return content;
}

function translate_text(lang) {
    var currenttrans = {};
    var translated_content = "";
    language = lang;
    for (var lang_i = 0; lang_i < language_list.length; lang_i++) {
        if (language_list[lang_i][0] == lang) {
            currenttrans = eval(language_list[lang_i][2]);
        }
    }
    var All = document.getElementsByTagName('*');
    for (var i = 0; i < All.length; i++) {
        if (All[i].hasAttribute('translate')) {
            var content = "";
            if (!All[i].hasAttribute('english_content')) {
                content = All[i].innerHTML;
                content.trim();
                All[i].setAttribute('english_content', content);
                //removeIf(production)        
                var item = {
                    content: content
                };
                translated_list.push(item);
                //endRemoveIf(production)
            }
            content = All[i].getAttribute('english_content');
            translated_content = translate_text_item(content);

            All[i].innerHTML = translated_content;
        }
        //add support for placeholder attribut
        if (All[i].hasAttribute('translateph') && All[i].hasAttribute('placeholder')) {
            var content = "";
            if (!All[i].hasAttribute('english_content')) {
                content = All[i].getAttribute('placeholder');
                content.trim();
                //removeIf(production) 
                var item = {
                    content: content
                };
                translated_list.push(item);
                //endRemoveIf(production)
                All[i].setAttribute('english_content', content);
            }
            content = All[i].getAttribute('english_content');

            translated_content = decode_entitie(translate_text_item(content));
            All[i].setAttribute('placeholder', translated_content)
        }
    }
};

function translate_text_item(item_text, withtag) {
    var currenttrans = {};
    var translated_content;
    var with_tag = false;
    if (typeof withtag != "undefined") with_tag = withtag;
    for (var lang_i = 0; lang_i < language_list.length; lang_i++) {
        if (language_list[lang_i][0] == language) {
            currenttrans = eval(language_list[lang_i][2]);
        }
    }
    translated_content = currenttrans[item_text];
    if (typeof translated_content === 'undefined') translated_content = item_text;
    if (with_tag) {
        var translated_content_tmp = "<span english_content=\"" + item_text + "\" translate>" + translated_content + "</span>";
        translated_content = translated_content_tmp;
    }
    return translated_content;
}
