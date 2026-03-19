const type = require("base/type");
const status = require("LI/LIstatus");
const MC = require("base/MultiCrafterlib");

//自定义地板
const JHXQ = extend(Floor, "禁核心区", {
	cantPlaceMiniCore: true,
	init(){
		this.cantPlaceMiniCore = true;
	}
});

//测试
//const TEST = type.UnloaderProjector("TEST", 80);

//单位
const BCJDWZGGC = new Reconstructor("倍乘级单位直构工厂");
exports.倍乘级单位直构工厂 = BCJDWZGGC;

const DMJDWZGGC = new Reconstructor("多幂级单位直构工厂");
exports.多幂级单位直构工厂 = DMJDWZGGC;

const WLJDWZGGC = new Reconstructor("无量级单位直构工厂");
exports.无量级单位直构工厂 = WLJDWZGGC;

const FZGC = new UnitFactory("辅助工厂");
exports.辅助工厂 = FZGC;

//电力
//爆燃反应炉
const CDJD = new PowerNode("超导节点");
exports.超导节点 = CDJD;

const DXCDJD = new PowerNode("大型超导节点");
exports.大型超导节点 = DXCDJD;

const CDDLT = new PowerNode("超导电力塔");
exports.超导电力塔 = CDDLT;

const CDDC = new Battery("超导电池");
exports.超导电池 = CDDC;

const DXCDDC = new Battery("大型超导电池");
exports.大型超导电池 = DXCDDC;

const TFDJ = new ConsumeGenerator("碳发电机");
exports.碳发电机 = TFDJ;

const ZSHFYD = extend(NuclearReactor, "重水核反应堆", {});
ZSHFYD.consumeItems(ItemStack.with(
    Items.thorium, 1,
));
ZSHFYD.consumeLiquid(require("LI/LIliquids")["重水"], 1.8/60);
ZSHFYD.consumeLiquid(Liquids.cryofluid, 6/60).update = false;
ZSHFYD.buildType = prov(() => {
	var ZS = require("LI/LIliquids")["重水"];
	return extend(NuclearReactor.NuclearReactorBuild, ZSHFYD, {
		updateTile(){
            var fuel = this.items.get(this.block.fuelItem), fullness = fuel * 1.0 / this.block.itemCapacity;		
            this.productionEfficiency = fullness;

            if(fuel > 0 && this.enabled){
                this.heat += fullness * this.block.heating * Math.min(this.delta(), 4);

                if(this.timer.get(this.block.timerFuel, this.block.itemDuration / this.timeScale)){
                    this.consume();
                }
            }else{
                this.productionEfficiency = 0;
                this.heat = Math.max(0, this.heat - Time.delta / this.block.ambientCooldownTime);
            }

            if(this.heat > 0 && this.liquids.get(ZS) > 0.1 && this.liquids.get(Liquids.cryofluid) > 0.1){
				var ZSefficiency = this.liquids.get(ZS) >= 10 ? 1 : 10 / this.liquids.get(ZS);
                var maxUsed = Math.min(this.liquids.get(Liquids.cryofluid), this.heat / this.block.coolantPower * ZSefficiency);	
                this.heat -= maxUsed * this.block.coolantPower;
                this.liquids.remove(Liquids.cryofluid, maxUsed);
            }

            if(this.heat > this.block.smokeThreshold){
                var smoke = 1.0 + (this.heat - this.block.smokeThreshold) / (1 - this.block.smokeThreshold); //ranges from 1.0 to 2.0
                if(Mathf.chance(smoke / 20.0 * this.delta())){
                    Fx.reactorsmoke.at(this.x + Mathf.range(this.block.size * Vars.tilesize / 2),
                    this.y + Mathf.range(this.block.size * Vars.tilesize / 2));
                }
            }

            this.heat = Mathf.clamp(this.heat);
            this.heatProgress = this.block.heatOutput > 0 ? Mathf.approachDelta(this.heatProgress, this.heat * this.block.heatOutput * (this.enabled ? 1 : 0), this.block.heatWarmupRate * this.delta()) : 0;

            if(this.heat >= 0.999){
                Events.fire(Trigger.thoriumReactorOverheat);
                this.kill();
            }
        },
		draw(){
            this.super$draw();

            Draw.color(this.block.coolColor, this.block.hotColor, this.heat);
            Fill.rect(this.x, this.y, this.block.size * Vars.tilesize, this.block.size * Vars.tilesize);


            Draw.color(Liquids.cryofluid.color);
            Draw.alpha(this.liquids.get(Liquids.cryofluid) / this.block.liquidCapacity);
            Draw.rect(this.block.topRegion, this.x, this.y);

            if(this.heat > this.block.flashThreshold){
                this.flash += (1 + ((this.heat - this.block.flashThreshold) / (1 - this.block.flashThreshold)) * 5.4) * Time.delta;
                Draw.color(Color.red, Color.yellow, Mathf.absin(this.flash, 9, 1));
                Draw.alpha(0.3);
                Draw.rect(this.block.lightsRegion, this.x, this.y);
            }

            Draw.reset();
        }
	});
});
exports.重水核反应堆 = ZSHFYD;

