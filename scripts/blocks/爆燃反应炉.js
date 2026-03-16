const output = 8;
var outputItem = Items.scrap;
var Stack = new ItemStack(outputItem, output);
var consumeEffect = new MultiEffect([Fx.explosion, Fx.shockwave, Fx.blockExplosionSmoke]);
var consumeSound = Sounds.explosion;
// 60/S
const BRFYL = extend(NuclearReactor, "爆燃反应炉", {
    setStats(){
        this.super$setStats();
        this.stats.add(Stat.output, StatValues.items(this.itemDuration, Stack));
    },
    setBars(){
        this.super$setBars();
        this.addBar("items", entity => new Bar(
            () => Core.bundle.format("item.scrap.name"),
            () => outputItem.color,
            () => 1.0 * entity.items.get(outputItem) / entity.block.itemCapacity)
        );
    }
});
BRFYL.consumeItems(ItemStack.with(
    require("LI/LIitems")["固态石油"], 1
));
BRFYL.consumeLiquid(require("LI/LIliquids")["超级冷冻液"], 2.4/60).update = false;
BRFYL.buildType = prov(() => {
    return extend(NuclearReactor.NuclearReactorBuild, BRFYL, {
        consume(){
            this.super$consume();
            if(this.items.get(this.block.fuelItem) > 0){
                let add = Math.min(output, this.block.itemCapacity - this.items.get(outputItem));
                if(add <= 0)return;
                this.items.add(outputItem, add);
            }
            consumeEffect.at(this.x, this.y, 0, Color.valueOf("FF6060FF"), () => {circleRad = this.block.size * Vars.tilesize * 0.9});
            consumeSound.at(this.x, this.y, Mathf.random(0.5, 0.8), Mathf.random(0.8, 1.1));
        },
        bomb(){
            if(this.items.get(outputItem) == this.block.itemCapacity && this.enabled){
                this.kill();
                Events.fire(new EventType.GeneratorPressureExplodeEvent(this));
            }
        },
        updateTile(){
            this.super$updateTile();
            this.dumpAccumulate(outputItem);
            this.bomb();
        }
    });
});
exports.BRFYL = BRFYL;