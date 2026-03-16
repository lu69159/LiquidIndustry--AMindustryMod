const I = require("LI/LIitems");
var CENTER, Region, bottomRegion, 光环Region;

const JHTQY = extend(ItemSource, "精华提取源", {
    load(){
        this.super$load();
        Region = Core.atlas.find(this.name);
        bottomRegion = Core.atlas.find(this.name + "-bottom");
        CENTER = Core.atlas.find(this.name + "-center");
        光环Region = Core.atlas.find("液体工艺-神佑光环");
    },
    icons(){
        return [bottomRegion, Region];
    },
    drawPlanConfig(plan, list){
        this.drawPlanConfigCenter(plan, plan.config, CENTER);
    },
    drawPlanConfigCenter(plan, content, region){
        if(content == null){
            Draw.rect(region, plan.drawx(), plan.drawy());
            return;
        }
        var color = content.color;
        if(color == null) return;

        Draw.color(color);
        Draw.rect(region, plan.drawx(), plan.drawy());
        Draw.color();
    }
});

JHTQY.buildType = prov(() => {
    return extend(ItemSource.ItemSourceBuild, JHTQY, {
        buildConfiguration(table){
            let tmp = Vars.content.items();
            var items = tmp.copy();
            if(items.contains(I["神秘物质"]))items.remove(I["神秘物质"]);
            ItemSelection.buildTable(
                this.block, 
                table, 
                items, 
                () => this.outputItem, 
                (item) => this.configure(item), 
                this.block.selectionRows, 
                this.block.selectionColumns
            );
        },
        draw(){
            var color;
            if(this.outputItem == null){
                color = Color.valueOf("FFFFFFCF");
                Draw.rect(CENTER, this.x, this.y);
            }else{
                color = this.outputItem.color;
                Draw.color(color);
                Draw.rect(CENTER, this.x, this.y);
                Draw.color();
            }
            Draw.rect(Region, this.x, this.y);

            Draw.z(Layer.effect);
            Draw.color(color);
            Draw.rect(
                光环Region,
                this.x,
                this.y,
                this.block.size * Vars.tilesize,
                this.block.size * Vars.tilesize,
                Time.time * 1.6
            );
        },
        shouldConsume(){
            return (this.outputItem != null && this.enabled);
                //&& this.items.get(this.outputItem) < this.block.itemCapacity);
        }
    });
});

JHTQY.sync = true;


exports.JHTQY = JHTQY;