//辅助
const ZXZMQ = new LightBlock("中型照明器");
exports.中型照明器 = ZXZMQ;

const DXZMQ = new LightBlock("大型照明器");
exports.大型照明器 = DXZMQ;

const RZTY = new LightBlock("人造太阳");
exports.人造太阳 = RZTY;

const CSTQ = new OverdriveProjector("超速天穹");
exports.超速天穹 = CSTQ;

const CPTY = type.StatusProjector("超频投影", StatusEffects.overclock);
exports.超频投影 = CPTY;

const BHTY = type.StatusProjector("保护投影", StatusEffects.shielded);
exports.保护投影 = BHTY;

const JDTY = type.StatusProjector("解冻投影", status.解冻);
exports.解冻投影 = JDTY;

const ZTQDSeq = Seq.with(StatusEffects.overclock, StatusEffects.shielded);
const ZTQD = type.StatusProjector("状态穹顶", ZTQDSeq);
exports.状态穹顶 = ZTQD;

const RHTY = type.EnemyStatusProjector("弱化投影", StatusEffects.sapped);
exports.弱化投影 = RHTY;

const MBTY = type.EnemyStatusProjector("麻痹投影", StatusEffects.electrified);
exports.麻痹投影 = MBTY;

const HSTY = type.EnemyStatusProjector("缓速投影", StatusEffects.slow);
exports.缓速投影 = HSTY;

const RHQD = type.EnemyStatusProjector("弱化穹顶", StatusEffects.sapped);
exports.弱化穹顶 = RHQD;

const MBQD = type.EnemyStatusProjector("麻痹穹顶", StatusEffects.electrified);
exports.麻痹穹顶 = MBQD;

const HSQD = type.EnemyStatusProjector("缓速穹顶", StatusEffects.slow);
exports.缓速穹顶 = HSQD;

//核心
//闪电核心,雷霆核心
const WXHXJZ = extend(CoreBlock, "微型核心基座", {
	canBreak(tile) {
		return Vars.state.teams.cores(tile.team()).size > 1;
	},
	canReplace(other) {
		return other.alwaysReplace;
	},
	canPlaceOn(tile, team, rotation) {
		if(tile == null) return false;
		if(tile.floor() == JHXQ || tile.floor().cantPlaceMiniCore) return false;
		return Vars.state.teams.cores(team).size < 12;
	},
	drawPlace(x, y, rotation, valid) {
		if(Vars.world.tile(x, y) == null) return;
		let player = Vars.player;

		if ((player.team().core() != null && !player.team().core().items.has(this.requirements, Vars.state.rules.buildCostMultiplier)) && !Vars.state.rules.infiniteResources) {
            this.drawPlaceText(Core.bundle.get("bar.noresources"), x, y, false);
        }

		if(!(Vars.state.teams.cores(player.team()).size < 12)){
			this.drawPlaceText(
                Core.bundle.get("maxcores"), x, y, valid
            );
		}
	}
});
exports.微型核心基座 = WXHXJZ;

//炮塔
//闪电核心P,雷霆核心P,极光
const DCFB = new ItemTurret("电磁风暴");
exports.电磁风暴 = DCFB;

const DLY = new PowerTurret("德鲁伊");
exports.德鲁伊 = DLY;

const DL = new PowerTurret("电裂");
exports.电裂 = DL;

const JK = new PowerTurret("禁空");
exports.禁空 = JK;

const PF = new PowerTurret("破防");
exports.破防 = PF;

const MF = extend(ItemTurret, "埋伏", {
	setStats(){
		this.super$setStats();
		this.stats.remove(Stat.ammo);

		const turret = this;
		this.stats.add(Stat.ammo, new JavaAdapter(StatValue, {
			display(table){
				table.row();

				var map = turret.ammoTypes,
					orderedKeys = map.keys().toSeq();

				orderedKeys.sort();
				orderedKeys.each(t =>{
					var type = map.get(t);
					if(type.fragBullet != null && type.fragBullet.despawnUnit != null && type.fragBullet.despawnUnit.weapons.size > 0){
						StatValues.ammo(ObjectMap.of(t, type.fragBullet.despawnUnit.weapons.first().bullet), false, false).display(table);
					}			
				});
			}
		}));
	}
});
exports.埋伏 = MF;

