// ==UserScript==
// @name         Fiche de héros
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Générateur de fiche de héros
// @author       Frei
// @match        *allerand.world-of-dungeons.fr/wod/spiel/forum/viewtopic.php*
// @grant        none
// ==/UserScript==

//-----------Variables----------------
var box = [];
var msgBox = [];
var tableAttributs = "";
var tableAtt = "";
var tableTalents = "";
var tableHeros = "";
var tableauCouleurs = ["[color=#FF05E6]▮[/color]", "[color=#F205E4]▮[/color]", "[color=#E505E2]▮[/color]", "[color=#D905E0]▮[/color]", "[color=#CC06DE]▮[/color]", "[color=#C006DC]▮[/color]", "[color=#B306DA]▮[/color]", "[color=#A706D8]▮[/color]", "[color=#9A07D6]▮[/color]", "[color=#8E07D4]▮[/color]", "[color=#8107D2]▮[/color]", "[color=#7407D0]▮[/color]", "[color=#6808CE]▮[/color]", "[color=#5B08CC]▮[/color]", "[color=#4F08CA]▮[/color]", "[color=#4208C8]▮[/color]", "[color=#3609C6]▮[/color]", "[color=#2909C4]▮[/color]", "[color=#1D09C2]▮[/color]", "[color=#1009C0]▮[/color]"];
var tableauDeuxCouleurs = ["[color=#CF0000]▮[/color]", "[color=#BA5301]▮[/color]", "[color=#A6A602]▮[/color]", "[color=#53A401]▮[/color]", "[color=#00A300]▮[/color]"];

var tableEquipement = "";
var tableSac = "";
var message = "";
var DEBUG = true;
var VER = "1.10";
var LOCAL_VAR_NAME = "WOD ARMOR STATS " + location.host;

var Equipment = false;
var Result = false;
var Attribs = false;
var Level = false;
var Effect = false;
var DamageTaken = false;
var Defense = false;
var Damage = false;
var Attack = false;

var HeroLevel;

var KeyButton = null;

var EVAL_IS_BAD__AVOID_THIS = eval;

var MandatoryProps = {};
//variable héros
var raceH = "";
var classeH = "";
var niveauH = "";
var legendeH = "";
var gloireH = "";
var avatar = "";
var nomH = "";
var classeRef = "";
var raceRef = "";

//variables langues
var Contents = {
    "fr": {
        Button_Name: "Calculer les stats",
        Title: "<h1>Stats d'équipement supplémentaires.</h1>Derniere mise a jour ",
        Fetch_Hero: "Recherche du héros",
        Fetch_Clan: "Recherche du clan",
        Fetch_Equipment: "Recherche de l'équipement",
        Fetch_Info: "Recherche des infos",
        Armor_Bonus: "Bonus d'armure",
        Attr_Bonus: "Bonus sur les particularités",
        Level_Bonus: "Bonus sur le rang de talents",
        Effect_Bonus: "Bonus sur l'effet de talents",
        Damage_Taken: "Bonus sur la sensibilité aux dégâts",
        Defense_Bonus: "Bonus sur les parades",
        Damage_Bonus: "Bonus sur les dégâts",
        Damage_BonusR: "Bonus de dégâts (r)",
        Attack_Bonus: "Bonus sur les attaques",
        Dungeon_Bonus: "Bonus de combat en donjon",
        Item: "Objet",
        Attribute: "Particularité",
        Skill: "Talent",
        Modifier: "Modificateur",
        Value: "Valeur",
        Used_With: " (a)",
        Dmg_With: " (z)",
        Per: "%",
        HL_Per: "% du niveau du héros",
        HL: "du niveau du héros",
        Mult: " x ",
        Attack_Type: "Sorte d'attaque",
        Dmg_Split: " / ",
        Damage_Type: "Sorte de dégâts",
        BonusR: "Bonus (r)",
        Owner_Effect: "Effets sur le propriétaire de l'objet",
        Race_Name: "Peuple",
        Level: "Niveau",
        Adv_Disadv: "Avantages et inconvénients",
        Monument: "monument",
        Clan_Has_Monument: "Le clan possede le monument",
        Link: "Lien ...",
        Item_Skill: "uniquement quand l'objet est utilisé en combination avec l'un des talents indiqués ci-dessus",
        Effect_BonusTalent: "Le bonus sur l'Effet n'augmente pas le Rang du talent.[br]Au lieu de ça, les bonus sont ajoutés aux dommages (pour le type 'Attaques') ou aux soins (pour le type 'Guérison').",
        Damage_Added: "Supplémentaire - uniquement quand des dégâts de ce genre sont causés",
        Damage_Effect: "lors de coups normaux / complets / critiques, est ajouté a l'effet de l'arme utilisée.",
        Rounding: Math.round,
        All_Hits: "lors de succès normaux / complets / critiques"
    }
};



//-----------Lancement du programme---
try {
    addButtonFiche();
} catch (e) {
}

//-----------Fonctions----------------

//Ajout du bouton dans l'encart des nouveaux messages en bas des pages du forum
function addButtonFiche() {
    box = document.getElementsByClassName("boardcon2 boardoption");
    var h = document.createElement("input");

    var newLabel = document.createElement("a");
    newLabel.innerHTML = "";
    newLabel.id = 'status';
    h.type = 'button';
    h.name = 'generateFiche';
    h.value = "Générer ma fiche";
    h.id = 'button_fiche';

    h.onclick = function () {
        addMessage();
    };

    box[0].appendChild(h);
    box[0].appendChild(newLabel);

}

//Ajout du message dans le champ de saisie du message
function addMessage() {
    msgBox = document.getElementsByName("req_message");
    getExtraStat();
}



String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function (prefix) {
    return this.indexOf(prefix) === 0;
};

