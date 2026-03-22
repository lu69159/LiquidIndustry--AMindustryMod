/**
 * 多配方工厂 JS库
 * @author Space
 * @version 0.1
 * 使用输出首项作为选择图标，目前暂不支持不同配方的输出首项重复
 */

//X端修改了蓝图读取，为避免X报错，令X的蓝图显示的输入输出为配方的首项

/* 配方示例
recipes:{
    input: {       
        items: [".../..."],
        liquids: [".../..."],
        power: 0.1
    },
    output: {
        items: [".../..."],
        liquids: [".../..."]
    },
    craftTime: ...
}
*/
function newRec(i){
    var rec = {
        choose: i,
        input:{
            items: new Seq(),
            liquids: new Seq(),
            power:0
        },
        output:{
            items: new Seq(),
            liquids: new Seq()
        },
        craftTime: 60
    };
    return rec;
}

function ButtonArray(ch, th){
    var BA = {
        choose: ch,
        thing: th
    }

    return BA;
}

exports.MultiCrafter = (name, recipes) => {
    const MC = extend(GenericCrafter, name, {
        hasItems: true,
        hasLiquids: true,
        hasPower: true,
        configurable: true,
        saveConfig: true,
        clearOnDoubleTap: false,
        Recipes: [],
        allOutputsT: [],

        AllInputItems: new Seq(),
        AllInputLiquids: new Seq(),
        AllOutputItems: new Seq(),
        AllOutputLiquids: new Seq(),
        readStr(str){
            if(str == null) throw "str is null";
            if(typeof str != "string") throw "str is not string";
            
            var w = str.split("/");
            if(w.length != 2) throw "str format error";

            return {name: w[0], amount: w[1]};
        },
        readRec(r, rec){       
            if(r.input.items != null && r.input.items.length >0){
                for(let j = 0; j < r.input.items.length; j++){
                    let parsed = this.readStr(r.input.items[j]);
                    let i = Vars.content.getByName(ContentType.item, parsed.name);
                    let is = new ItemStack(i, parsed.amount * 1);
                    rec.input.items.add(is);

                    if(!this.AllInputItems.contains(i)){
                        this.AllInputItems.add(i);
                    }
                }
            }
            if(r.input.liquids != null && r.input.liquids.length >0){
                for(let j = 0; j < r.input.liquids.length; j++){
                    let parsed = this.readStr(r.input.liquids[j]);
                    let l = Vars.content.getByName(ContentType.liquid, parsed.name);
                    let ls = new LiquidStack(l, parsed.amount * 1);
                    rec.input.liquids.add(ls);

                    if(!this.AllInputLiquids.contains(l)){
                        this.AllInputLiquids.add(l);
                    }
                }
            }
            if(r.input.power != null && r.input.power >0){
                rec.input.power = r.input.power;
            }
            if(r.output.items != null && r.output.items.length >0){
                for(let j = 0; j < r.output.items.length; j++){
                    let parsed = this.readStr(r.output.items[j]);
                    let i = Vars.content.getByName(ContentType.item, parsed.name);
                    let is = new ItemStack(i, parsed.amount * 1);
                    rec.output.items.add(is);

                    if(!this.AllOutputItems.contains(i)){
                        this.AllOutputItems.add(i);
                    }
                }
            }
            if(r.output.liquids != null && r.output.liquids.length >0){
                for(let j = 0; j < r.output.liquids.length; j++){
                    let parsed = this.readStr(r.output.liquids[j]);
                    let l = Vars.content.getByName(ContentType.liquid, parsed.name);
                    let ls = new LiquidStack(l, parsed.amount * 1);
                    rec.output.liquids.add(ls);

                    if(!this.allOutputLiquids.contains(l)){
                        this.allOutputLiquids.add(l);
                    }
                }
            }
            if(r.craftTime != null && r.craftTime >0){
                rec.craftTime = r.craftTime;
            }
        },
        getRec(j){
            return this.Recipes[j];
        },
        getAllRecs(){
            return this.Recipes;
        },
        getAllOutputs(){
            return this.allOutputsT;
        },
        getAllOutputItems(){
            return this.AllOutputItems;
        },
        getAllOutputLiquids(){
            return this.AllOutputLiquids;
        },
        avoidX(){ //用于避免X端蓝图保存报错,保存蓝图时物品液体的输入输出会显示配方选择首项的结果
            var first = this.Recipes[0];
            if(first == null) throw "WDF, there is no recipe?";

            var tempInputItemStacks = [], tempInputLiquidStacks = [], 
                tempOutputItemStacks = [], tempOutputLiquidStacks = [];
            var tempNOC = [];
            if(first.input.items.size > 0){
                first.input.items.each(is => {
                    tempInputItemStacks.push(is);
                });

                tempNOC.push(new ConsumeItems(tempInputItemStacks));
            };
            if(first.input.liquids.size > 0){
                first.input.liquids.each(ls => {
                    tempInputLiquidStacks.push(ls);
                });

                tempNOC.push(new ConsumeLiquids(tempInputLiquidStacks));
            };

            if(tempNOC.length > 0) this.nonOptionalConsumers = tempNOC;

            if(first.output.items.size > 0){
                first.output.items.each(is => {
                    tempOutputItemStacks.push(is);
                });

                this.outputItems = tempOutputItemStacks;
            };
            if(first.output.liquids.size > 0){
                first.output.liquids.each(ls => {
                    tempOutputLiquidStacks.push(ls);
                });

                this.outputLiquids = tempOutputLiquidStacks;
            };

            this.craftTime = first.craftTime;
        },
        init(){
            this.Recipes = [];
            this.allOutputsT = [];

            this.AllInputItems = new Seq();
            this.AllInputLiquids = new Seq();
            this.AllOutputItems = new Seq();
            this.AllOutputLiquids = new Seq();

            var allOutputThings = new Seq();

            for(let i = 0; i < recipes.length; i++){
                var rec = newRec(i);
                this.readRec(recipes[i], rec);
                this.Recipes[i] = rec;
     
                if(this.Recipes[i].output.items.size > 0){
                    allOutputThings.add(this.Recipes[i].output.items.get(0).item);
                }
                else if(rec.output.liquids.size > 0){
                    allOutputThings.add(this.Recipes[i].output.liquids.get(0).liquid);
                }
                else throw "WDF, there is a recipe without output?";        
            }

            for(let i = 0; i < allOutputThings.size; i++){
                let BA = ButtonArray(i, allOutputThings.get(i));
                this.allOutputsT[i] = BA;
            }

            if(this.AllInputItems.size > 0) this.acceptsItems = true;
            if(this.AllOutputLiquids.size > 0){
                this.outputsLiquid = true;
                this.outputLiquid = new LiquidStack(this.AllOutputLiquids.get(0), 0);
            }

            this.consumeBuilder.add(extend(ConsumePower, {
                usage: 0,
                requestedPower(entity){
                    var recnow = entity.findRec();
                    if(recnow == null || recnow.input.power == 0){
                        this.usage = 0;
                        return 0;
                    }        
                    this.usage = recnow.input.power;
                    return recnow.input.power * (entity.shouldConsume() ? 1 : 0);
                }
            }));

            this.avoidX();

            this.super$init();
        },
        outputsItems(){
            return this.AllOutputItems.size > 0;
        },
        setStats(){
            this.super$setStats();
            this.stats.remove(Stat.productionTime);
            this.stats.remove(Stat.powerUse);
            if(this.consumers.length > 0){
                this.stats.remove(Stat.input);
            }
            if(this.outputItems != null || this.outputLiquids != null){
                this.stats.remove(Stat.output);
            }

            const RS = new Stat("recipes", StatCat.crafting);
            const self = this;
           
            this.stats.add(RS, new JavaAdapter(StatValue, {
                display(table){
                    table.row();

                    for(let j = 0; j < self.Recipes.length; j++){
                        var rec = self.Recipes[j],
                            inI = rec.input.items,
                            inL = rec.input.liquids,
                            p = rec.input.power,
                            outI = rec.output.items,
                            outL = rec.output.liquids,
                            t = rec.craftTime;

                        table.table(Core.scene.getStyle(Button.ButtonStyle).up, bt => {

                            if(inI.size > 0){
                                inI.each(itemstack => {
                                    bt.add(StatValues.displayItem(itemstack.item, itemstack.amount, true));                   
                                });
                            }
                            if(inL.size > 0){
                                inL.each(liquidstack => {
                                    bt.add(StatValues.displayLiquid(liquidstack.liquid, liquidstack.amount, false));                   
                                });
                            }
                            if(p > 0){
                                bt.add(" " + "[#ffd37fff]" + Strings.autoFixed(p * 60, 3));         
                            }
                            bt.add(" -> ");
                            if(outI.size > 0){
                                outI.each(itemstack => {
                                    bt.add(StatValues.displayItem(itemstack.item, itemstack.amount, true));                   
                                });
                            }
                            if(outL.size > 0){
                                outL.each(liquidstack => {
                                    bt.add(StatValues.displayLiquid(liquidstack.liquid, liquidstack.amount, false));                   
                                });
                            }
                            bt.add(" ");
                            bt.add(Strings.autoFixed(t / 60, 3) + StatUnit.seconds.localized()).padLeft(4);

                        }).color(Pal.accent).left().growX();
                        table.add().size(18).row();
                    }

                }
            }));
        },
        setBars(){
            this.super$setBars();
            this.removeBar("liquid");

            var allLiquid = new Seq();
            if(this.AllInputLiquids.size > 0){
                this.AllInputLiquids.each(liquid => {
                    if(!allLiquid.contains(liquid)) allLiquid.add(liquid);
                });
            }
            if(this.AllOutputLiquids.size > 0){
                this.AllOutputLiquids.each(liquid => {
                    if(!allLiquid.contains(liquid)) allLiquid.add(liquid);
                });
            }

            allLiquid.each(l => {
                this.addLiquidBar(l);
            });
        }
    });

    MC.buildType = prov(() => {
        return new JavaAdapter(GenericCrafter.GenericCrafterBuild, {
            MYefficiency: 0,
            choosenow: -1,
            outputItem: null,
            showAllOutputs: new Seq(),
            created(){
                this.super$created();
                this.MYefficiency = 0;
                this.choosenow = -1;
                this.outputItem = null;

                this.showAllOutputs.clear();
                for(let j = 0; j < this.block.getAllOutputs().length; j++){
                    this.showAllOutputs.add(this.block.getAllOutputs()[j].thing);
                };
            },
            sense(sensor){
                if(sensor == LAccess.progress) return this.progress();
                if(sensor == LAccess.efficiency) return this.MYefficiency;

                if(sensor == LAccess.totalLiquids){
                    if(this.choosenow != -1 && this.findRec().output.liquids.size > 0){
                        return this.liquids.get(this.findRec().output.liquids.get(0).liquid);
                    }
                    else return 0;
                };
                return this.super$sense(sensor);
            },
            status(){
                if(!this.enabled){
                    return BlockStatus.logicDisable;
                }

                if(!this.shouldConsume()){
                    return BlockStatus.noOutput;
                }

                if(this.MYefficiency <= 0 || !this.productionValid()){
                    return BlockStatus.noInput;
                }

                return ((Vars.state.tick / 30) % 1) < this.MYefficiency ? BlockStatus.active : BlockStatus.noInput;
            },
            canDump(to, item){
                if(this.choosenow == -1 || this.findRec().input.items.size == 0) return true;
                if(this.findRec().input.items.contains(item)) return false;
                var bool = true;
                this.findRec().input.items.each(i => {
                    if(i.item == item) bool = false;
                });
                return bool;
            },
            canDumpLiquid(to, liquid){
                if(this.choosenow == -1 || this.findRec().input.liquids.size == 0) return true;
                var bool = true;
                this.findRec().input.liquids.each(l => {
                    if(l.liquid == liquid) bool = false;
                });
                return bool;
            },
            acceptItem(source, item){
                if(this.choosenow == -1 || this.findRec().input.items.size == 0) return false;
                if(this.items.get(item) >= this.block.itemCapacity) return false;
                var bool = false;
                this.findRec().input.items.each(i => {
                    if(i.item == item) bool = true;
                });
                return bool;
            },
            acceptLiquid(source, liquid){
                if(this.choosenow == -1 || this.findRec().input.liquids.size == 0) return false;
                if(this.liquids.get(liquid) >= this.block.liquidCapacity) return false;
                var bool = false;
                this.findRec().input.liquids.each(l => {
                    if(l.liquid == liquid) bool = true;
                });
                return bool;
            },
            findRec(){
                if(this.choosenow == -1) return null;
                var choose = -1;
                for(let j = 0; j < this.block.getAllRecs().length; j++){
                    if(this.block.getRec(j).choose == this.choosenow){
                        choose = j;
                        return this.block.getRec(choose);
                    }
                }
                if(choose == -1) return null;             
            },
            consume(){
                this.findRec().input.items.each(i => {
                    this.items.remove(i.item, i.amount);
                });
                this.findRec().input.liquids.each(l => {
                    this.liquids.remove(l.liquid, l.amount);
                });
            },
            craft(){
                if(this.choosenow == -1) return;
                this.consume();

                this.findRec().output.items.each(i => {
                    for(let j =0; j < i.amount; j++){
                        this.offload(i.item);
                    }
                });
                this.findRec().output.liquids.each(l => {
                    this.handleLiquid(this, l.liquid, Math.min(l.amount, this.block.liquidCapacity - this.liquids.get(l.liquid)));
                });

                if(this.wasVisible){
                    this.block.craftEffect.at(this.x, this.y);
                }
                this.progress %= 1;
            },
            dumpOutputs(){
                var ALLI = this.block.getAllOutputItems(),
                    ALLL = this.block.getAllOutputLiquids();
                ALLI.each(i => {
                    if(this.canDump(null, i)){
                        this.dump(i);
                    }
                });
                ALLL.each(l => {
                    if(this.canDumpLiquid(null, l)){
                        this.dumpLiquid(l, 2 ,-1);
                    }
                });
            },
            shouldConsume(){
                if(this.choosenow == -1) return false;
                var rec = this.findRec();
                var bool = true;
                if(rec.output.items.size > 0){
                    rec.output.items.each(i => {
                        if(this.items.get(i.item) + i.amount > this.block.itemCapacity) bool = false;
                    });
                }
                if(rec.output.liquids.size > 0 && !this.block.ignoreLiquidFullness){
                    var allFull = true;
                    rec.output.liquids.each(l => {
                        if(this.liquids.get(l.liquid) + l.amount > this.block.liquidCapacity){
                            if(!this.block.dumpExtraLiquid) bool = false;
                        }
                        else{
                            //if there's still space left, it's not full for all liquids
                            allFull = false;
                        }
                    });
                    if(allFull) bool = false;
                }
                return bool;
            },
            updateTile(){
                if(this.MYefficiency > 0 && this.choosenow != -1){
                    var rec = this.findRec();
                    var craftTime = rec.craftTime;
                    this.progress += this.getProgressIncrease(craftTime);
                    this.warmup = Mathf.approachDelta(this.warmup, this.warmupTarget(), this.block.warmupSpeed);

                    if(this.wasVisible && Mathf.chanceDelta(this.block.updateEffectChance)){
                        this.block.updateEffect.at(this.x + Mathf.range(this.block.size * this.block.updateEffectSpread), this.y + Mathf.range(this.block.size * this.block.updateEffectSpread));
                    }
                }else{
                    this.warmup = Mathf.approachDelta(this.warmup, 0, this.block.warmupSpeed);
                }

                //TODO may look bad, revert to edelta() if so
                this.totalProgress += this.warmup * Time.delta;

                if(this.progress >= 1){
                    this.craft();
                }
                this.dumpOutputs();
            },         
            updateConsumption(){
                if(this.choosenow != -1){
                    this.MYefficiency = 1;
                    var rec = this.findRec();
                    
                    var ME = 1;
                    if(rec.input.items.size > 0){
                        rec.input.items.each(i => {
                            if(this.items.get(i.item) < i.amount) ME = 0;
                        });
                    }

                    if(rec.input.liquids.size > 0){
                        rec.input.liquids.each(l => {
                            if(this.liquids.get(l.liquid) < l.amount) ME = 0;
                        });
                    }

                    if(rec.input.power > 0){
                        if(this.power.status <= 0){
                            ME = 0;
                        }
                        else{
                            ME *= this.power.status;
                        }
                    }

                    if(!this.shouldConsume()){
                        ME = 0;
                    }

                    this.MYefficiency = ME;
                }
                else{
                    this.MYefficiency = 0;
                }
                this.super$updateConsumption();
            },
            getProgressIncrease(baseTime){
                if(this.MYefficiency <= 0) return 0;

                if(this.ignoreLiquidFullness){
                    return 1 / baseTime * this.edelta();
                }

                var scaling = 1, max = 1;
                if(this.choosenow != -1){
                    var rec = this.findRec();
                    if(rec.output.liquids.size > 0){
                        max = 0;
                        rec.output.liquids.each(l => {
                            var value = (this.block.liquidCapacity - this.liquids.get(l.liquid)) / (l.amount * this.edelta());
                            scaling = Math.min(scaling, value);
                            max = Math.max(max, value);
                        });
                    }
                }
                //when dumping excess take the maximum value instead of the minimum.
                return 1 / baseTime * this.edelta() * (this.block.dumpExtraLiquid ? Math.min(max, 1) : scaling);
            },
            buildConfiguration(table){  //按钮物品重复怎么解决？暂未搞定(其实是懒QWQ)
                ItemSelection.buildTable(
                    this.block, 
                    table, 
                    this.showAllOutputs, 
                    () => this.outputItem,
                    (i) => this.configure(i), 
                    this.block.selectionRows, 
                    this.block.selectionColumns
                );
            },
            configured(player, value){
                this.choosenow = -1;
                this.outputItem = value;

                if(value == null ||!(value instanceof Item || value instanceof Liquid)){
                    this.outputItem = null;
                    return;
                }
                for(let j = 0; j < this.block.getAllOutputs().length; j++){
                    if(this.block.getAllOutputs()[j].thing == value){
                        this.choosenow = j;
                        this.progress = 0;
                        return;
                    }
                }        
            },
            config(){
                return this.outputItem;
            },
            shouldAmbientSound(){
                return this.MYefficiency > 0;
            },
            write(write){
                this.super$write(write);
                write.i(this.choosenow);
            },
            read(read, revision){
                this.super$read(read, revision);
                this.choosenow = read.i();
                this.outputItem = this.block.getAllOutputs()[this.choosenow].thing;
            }
        }, MC);
    });

    return MC;
};