const BP = new ItemTurret("爆破");
exports.爆破 = BP;

const ZBPT = new PowerTurret("作弊炮塔");
exports.作弊炮塔 = ZBPT;

//墙
const ZJCYG = type.WallLiquidRouter("装甲储液罐");
exports.装甲储液罐 = ZJCYG;

const DXZJCYG = type.WallLiquidRouter("大型装甲储液罐");
exports.大型装甲储液罐 = DXZJCYG;

const SGZJCYG = type.WallLiquidRouter("塑钢装甲储液罐");
exports.塑钢装甲储液罐 = SGZJCYG;

const DXSGZJCYG = type.WallLiquidRouter("大型塑钢装甲储液罐");
exports.大型塑钢装甲储液罐 = DXSGZJCYG;

const HJZJCYG = type.WallLiquidRouter("合金装甲储液罐");
exports.合金装甲储液罐 = HJZJCYG;

const DXHJZJCYG = type.WallLiquidRouter("大型合金装甲储液罐");
exports.大型合金装甲储液罐 = DXHJZJCYG;

const XZZJCYG = type.WallLiquidRouter("相织装甲储液罐");
exports.相织装甲储液罐 = XZZJCYG;

const DXXZZJCYG = type.WallLiquidRouter("大型相织装甲储液罐");
exports.大型相织装甲储液罐 = DXXZZJCYG;

const CNQ = type.WallLiquidRouter("超能墙");
exports.超能墙 = CNQ;

const DXCNQ = type.WallLiquidRouter("大型超能墙");
exports.大型超能墙 = DXCNQ;

const JXCNQ = type.WallLiquidRouter("巨型超能墙");
exports.巨型超能墙 = JXCNQ;

//生产
//终能聚合器，神能凝聚仪
const BLFYFLJ = new Separator("冰冷废液分离机");
exports.冰冷废液分离机 = BLFYFLJ;

const YJFYJLJ = new Separator("一级废液解离机");
exports.一级废液解离机 = YJFYJLJ;

const EJFYJLQ = new Separator("二级废液精馏器");
exports.二级废液精馏器 = EJFYJLQ;

const SJJHZHQ = new Separator("三级精华转化器");
exports.三级精华转化器 = SJJHZHQ;

const SJJHZHY = new GenericCrafter("四级精华转化仪");
exports.四级精华转化仪 = SJJHZHY;

const JHNSC = new GenericCrafter("精华浓缩厂");
exports.精华浓缩厂 = JHNSC;

const FYLXJ = new GenericCrafter("废液离心机");
exports.废液离心机 = FYLXJ;

const FYHHQ = new GenericCrafter("废液混合器");
exports.废液混合器 = FYHHQ;

const ZJLGL = new GenericCrafter("再精炼高炉");
exports.再精炼高炉 = ZJLGL;

const JHTQGC = new GenericCrafter("精华提取工厂");
exports.精华提取工厂 = JHTQGC

const JNZJLL = new GenericCrafter("聚能再精炼炉");
exports.聚能再精炼炉 = JNZJLL;

const QSZHCQ = new GenericCrafter("亲水质合成器");
exports.亲水质合成器 = QSZHCQ;

const ZYZYSJ = new GenericCrafter("治愈质压缩机");
exports.治愈质压缩机 = ZYZYSJ;

const CDLJQ = new GenericCrafter("超导裂解器");
exports.超导裂解器 = CDLJQ;

const GL = new GenericCrafter("高炉");
exports.高炉 = GL;

const DXFSJ = new GenericCrafter("大型粉碎机");
exports.大型粉碎机 = DXFSJ;

const LDYJBJ = new GenericCrafter("冷冻液搅拌机");
exports.冷冻液搅拌机 = LDYJBJ;

const CLHHQ = new GenericCrafter("超冷混合器");
exports.超冷混合器 = CLHHQ;

const ZSSCQ = new GenericCrafter("重水生产器");
exports.重水生产器 = ZSSCQ;

const GL2 = new GenericCrafter("硅炉");
exports.硅炉 = GL2;

const SGFJQ = new GenericCrafter("塑钢分解器");
exports.塑钢分解器 = SGFJQ;

const XZBFJQ = new GenericCrafter("相织布分解器");
exports.相织布分解器 = XZBFJQ;

const JLHJFJQ = new GenericCrafter("巨浪合金分解器");
exports.巨浪合金分解器 = JLHJFJQ;

