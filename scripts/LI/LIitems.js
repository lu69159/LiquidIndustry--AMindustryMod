const {NT} = require("planets/Nepture");
function ANT(a){
    if(!a.shownPlanets.contains(NT)){
        a.shownPlanets.add(NT);
    }
    if(!a.shownPlanets.contains(Planets.serpulo)){
        a.shownPlanets.add(Planets.serpulo);
    }
}
function newItem(name) {
    exports[name] = (() => {
        let myItem = extend(Item, name, {});
        ANT(myItem);
        return myItem;
    })();
}
function newExtendItem(name, func) {
    exports[name] = (() => {
        let myItem = extend(Item, name, func);
        ANT(myItem);
        return myItem;
    })();
}
newItem("亲水质")
newItem("治愈质")
newItem("超导质")
newExtendItem("神秘物质", {
    setStats(){
        return;
    }
})
newItem("固态水")
newItem("固态重水")
newItem("固态冷冻液")
newItem("固态石油")
newItem("固态超级冷冻液")

