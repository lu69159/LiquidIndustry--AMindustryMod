const {NT} = require("planets/Nepture");
function ANT(a){
	if(!a.shownPlanets.contains(NT)){
		a.shownPlanets.add(NT);
	}
	if(!a.shownPlanets.contains(Planets.serpulo)){
		a.shownPlanets.add(Planets.serpulo);
	}
}
function newLiquid(name) {
	exports[name] = (() => {
		let myLiquid = extend(Liquid, name, {});
		ANT(myLiquid);
		return myLiquid;
	})();
}
newLiquid("冰冷废液")
newLiquid("一级精炼废液")
newLiquid("二级精炼废液")
newLiquid("三级精华废液")
newLiquid("四级浓缩精华液")
newLiquid("超浓缩精华液")
newLiquid("神能精华液")
newLiquid("重水")
newLiquid("超级冷冻液")
//衰变熔岩 (定义于 终能聚合器)

Liquids.water.shownPlanets.add(NT);
Liquids.slag.shownPlanets.add(NT);
Liquids.oil.shownPlanets.add(NT);
Liquids.cryofluid.shownPlanets.add(NT);

//Vars.content.liquids() ?