const GYZHQ = MC.MultiCrafter("固液转化器", [
    //液->固	
    {
        input: {       
            items: ["液体工艺-亲水质/1"],  
            liquids: ["water/450"],
            power: 8
        },
        output: {
            items: ["液体工艺-固态水/1"],
        },
        craftTime: 300 
    },
    {
        input: {
            items: ["液体工艺-亲水质/1"],
            liquids: ["液体工艺-重水/450"],
            power: 8
        },
        output: {
            items: ["液体工艺-固态重水/1"],
        },
        craftTime: 300 
    },
    {
        input: {
            items: ["液体工艺-亲水质/1"],
            liquids: ["cryofluid/450"],
            power: 8
        },
        output: {
            items: ["液体工艺-固态冷冻液/1"],
        },
        craftTime: 300 
    },
    {
        input: {
            items: ["液体工艺-亲水质/1"],
            liquids: ["oil/450"],
            power: 8
        },
        output: {
            items: ["液体工艺-固态石油/1"],
        },
        craftTime: 300 
    },
    {
        input: {
            items: ["液体工艺-亲水质/1"],
            liquids: ["液体工艺-超级冷冻液/450"],
            power: 8
        },
        output: {
            items: ["液体工艺-固态超级冷冻液/1"],
        },
        craftTime: 300 
    },
//固->液
    {
        input: {       
            items: ["液体工艺-固态水/1"],
            power: 0.5
        },
        output: {
            liquids: ["water/450"]
        },
        craftTime: 30
    },
    {
        input: {       
            items: ["液体工艺-固态重水/1"],
            power: 0.5
        },
        output: {
            liquids: ["液体工艺-重水/450"]
        },
        craftTime: 30
    },
    {
        input: {       
            items: ["液体工艺-固态冷冻液/1"],
            power: 0.5
        },
        output: {
            liquids: ["cryofluid/450"]
        },
        craftTime: 30
    },
    {
        input: {       
            items: ["液体工艺-固态石油/1"],
            power: 0.5
        },
        output: {
            liquids: ["oil/450"]
        },
        craftTime: 30
    },
    {
        input: {       
            items: ["液体工艺-固态超级冷冻液/1"],
            power: 0.5
        },
        output: {
            liquids: ["液体工艺-超级冷冻液/450"]
        },
        craftTime: 30
    }
]);
GYZHQ.selectionColumns = 5;
exports.固液转化器 = GYZHQ;

//物流
//双传带,双传桥,双传路由器,双传交叉器
const TCSD = new Conveyor("钍传送带");
exports.钍传送带 = TCSD;

const XZBXZQ = new Unloader("相织布卸载器");
exports.相织布卸载器 = XZBXZQ;

const GYFSQ = new MassDriver("高压发射器");
exports.高压发射器 = GYFSQ;

const WXZQ = new MassDriver("微型质驱");
exports.微型质驱 = WXZQ;

//液流
//液体卸载器
const JXCYG = new LiquidRouter("巨型储液罐");
exports.巨型储液罐 = JXCYG;

const TDGQ = new LiquidBridge("钛导管桥");
exports.钛导管桥 = TDGQ;

const ZKB = new Pump("真空泵");
exports.真空泵 = ZKB;

const YTZQ = type.LiquidMassDriver("液体质驱", 4);
exports.液体质驱 = YTZQ;

const WXYTZQ = type.LiquidMassDriver("微型液体质驱", 2);
exports.微型液体质驱 = WXYTZQ;

//钻头
const QXCSJ = new SolidPump("强效抽水机");
exports.强效抽水机 = QXCSJ;

const DXCSJ = new SolidPump("大型抽水机");
exports.大型抽水机 = DXCSJ;

const LDYCQJ = new SolidPump("冷冻液抽取机");
exports.冷冻液抽取机 = LDYCQJ;

const BLZJ = new Fracker("冰冷钻井");
exports.冰冷钻井 = BLZJ;

const YZSYZJ = new Fracker("硬质石油钻井");
exports.硬质石油钻井 = YZSYZJ;



/* 外部定义方块 */
const SCD = require("blocks/IL/双传带").ILduct;
const SCJCQ = require("blocks/IL/双传交叉器").ILjunction;
const SCLYQ = require("blocks/IL/双传路由器").ILrouter;
const SCQ = require("blocks/IL/双传桥").ILbridge;

const BRFYL = require("blocks/爆燃反应炉").BRFYL;
const JHTQY = require("blocks/精华提取源").JHTQY;
const JG = require("blocks/极光").极光;
const SNNJY = require("blocks/神能凝聚仪").神能凝聚仪;
const YTXZQ = require("blocks/液体卸载器").液体卸载器;
const ZNJHQ = require("blocks/终能聚合器").终能聚合器;