String.prototype.removeRight = function (suffix) {
    if (!this.endsWith(suffix))
        return String(this);
    return String(this).substring(0, this.length - suffix.length);
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.space_clear = function () {
    var tmp = this;
    while (tmp.indexOf("  ") !== - 1)
        tmp = tmp.replace("  ", "");
    return tmp;
};

function isFunctionDefined(name) {
    return EVAL_IS_BAD__AVOID_THIS("typeof " + name + " == 'function'");
}

function supportsLocalStorage() {
    try {
        return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
        return false;
    }
}

function stringify(data) {
    if (typeof JSON === "object" && typeof (JSON.stringify) === "function")
        return JSON.stringify(data);
    else
        return data.toSource();
}

function parse(data) {
    if (typeof JSON === "object" && typeof (JSON.parse) === "function")
        return JSON.parse(data);
    else
        return EVAL_IS_BAD__AVOID_THIS(data);
}

function DebugMsg(Data)
{
    if (DEBUG)
        alert(JSON.stringify(Data, null, 4));
}

function SetStatus(text)
{
    document.getElementById('status').innerHTML = text;
}

function trim(data)
{
    // Use ECMA-262 Edition 3 String and RegExp features
    data = data.replace(/[\t\n\r ]+/g, " ");
    if (data.charAt(0) === " ")
        data = data.substring(1, data.length);
    if (data.charAt(data.length - 1) === " ")
        data = data.substring(0, data.length - 1);
    return data;
}



// FUNCTIONS //////////////////////////////////////////////////////////////////

function getExtraStat()
{
    // Language selection
    if (GetLocalContents() === null)
        return;

    MandatoryProps[Contents.Attr_Bonus] = [Contents.Attribute, Contents.Modifier];
    MandatoryProps[Contents.Level_Bonus] = [Contents.Skill, Contents.Modifier];
    MandatoryProps[Contents.Effect_Bonus] = [Contents.Skill, Contents.Modifier];
    MandatoryProps[Contents.Damage_Taken] = [Contents.Attack_Type, Contents.BonusR, Contents.Damage_Type];
    MandatoryProps[Contents.Attack_Bonus] = [Contents.Attack_Type, Contents.Modifier];
    MandatoryProps[Contents.Damage_Bonus] = [Contents.Attack_Type, Contents.Damage_BonusR, Contents.Damage_Type];
    MandatoryProps[Contents.Defense_Bonus] = [Contents.Attack_Type, Contents.Modifier];
    MandatoryProps[Contents.Armor_Bonus] = [];
    MandatoryProps[Contents.Dungeon_Bonus] = [];

    OnCountStat();
}



// Choose contents of the corresponding language
// Contents: { "lang1": { "Name1": "Value1", ..., "NameN": "ValueN" }, ..., "langN": { ... } ... }
// return: Local contents, or null
// It will edit the input contents directly, so the returned object is not necessary
function GetLocalContents()
{
    function GetLanguage()
    {
        var langText = null;
        var allMetas = document.getElementsByTagName("meta");
        for (var i = 0; i < allMetas.length; ++i)
        {
            if (allMetas[i].httpEquiv === "Content-Language")
            {
                langText = allMetas[i].content;
                break;
            }
        }
        return langText;
    }

    var lang = GetLanguage();
    if (lang === null)
        return null;

    if (Contents instanceof Object)
    {
        Contents = Contents[lang];
        return Contents;
    } else
        return null;
}

function Value(abs, per, hlper)
{
    if (!abs)
        abs = 0;
    if (!per)
        per = 0;
    if (!hlper)
        hlper = 0;

    this.abs = abs;
    this.per = per;
    this.hlper = hlper;
}

Value.Parse = function (text)
{
    if (!text || text.trim().length === 0)
        text = "";

    var hl = text.replace(Contents.Mult + Contents.HL, "00" + Contents.HL_Per);
    hl = hl.replace("+ " + Contents.HL, "+100" + Contents.HL_Per);
    hl = hl.replace("+" + Contents.HL, "+100" + Contents.HL_Per);
    hl = hl.replace("- " + Contents.HL, "-100" + Contents.HL_Per);
    hl = hl.replace("-" + Contents.HL, "-100" + Contents.HL_Per);
    hl = hl.replace(Contents.HL_Per, "HL");

    var abs = 0;
    var per = 0;
    var hlper = 0;

    var arr = hl.split(" ");
    var txt = "";
    for (var j = 0; j < arr.length; ++j) {
        if (arr[j].endsWith(Contents.Per))
            per = (arr[j].removeRight(Contents.Per) * 1);
        else if (arr[j].endsWith("HL"))
            hlper = (arr[j].removeRight("HL") * 1);
        else
            abs = arr[j] * 1;
    }

    return new Value(abs, per, hlper);
};

Value.prototype.Add = function (RightVal)
{
    return new Value(this.abs + RightVal.abs, this.per + RightVal.per, this.hlper + RightVal.hlper);
};

Value.prototype.Mult = function (rhs)
{
    return new Value(this.abs * rhs, this.per * rhs, this.hlper * rhs);
};

Value.prototype.Html = function (negative)
{
    var txt = "";
    if (negative === undefined)
        negative = false;
    var mult = (negative ? -1 : 1);

    if (this.abs !== 0) {
        txt += "[color=" + (this.abs * mult > 0 ? "green" : "red") + "]" + (this.abs > 0 ? "+" + this.abs : this.abs) + "[/color] ";
    }

    if (this.per !== 0) {
        txt += "[color=" + (this.per * mult > 0 ? "green" : "red") + "]" + (this.per > 0 ? "+" + this.per/*.toFixed(2)*/ : this.per/*.toFixed(2)*/) + Contents.Per + "[/color] ";
    }

    if (this.hlper !== 0) {
        if (Math.abs(this.hlper) === 100) {
            txt += "[color=" + (this.hlper * mult > 0 ? "green" : "red") + "]" + (this.hlper > 0 ? "+" : "-") + Contents.HL + "[/color] ";
        } else if (Math.abs(this.hlper) % 100 === 0) {
            txt += "[color=" + (this.hlper * mult > 0 ? "green" : "red") + "]" + (this.hlper > 0 ? "+" : "") + Math.round(this.hlper / 100) + Contents.Mult + Contents.HL + "[/color] ";
        } else {
            txt += "[color=" + (this.hlper * mult > 0 ? "green" : "red") + "]" + (this.hlper > 0 ? "+" : "") + this.hlper + Contents.HL_Per + "[/color] ";
        }
    }

    if (txt.length === 0)
        txt = "0";

    return txt.trim();
};

Value.prototype.Calc = function (hero_level)
{
    return new Value(Contents.Rounding(this.abs + hero_level * this.hlper / 100), this.per, 0);
};

function Dmg(normal, good, critical)
{
    if (!normal)
        normal = new Value();
    if (!good)
        good = new Value();
    if (!critical)
        critical = new Value();

    this.normal = normal;
    this.good = good;
    this.critical = critical;
}

Dmg.Parse = function (text)
{
    if (!text || text.trim().length === 0) {
        return new Dmg();
    }

    var arr = text.split(Contents.Dmg_Split);
    return new Dmg(Value.Parse(arr[0]), Value.Parse(arr[1]), Value.Parse(arr[2]));
};

Dmg.prototype.Add = function (RightVal)
{
    return new Dmg(this.normal.Add(RightVal.normal), this.good.Add(RightVal.good), this.critical.Add(RightVal.critical));
};

Dmg.prototype.Mult = function (rhs)
{
    return new Dmg(this.normal.Mult(rhs), this.good.Mult(rhs), this.critical.Mult(rhs));
};

Dmg.prototype.Html = function (negative)
{
    return this.normal.Html(negative) + Contents.Dmg_Split + this.good.Html(negative) + Contents.Dmg_Split + this.critical.Html(negative);
};

Dmg.prototype.Calc = function (hero_level)
{
    return new Dmg(this.normal.Calc(hero_level), this.good.Calc(hero_level), this.critical.Calc(hero_level));
};

function OnCountStat()
{
    try {

        Result.innerHTML = "";
        Attribs = {};
        Level = {};
        Effect = {};
        DamageTaken = {};
        Defense = {};
        Damage = {};
        Attack = {};
        Equipment = [];

        var nHeroId = GetHiddenInfo(document, "session_hero_id", "");
        var nPlayerId = GetHiddenInfo(document, "session_player_id", "");

        nomH = GetHiddenInfo(document, "heldenname", "");

        GetHeroInfo(nHeroId, nPlayerId);
        GetAttributs(nHeroId);
        GetTalents(nHeroId);

    } catch (e) {
        alert("OnCountStat(): " + e);
    }
}

function GetHeroInfo(heroID, playerID)
{
    var XmlHttp = new XMLHttpRequest();

    XmlHttp.onreadystatechange = function ()
    {
        try {
            if (XmlHttp.readyState === 4 && XmlHttp.status === 200)
            {
                var Page = document.createElement("div");
                Page.innerHTML = XmlHttp.responseText;
                ReadHeroInfo(Page);
                GetClanInfo(heroID, playerID);
            }
        } catch (e) {
            alert("XMLHttpRequest.onreadystatechange(): " + e);
        }
    };

    var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/profile.php?id=" + heroID + "&session_hero_id=" + heroID + "&IS_POPUP=1";

    SetStatus("Récupération des informations du héros");

    XmlHttp.open("GET", URL, true);
    XmlHttp.send(null);
}

function ReadHeroInfo(Document)
{
    SetStatus("Lecture des informations du héros");
    var allTD = Document.getElementsByTagName("td");
    var url = "";
    for (var i = 0; i < allTD.length - 1; ++i)
    {
        if (allTD[i].innerHTML === Contents.Race_Name) {
            var tmpName = allTD[i + 1].textContent.trim().removeRight("*");
            raceH = allTD[i + 1].textContent.trim().split("*")[0].trim();
            raceRef = allTD[i + 1].getElementsByTagName("a")[0].getAttribute("href").split("&")[0].trim();
            var allA = allTD[i + 1].getElementsByTagName("a");
            if (allA.length === 1) {
                var href = allA[0].getAttribute("href");
                Equipment.push({id: 0, name: tmpName, link: href, count: 1, okH2: Contents.Adv_Disadv});
            } else {
                alert("ReadHeroInfo failed " + allA.length);
            }
        } else if (allTD[i].innerHTML === Contents.Level) {
            niveauH = allTD[i + 1].textContent.trim();
            HeroLevel = allTD[i + 1].textContent.trim();
        } else if (allTD[i].innerHTML === "Status de légende") {
            legendeH = allTD[i + 1].textContent.trim();
        } else if (allTD[i].innerHTML === "Classe") {
            classeH = allTD[i + 1].getElementsByTagName("a")[0].textContent.split("*")[0].trim();
            classeRef = 'http://allerand.world-of-dungeons.fr' + allTD[i + 1].getElementsByTagName("a")[0].getAttribute("href").split("&")[0].trim();
        } else if (allTD[i].innerHTML.indexOf("Gloire") !== -1) {
            gloireH = allTD[i + 1].textContent.trim();
        }
    }
    var img = Document.getElementsByClassName("boardavatar");
    var nom = Document.getElementsByClassName("changeHeroLink");
    avatar = img[0].getAttribute("src");
    //nomH = nom[0].textContent.trim();

}

function GetClanInfo(heroID, playerID) {
    var XmlHttp = new XMLHttpRequest();

    XmlHttp.onreadystatechange = function ()
    {
        try {
            if (XmlHttp.readyState === 4 && XmlHttp.status === 200)
            {
                var Page = document.createElement("div");
                Page.innerHTML = XmlHttp.responseText;
                ReadClanInfo(Page);
                GetEquipment(heroID, playerID);
            }
        } catch (e) {
            alert("XMLHttpRequest.onreadystatechange(): " + e);
        }
    };

    var URL = location.protocol + "//" + location.host + "/wod/spiel/clan/clan.php?session_hero_id=" + heroID + "&IS_POPUP=1";

    SetStatus("Récupération des informations du clan");

    XmlHttp.open("GET", URL, true);
    XmlHttp.send(null);
}

function ReadClanInfo(Document)
{
    var allH2 = Document.getElementsByTagName("h2");
    for (var j = 0; j < allH2.length; ++j) {
        if (trim(allH2[j].textContent) !== Contents.Monument)
            continue;

        var firstSibling = allH2[j].nextSibling;
        var nextSibling = firstSibling.nextSibling;

        if (firstSibling.nodeName === "#text" && nextSibling.nodeName === "A" && trim(firstSibling.textContent) === Contents.Clan_Has_Monument) {
            Equipment.push({id: 0, name: nextSibling.textContent, link: nextSibling.getAttribute("href"), count: 1, okH2: undefined});
        }
    }
    SetStatus("Lecture des informations du clan");
}

function GetHiddenInfo(Document, InfoName, DefaultValue)
{
    var allInputs = Document.getElementsByTagName("input");
    for (var i = 0; i < allInputs.length; ++i)
    {
        if (allInputs[i].getAttribute("type") === "hidden" &&
            allInputs[i].name === InfoName)
            return allInputs[i].value;
    }
    return DefaultValue;
}

function GetEquipment(heroID, playerID)
{
    var XmlHttp = new XMLHttpRequest();

    XmlHttp.onreadystatechange = function ()
    {
        try {
            if (XmlHttp.readyState === 4 && XmlHttp.status === 200)
            {
                var Page = document.createElement("div");
                Page.innerHTML = XmlHttp.responseText;
                ReadEquipment(Page, heroID, playerID);
                GetItem(0, heroID, playerID);
            }
        } catch (e) {
            alert("XMLHttpRequest.onreadystatechange(): " + e);
        }
    };

    var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/items.php" +
        "?view=gear" +
        "&session_hero_id=" + heroID;

    SetStatus("Récupération de l'équipement");

    XmlHttp.open("GET", URL, true);
    XmlHttp.send(null);
}

function GetAttributs(heroID)
{
    var XmlHttp = new XMLHttpRequest();

    XmlHttp.onreadystatechange = function ()
    {
        try {
            if (XmlHttp.readyState === 4 && XmlHttp.status === 200)
            {
                var Page = document.createElement("div");
                Page.innerHTML = XmlHttp.responseText;
                readAttributs(Page);
            }
        } catch (e) {
            alert("XMLHttpRequest.onreadystatechange(): " + e);
        }
    };

    var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/attributes.php?session_hero_id=" + heroID;

    SetStatus("Récupération des attributs");

    XmlHttp.open("GET", URL, true);
    XmlHttp.send(null);
}

function GetTalents(heroID)
{
    var XmlHttp = new XMLHttpRequest();

    XmlHttp.onreadystatechange = function ()
    {
        try {
            if (XmlHttp.readyState === 4 && XmlHttp.status === 200)
            {
                var Page = document.createElement("div");
                Page.innerHTML = XmlHttp.responseText;
                readTalents(Page);
            }
        } catch (e) {
            alert("XMLHttpRequest.onreadystatechange(): " + e);
        }
    };

    var URL = location.protocol + "//" + location.host + "/wod/spiel/hero/skills.php?session_hero_id=" + heroID;

    SetStatus("Récupération des talents");

    XmlHttp.open("GET", URL, true);
    XmlHttp.send(null);
}

function readTalents(Document) {
    SetStatus("Lecture des talents");
    tableTalents += '[table]';
    var allTalents = Document.getElementsByClassName("content_table");

    var ligneTalents = allTalents[0].getElementsByTagName("tr");

    for (var i = 0; i < ligneTalents.length; ++i) {
        if (ligneTalents[i].getAttribute("class") !== "header") {
            var nomTal = "";
            var iniTal = "";
            var augTal = "-";

            try {
                nomTal = ligneTalents[i].getElementsByTagName("a")[0].textContent.trim();
                iniTal = ligneTalents[i].getElementsByTagName("div")[0].textContent.trim();
                augTal = ligneTalents[i].getElementsByTagName("span")[0].textContent.trim().replace("[", "").replace("]", "");
            } catch (e) {
            }
            if (nomTal !== "" && iniTal !== "-") {

                //faire la ligne
                if (augTal === "-") {
                    augTal = iniTal;
                }
                var txt = '[tr][td][skill: ' + nomTal + '][/td][td]' + makeGaugeDeux(augTal) + '[/td][td]' + iniTal + "/" + augTal + '[/td][/tr]';
                tableTalents += txt;
            }
        }
    }
    tableTalents += '[/table]';
    //msgBox[0].value += tableTalents;
}


function readAttributs(Document) {
    SetStatus("Lecture des attributs");
    tableAtt += '[table]';
    tableAttributs += '[table]';
    var allAttributs = Document.getElementsByClassName("content_table");
    //lecture de chaque table
    for (var i = 0; i < allAttributs.length; ++i)
    {
        var ligneTable = allAttributs[i].getElementsByTagName("tr");
        //lecture de chaque ligne de la table
        
        for (var l = 0; l < ligneTable.length; ++l)
        {
            if (ligneTable[l].getAttribute("class") !== "header") {
                var attrib = ligneTable[l].getElementsByTagName("span");
                for (var a = 0; a < attrib.length; ++a)
                {
                    //les conditions pour la table attributs 1ere partie
                    if (attrib[a].innerHTML.indexOf("Force") !== -1 || attrib[a].innerHTML.indexOf("Constitution") !== -1 || attrib[a].innerHTML.indexOf("Intelligence") !== -1 || attrib[a].innerHTML.indexOf("Adresse") !== -1 || attrib[a].innerHTML.indexOf("Charisme") !== -1 || attrib[a].innerHTML.indexOf("Vitesse") !== -1 || attrib[a].innerHTML.indexOf("Perception") !== -1 || attrib[a].innerHTML.indexOf("Volonté") !== -1) {
                        createLigne(ligneTable[l]);
                    }
                    if (attrib[a].innerHTML.indexOf("Régén. PV") !== -1) {
                        var valRegPVini = ligneTable[l].getElementsByTagName("td")[2].textContent.trim().match("([0-9]+)")[0];
                        var valRegPVaug = "-";
                        var attribRegPV = ligneTable[l].getElementsByTagName("span")[2].textContent.trim();
                        try {
                            valRegPVaug = ligneTable[l].getElementsByTagName("td")[2].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                        } catch (e) {
                        }
                        tableAtt += getLigne(attribRegPV, valRegPVini, valRegPVaug);

                        getLigne(attribRegPV, valRegPVini, valRegPVaug);
                        var valPVini = ligneTable[l].getElementsByTagName("td")[1].textContent.trim().match("([0-9]+)")[0];
                        var valPVaug = "-";
                        var attribPV = ligneTable[l].getElementsByTagName("span")[0].textContent.trim();
                        try {
                            valPVaug = ligneTable[l].getElementsByTagName("span")[1].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                        } catch (e) {
                        }
                        tableAtt += getLigne(attribPV, valPVini, valPVaug);
                    }
                    if (attrib[a].innerHTML.indexOf("Régén. PM") !== -1) {
                        var valRegPMini = ligneTable[l].getElementsByTagName("td")[2].textContent.trim().match("([0-9]+)")[0];
                        var valRegPMaug = "-";
                        var attribRegPM = ligneTable[l].getElementsByTagName("span")[2].textContent.trim();
                        try {
                            valRegPMaug = ligneTable[l].getElementsByTagName("td")[2].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                        } catch (e) {
                        }
                        tableAtt += getLigne(attribRegPM, valRegPMini, valRegPMaug);

                        var valPMini = ligneTable[l].getElementsByTagName("td")[1].textContent.trim().match("([0-9]+)")[0];
                        var valPMaug = "-";
                        var attribPM = ligneTable[l].getElementsByTagName("span")[0].textContent.trim();
                        try {
                            valPMaug = ligneTable[l].getElementsByTagName("span")[1].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                        } catch (e) {
                        }
                        tableAtt += getLigne(attribPM, valPMini, valPMaug);
                    }
                    if (attrib[a].innerHTML.indexOf("Actions") !== -1) {
                        var valAcini = ligneTable[l].getElementsByTagName("td")[1].textContent.trim().match("([0-9]+)")[0];
                        var valAcaug = "-";
                        var attribAc = ligneTable[l].getElementsByTagName("span")[0].textContent.trim();
                        try {
                            valAcaug = ligneTable[l].getElementsByTagName("td")[1].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                        } catch (e) {
                        }
                        tableAtt += getLigne(attribAc, valAcini, valAcaug);
                    }
                    if (attrib[a].innerHTML.indexOf("Bonus en initiative ") !== -1) {
                        var valInini = ligneTable[l].getElementsByTagName("td")[1].textContent.trim().match("([0-9]+)")[0];
                        var valInaug = "-";
                        var attribIn = ligneTable[l].getElementsByTagName("span")[0].textContent.trim();
                        try {
                            valInaug = ligneTable[l].getElementsByTagName("td")[1].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                        } catch (e) {
                        }
                        tableAtt += getLigne(attribIn, valInini, valInaug);
                    }
                }
            }

        }
    }
    tableAtt += '[/table]';
    tableAttributs += '[/table]';
    //fabriquer la table attributs

    //msgBox[0].value += tableAttributs + tableAtt;
}

function getLigne(att, iniVal, augVal) {
    var li = '[tr][td]' + att + '[/td][td]' + iniVal + "/" + augVal + '[/td][/tr]';
    return li;
}

function createLigne(inputLine) {
    var aTraiter = inputLine.getElementsByTagName("tbody")[0].getElementsByTagName("td");
    for (var l = 0; l < aTraiter.length; ++l)
    {
        if (aTraiter[l].getAttribute("align") === "right") {
            if (aTraiter[l].textContent.trim() !== "") {
                var valeurNative;
                var valeurFinale;
                try {
                    valeurNative = aTraiter[l].textContent.trim().match("([0-9]+)")[0];
                } catch (e) {
                }
                try {
                    valeurFinale = aTraiter[l].textContent.trim().match("(\[[0-9]+\])")[0].replace("[", "").replace("]", "");
                } catch (e) {
                    valeurFinale = valeurNative;
                }
                var txt = '[tr][td]' + inputLine.getElementsByTagName("span")[0].textContent.trim() + '[/td][td]' + makeGauge(valeurFinale) + '[/td][td]' + valeurNative + "/" + valeurFinale + '[/td][/tr]';
                tableAttributs += txt;
            }
        }
    }
}

function makeGauge(valeur) {
    sub = cleanInt(valeur / 2);
    var valMax = 20;
    var jauge = "";
    for (var l = 0; l < valMax; ++l) {
        if (l <= sub) {
            jauge += tableauCouleurs[l];
        } else {
            jauge += '▯';
        }
    }
    return jauge;
}

function makeGaugeDeux(valeur) {
    sub = cleanInt(valeur / 10);
    var valMax = 5;
    var jauge = "";
    for (var l = 0; l < valMax; ++l) {
        if (l <= sub) {
            jauge += tableauDeuxCouleurs[l];
        } else {
            jauge += '▯';
        }
    }
    return jauge;
}

function cleanInt(x) {
    x = +x; // x = Number(x);
    return isNaN(x) ? x : (x | 0);
}

function ReadEquipment(Document, heroID, playerID)
{
    SetStatus("Lecture des équipements");
    var allForms = Document.getElementsByTagName("form");

    for (var i = 0; i < allForms.length; ++i)
    {
        if (allForms[i].getAttribute("name") === "the_form") {
            var allTDs = allForms[i].getElementsByTagName("td");
            var allEquip = allForms[i].getElementsByTagName("tr");

            tableEquipement += '[table]';
            tableSac += '[table]';
            for (var ez = 0; ez < allEquip.length; ++ez) {
                // var ligneEquip = allEquip[ez].getElementsByTagName("td");

                if (allEquip[ez].getElementsByTagName("td").length == 2 && allEquip[ez].getAttribute("class") == null) {


                    try {
                        var placeItem = "";
                        var nomItem = "";
                        var imgItem = "";
                        var affItem = "";
                        var idItem = "";

                        placeItem = allEquip[ez].getElementsByTagName("td")[0].innerHTML.trim();
                        var allImg = allEquip[ez].getElementsByTagName("td")[1].getElementsByTagName("img");

                        imgItem = 'http://allerand.world-of-dungeons.fr' + allImg[0].getAttribute("src");

                        try {
                            for (var im = 1; im < allImg.length; ++im) {
                                affItem += '[img]http://allerand.world-of-dungeons.fr' + allImg[im].getAttribute("src") + '[/img]';
                            }
                        } catch (e) {
                        }

                        var nomItemS = allEquip[ez].getElementsByTagName("td")[1].getElementsByTagName("select")[0].getElementsByTagName("option");
                        for (var ezs = 0; ezs < nomItemS.length; ++ezs) {
                            if (nomItemS[ezs].getAttribute("value") == 0) {
                            nomItem = nomItemS[ezs].innerHTML.replace("!", "").trim();
                            }
                        }

                        idItem = allEquip[ez].getElementsByTagName("td")[1].getElementsByTagName("input")[1].getAttribute("value");
                    } catch (e) {
                    }

                    if (placeItem !== "" && nomItem !== "") {
                        if (/^sac /.test(placeItem)) {
                            //tableSac += '[tr][td]' + placeItem + '[/td][td][img]' + imgItem + '[/img][item: ' + nomItem + ']' + ' ' + affItem + '[/td][/tr]';
                            tableSac += '[tr][td]' + placeItem + '[/td][td][img]' + imgItem + '[/img][url=http://allerand.world-of-dungeons.fr/wod/spiel/hero/item.php?item_instance_id='+idItem+']' + nomItem + '[/url]' + ' ' + affItem + '[/td][/tr]';
                        } else {
                            //tableEquipement += '[tr][td]' + placeItem + '[/td][td][img]' + imgItem + '[/img][item: ' + nomItem + ']' + ' ' + affItem + '[/td][/tr]';
                            tableEquipement += '[tr][td]' + placeItem + '[/td][td][img]' + imgItem + '[/img][url=http://allerand.world-of-dungeons.fr/wod/spiel/hero/item.php?item_instance_id='+idItem+']' + nomItem + '[/url]' + ' ' + affItem + '[/td][/tr]';
                        }

                    }
                }
            }

            tableEquipement += '[/table]';
            tableSac += '[/table]';

            for (var k = 0; k < allTDs.length; ++k) {
                var allOptions = allTDs[k].getElementsByTagName("option");
                var allTable = allTDs[k].getElementsByTagName("table");
                if (allTable.length > 0 || allOptions.length === 0)
                    continue;
                var lastID = undefined;
                var lastName = undefined;
                for (var j = 0; j < allOptions.length; ++j)
                {
                    var tmpId = allOptions[j].getAttribute("value") * -1;
                    if (tmpId > 0)
                        lastID = tmpId;
                    if (tmpId === 0) {
                        var tmpName = allOptions[j].innerHTML;
                        if (tmpName.charAt(tmpName.length - 1) === "!")
                            tmpName = tmpName.substr(0, tmpName.length - 1);
                        lastName = tmpName;
                    }
                }
                if (lastID !== undefined && lastName !== undefined) {
                    if (/[^\(]*\([0-9]*\/[0-9]*\)/.test(lastName)) {
                        lastName = lastName.replace(/\([0-9]*\/[0-9]*\)/g, "");
                    }
                    if (lastName.startsWith("!! "))
                        lastName = lastName.substring(3);

                    var found = false;
                    for (var z = 0; z < Equipment.length; ++z) {
                        if (Equipment[z].name === lastName) {
                            Equipment[z].count++;
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                        Equipment.push({id: lastID, name: lastName, link: "/wod/spiel/hero/item.php?item_instance_id=" + lastID + "&session_hero_id=" + heroID + "&session_player_id=" + playerID + "&is_popup=1", count: 1, okH2: Contents.Owner_Effect});
                }
            }
        }
    }
}

function GetItem(index, heroID, playerID)
{
    if (index === Equipment.length) {
        DisplayResult(heroID);
        return;
    }

    var XmlHttp = new XMLHttpRequest();

    XmlHttp.onreadystatechange = function ()
    {
        try {
            if (XmlHttp.readyState === 4 && XmlHttp.status === 200)
            {
                var Page = document.createElement("div");
                Page.innerHTML = XmlHttp.responseText;
                ParseItem(index, Page);
                GetItem(index + 1, heroID, playerID);
            }
        } catch (e) {
            alert("XMLHttpRequest.onreadystatechange(): " + e);
        }
    };

    var URL = location.protocol + "//" + location.host + Equipment[index].link;

    SetStatus("Récupération de :" + Equipment[index].name);
    // SetStatus(Contents.Fetch_Info, index + 1, Equipment.length, Equipment[index].name);

    XmlHttp.open("GET", URL, true);
    XmlHttp.send(null);
}

function CheckProperties(name, data, props) {
    var ret = true;

    for (var j = 0; j > props.length; ++j) {
        if (!data.hasOwnProperty(props[j])) {
            alert("Missing field + " + name + " - " + props[j]);
            ret = false;
        }
    }

    return ret;
}

function PushWithCreateSubarrays(data, names, value) {
    for (var j = 0; j < names.length; ++j) {
        if (!data.hasOwnProperty(names[j])) {
            if (j !== names.length - 1) {
                data[names[j]] = {};
            } else {
                data[names[j]] = [];
            }
        }
        data = data[names[j]];
    }
    data.push(value);
}

function ParseItem(index, Document) {
    var allChildren;
    var okH2 = Equipment[index].okH2;

    if (okH2 !== undefined) {
        var allH2 = Document.getElementsByTagName("h2");
        for (var i = 0; i < allH2.length; ++i) {
            if (allH2[i].textContent === okH2) {
                allChildren = allH2[i].parentNode.childNodes;
                break;
            }
        }
    } else {
        allChildren = Document.getElementsByTagName("form")[0].childNodes;
    }

    if (allChildren !== undefined) {
        var ok = (okH2 === undefined);
        for (var j = 0; j < allChildren.length - 2; ++j) {
            if (allChildren[j].nodeName === "H2") {
                var tmpH2 = trim(allChildren[j].textContent);
                if (tmpH2.length > 0 && okH2 !== undefined) {
                    ok = (tmpH2 === okH2);
                }
            } else if (ok && allChildren[j].nodeName === "H3" && (allChildren[j + 2].nodeName === "TABLE" || allChildren[j + 2].nodeName === "P" && allChildren[j + 3].nodeName === "#text" && allChildren[j + 4].nodeName === "TABLE")) {
                var name = trim(allChildren[j].textContent);
                var parsed = undefined;
                if (allChildren[j + 2].nodeName === "TABLE")
                    parsed = ParseTable(allChildren[j + 2]);
                else
                    parsed = ParseTable(allChildren[j + 4]);

                for (var k = 0; k < parsed.length; ++k) {
                    if (MandatoryProps.hasOwnProperty(name) && CheckProperties(name, parsed[k], MandatoryProps[name])) {
                        if (name === Contents.Attr_Bonus) {
                            if (parsed[k][Contents.Modifier].endsWith(Contents.Used_With)) {
                                PushWithCreateSubarrays(Attribs,
                                                        [parsed[k][Contents.Attribute]],
                                                        {value: Value.Parse(parsed[k][Contents.Modifier].removeRight(Contents.Used_With)), item: index, used_with: true
                                                        }
                                                       );
                            }
                        } else if (name === Contents.Level_Bonus) {
                            if (parsed[k][Contents.Modifier].endsWith(Contents.Used_With)) {
                                PushWithCreateSubarrays(Level,
                                                        [parsed[k][Contents.Skill]],
                                                        {value: Value.Parse(parsed[k][Contents.Modifier].removeRight(Contents.Used_With)), item: index, used_with: true
                                                        }
                                                       );
                            }
                        } else if (name === Contents.Effect_Bonus) {
                            PushWithCreateSubarrays(Effect,
                                                    [parsed[k][Contents.Skill]],
                                                    {value: Value.Parse(parsed[k][Contents.Modifier].removeRight(Contents.Used_With)), item: index, used_with: parsed[k][Contents.Modifier].endsWith(Contents.Used_With)
                                                    }
                                                   );
                        } else if (name === Contents.Damage_Taken) {
                            PushWithCreateSubarrays(DamageTaken,
                                                    [parsed[k][Contents.Damage_Type], parsed[k][Contents.Attack_Type].removeRight(Contents.Used_With)],
                                                    {value: Dmg.Parse(parsed[k][Contents.BonusR].removeRight(Contents.Dmg_With)), item: index, in_addition: parsed[k][Contents.BonusR].endsWith(Contents.Dmg_With), used_with: parsed[k][Contents.Attack_Type].endsWith(Contents.Used_With)
                                                    }
                                                   );
                        } else if (name === Contents.Attack_Bonus) {
                            PushWithCreateSubarrays(Attack,
                                                    [parsed[k][Contents.Attack_Type]],
                                                    {value: Value.Parse(parsed[k][Contents.Modifier].removeRight(Contents.Used_With)), item: index, used_with: parsed[k][Contents.Modifier].endsWith(Contents.Used_With)
                                                    }
                                                   );
                        } else if (name === Contents.Damage_Bonus) {
                            PushWithCreateSubarrays(Damage,
                                                    [parsed[k][Contents.Damage_Type], parsed[k][Contents.Attack_Type].removeRight(Contents.Used_With)],
                                                    {value: Dmg.Parse(parsed[k][Contents.Damage_BonusR].removeRight(Contents.Dmg_With)), item: index, in_addition: parsed[k][Contents.Damage_BonusR].endsWith(Contents.Dmg_With), used_with: parsed[k][Contents.Attack_Type].endsWith(Contents.Used_With)
                                                    }
                                                   );
                        } else if (name === Contents.Defense_Bonus) {
                            PushWithCreateSubarrays(Defense,
                                                    [parsed[k][Contents.Attack_Type]],
                                                    {value: Value.Parse(parsed[k][Contents.Modifier].removeRight(Contents.Used_With)), item: index, used_with: parsed[k][Contents.Modifier].endsWith(Contents.Used_With)
                                                    }
                                                   );
                        }
                    } else {
                        if (okH2 !== undefined || name !== Contents.Link)
                            alert("Unknown stat: " + name);
                    }
                }
                j += (allChildren[j + 2].nodeName === "TABLE" ? 2 : 4);
            }
        }
    }
}

function AddTableRow(isHeader, index, data, center) {
    var td = "td";
    if (isHeader)
        td = "th";

    var ret = "";
    if (data.length > 0) {
        ret = "[tr]";
        for (var j = 0; j < data.length; ++j) {

            ret += "[td]" + data[j] + "[/td]";
        }
        ret += "[/tr]";
    }

    return ret;
}

function GetEquipmentName(index, multiples) {
    return Equipment[index].name.replace("'", "&#39;") + (multiples && Equipment[index].count > 1 ? " x" + Equipment[index].count : "");
}

function GetEquipmentHref(index, multiples) {
    return '[item: ' + Equipment[index].name + ']';
}

function AddTable(heroID, Where, Data, heading, headers, desc)
{
    var display = false;
    var txt = "[h3]" + heading + "[/h3]";
    if (desc !== undefined)
        txt += desc;
    txt += '[table]';
    txt += AddTableRow(true, 0, headers);

    var j = 0;
    var havea = false;
    for (var k in Data) {
        var total = new Value();
        var disp = '[table]';
        var last_disp = "";
        var cnt = 0;
        for (var i = 0; i < Data[k].length; ++i) {
            if (Data[k][i].used_with)
                continue;
            total = total.Add(Data[k][i].value.Mult(Equipment[Data[k][i].item].count));
            disp += "[tr][td]" + GetEquipmentHref(Data[k][i].item, true) + "[/td][td]" + Data[k][i].value.Mult(Equipment[Data[k][i].item].count).Html() + "[/td][/tr]";
            last_disp = GetEquipmentHref(Data[k][i].item, true);
            cnt++;
        }
        disp += "[/table]";

        if (cnt > 0) {
            txt += AddTableRow(false, j,
                               [k, total.Html(), total.Calc(HeroLevel).Html(), (cnt > 1 ? disp : last_disp)
                               ],
                               [false, true, true, false]
                              );
            j++;
        }
        for (var ia = 0; ia < Data[k].length; ++ia) {
            if (!Data[k][ia].used_with)
                continue;
            txt += AddTableRow(false, j,
                               [k, Data[k][ia].value.Html() + Contents.Used_With, Data[k][ia].value.Calc(HeroLevel).Html() + Contents.Used_With, GetEquipmentHref(Data[k][ia].item, false)
                               ],
                               [false, true, true, false]
                              );
            j++;
            havea = true;
        }
    }
    txt += "[/table]";
    if (havea)
        txt += "(a)" + Contents.Item_Skill;

    if (j > 0) {
        message += txt;
        Where.innerHTML += txt;
    }
}


function AddTableEx(heroID, Where, Data, heading, headers, negative)
{
    if (negative === undefined)
        negative = false;

    var display = false;
    var txt = "[h3]" + heading + "[/h3][table]";
    txt += AddTableRow(true, 0, headers);

    var j = 0;
    var havea = false;
    var havez = false;
    for (var k in Data) {
        for (var l in Data[k]) {
            var total = new Dmg();
            var disp = '[table]';
            var last_disp = "";
            var cnt = 0;
            for (var i = 0; i < Data[k][l].length; ++i) {
                if (Data[k][l][i].used_with || Data[k][l][i].in_addition)
                    continue;
                total = total.Add(Data[k][l][i].value.Mult(Equipment[Data[k][l][i].item].count));
                disp += "[tr][td]" + GetEquipmentHref(Data[k][l][i].item, true) + "[/td][td]" + Data[k][l][i].value.Mult(Equipment[Data[k][l][i].item].count).Html(negative) + "[/td][/tr]";
                last_disp = GetEquipmentHref(Data[k][l][i].item, true);
                cnt++;
            }
            disp += "[/table]";
            if (cnt > 0) {
                txt += AddTableRow(false, j,
                                   [k, l, total.Html(negative), total.Calc(HeroLevel).Html(negative), (cnt > 1 ? disp : last_disp)
                                   ],
                                   [false, true, true, true, false]
                                  );
                j++;
            }

            total = new Dmg();
            disp = '[table]';
            last_disp = "";
            cnt = 0;
            for (var ib = 0; ib < Data[k][l].length; ++ib) {
                if (Data[k][l][ib].used_with || !Data[k][l][ib].in_addition)
                    continue;
                total = total.Add(Data[k][l][ib].value.Mult(Equipment[Data[k][l][ib].item].count));
                disp += "[tr][td]" + GetEquipmentHref(Data[k][l][ib].item, true) + "[/td][td]" + Data[k][l][ib].value.Mult(Equipment[Data[k][l][ib].item].count).Html(negative) + "[/td][/tr]";
                last_disp = GetEquipmentHref(Data[k][l][ib].item, true);
                cnt++;
            }
            disp += "[/table]";
            if (cnt > 0) {
                txt += AddTableRow(false, j,
                                   [k, l, total.Html(negative) + Contents.Dmg_With, total.Calc(HeroLevel).Html(negative) + Contents.Dmg_With, (cnt > 1 ? disp : last_disp)
                                   ],
                                   [false, true, true, true, false]
                                  );
                j++;
                havez = true;
            }
            for (var ic = 0; ic < Data[k][l].length; ++ic) {
                if (!Data[k][l][ic].used_with)
                    continue;
                txt += AddTableRow(false, j,
                                   [k, l + Contents.Used_With, Data[k][l][ic].value.Html(negative) + (Data[k][l][ic].in_addition ? Contents.Dmg_With : ""), Data[k][l][ic].value.Calc(HeroLevel).Html(negative) + (Data[k][l][ic].in_addition ? Contents.Dmg_With : ""), GetEquipmentHref(Data[k][l][ic].item, false)
                                   ],
                                   [false, true, true, true, false]
                                  );
                j++;
                havea = true;
                havez = havez || Data[k][l][ic].in_addition;
            }
        }
    }
    txt += "[/table]";
    if (!negative) {
        txt += "(r)" + Contents.Damage_Effect + '[br]';
        if (havea)
            txt += "(a)" + Contents.Item_Skill + '[br]';
        if (havez)
            txt += "(z)" + Contents.Damage_Added + '[br]';
    } else {
        txt += "(r)" + Contents.All_Hits + '[br]';
        if (havea)
            txt += "(a)" + Contents.Item_Skill + '[br]';
        if (havez)
            txt += "(z)" + Contents.Damage_Added + '[br]';
    }

    if (j > 0) {
        message += txt;
        Where.innerHTML += txt;
    }
}

function DisplayResult(heroID) {
    Result.innerHTML = Contents.Title + new Date().toLocaleString();
    //AddTable
    AddTable(heroID, Result, Attribs, Contents.Attr_Bonus, [Contents.Attribute, Contents.Modifier, Contents.Value, Contents.Item], undefined);
    AddTable(heroID, Result, Level, Contents.Level_Bonus, [Contents.Skill, Contents.Modifier, Contents.Value, Contents.Item], undefined);
    AddTable(heroID, Result, Effect, Contents.Effect_Bonus, [Contents.Skill, Contents.Modifier, Contents.Value, Contents.Item], Contents.Effect_BonusTalent);
    AddTable(heroID, Result, Attack, Contents.Attack_Bonus, [Contents.Attack_Type, Contents.Modifier, Contents.Value, Contents.Item], undefined);
    AddTable(heroID, Result, Defense, Contents.Defense_Bonus, [Contents.Attack_Type, Contents.Modifier, Contents.Value, Contents.Item], undefined);

    AddTableEx(heroID, Result, Damage, Contents.Damage_Bonus, [Contents.Damage_Type, Contents.Attack_Type, Contents.Damage_BonusR, Contents.Value, Contents.Item]);
    AddTableEx(heroID, Result, DamageTaken, Contents.Damage_Taken, [Contents.Damage_Type, Contents.Attack_Type, Contents.BonusR, Contents.Value, Contents.Item], true);
    //TODO
    msgBox[0].value += getTableFinal();
    SetStatus("Fini...");
}

function getTableFinal() {
    var tableFinale = '';
    tableFinale += '[table border="1"][tr][td]';
    tableFinale += makeTableTitre();
    tableFinale += '[/td][td]';
    tableFinale += tableAttributs;
    tableFinale += '[/td][td]';
    tableFinale += tableAtt;
    tableFinale += '[/td][/tr][tr][td]';
    tableFinale += tableTalents;
    tableFinale += '[/td][td]';
    tableFinale += tableEquipement;
    tableFinale += '[/td][td]';
    tableFinale += tableSac;
    tableFinale += '[/td][/tr][tr][td colspan="3"]';
    tableFinale += message;
    tableFinale += '[/td][/tr][/table]';
    return tableFinale;
}

function ParseTable(Document) {
    var ret = [];
    var names = [];
    var allTRs = Document.getElementsByTagName("tr");
    for (var j = 0; j < allTRs.length; ++j) {
        var tr = allTRs[j];
        if (tr.getAttribute("class") === "content_table_header" || tr.getAttribute("class") === "header") {
            var allTHs = tr.getElementsByTagName("th");
            for (var k = 0; k < allTHs.length; ++k) {
                names.push(allTHs[k].textContent.trim().space_clear());
            }
        } else {
            var allTDs = tr.getElementsByTagName("td");
            var row = {};
            for (var ka = 0; ka < allTDs.length; ++ka) {
                row[names[ka]] = allTDs[ka].textContent.trim().space_clear();
            }
            ret.push(row);
        }
    }
    return ret;
}
function makeTableTitre() {
    var titre = "";
    titre = '[table][tr][th rowspan="6"] [img]' + avatar + '[/img][/th][th colspan="2"][hero: ' + nomH + '][/th][/tr]' +
        '[tr][td]Classe[/td][td][url=' + classeRef + ']' + classeH + '[/url][/td][/tr]' +
        '[tr][td]Peuple[/td][td][url=' + raceRef + ']' + raceH + '[/url][/td][/tr]' +
        '[tr][td]Niveau[/td][td]' + niveauH + '[/td][/tr]' +
        '[tr][td]Statut de légende[/td][td]' + legendeH + '[/td][/tr]' +
        '[tr][td]Gloire[/td][td]' + gloireH + '[/td][/tr][/table]';
    return titre;
}
