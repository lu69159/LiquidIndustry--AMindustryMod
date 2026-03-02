const LIblockslib = require("base/LIblockslib");
const lib = require("base/lib");
const maps = require("map/maps");

const SNNJY = require("blocks/神能凝聚仪").神能凝聚仪;
const ZNJHQ = require("blocks/终能聚合器").终能聚合器;
const JHTQY = require("blocks/精华提取源").JHTQY;
const SCD = require("blocks/IL/双传带").ILduct;
const SCJCQ = require("blocks/IL/双传交叉器").ILjunction;
const SCLYQ = require("blocks/IL/双传路由器").ILrouter;
const SCQ = require("blocks/IL/双传桥").ILbridge;
const YTZQ = require("blocks/液体质驱").液体质驱;

Events.on(ContentInitEvent, cons(e => {
    //超能墙
    lib.addToResearch(LIblockslib.超能墙, {
        parent: LIblockslib.微型核心基座.name,
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map4yy),
            new Objectives.Research(LIblockslib.大型合金装甲储液罐),
            new Objectives.Research(LIblockslib.大型塑钢装甲储液罐),
            new Objectives.Research(LIblockslib.大型相织装甲储液罐),
        )
    });
    lib.addToResearch(LIblockslib.大型超能墙, {
        parent: LIblockslib.超能墙.name
    });
    lib.addToResearch(LIblockslib.巨型超能墙, {
        parent: LIblockslib.大型超能墙.name
    });

    lib.addToResearch(LIblockslib.状态穹顶, {
        parent: LIblockslib.超频投影.name,
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map4yy),
            new Objectives.Research(LIblockslib.保护投影)
        )
    });

    //神能凝聚仪
    lib.addToResearch(SNNJY, { 
        parent: LIblockslib.精华浓缩厂.name,
        objectives: Seq.with(
            new Objectives.Research(LIblockslib.四级精华转化仪),
            new Objectives.Research(ZNJHQ)
        )
    });

    //精华提取源
    lib.addToResearch(JHTQY, { 
        parent: SNNJY.name,
    });

    //双传带
    lib.addToResearch(SCD, { 
        parent: Blocks.plastaniumConveyor.name,
        objectives: Seq.with(
            new Objectives.Research(Blocks.platedConduit)
        )
    });

    //双传交叉器
    lib.addToResearch(SCJCQ, { 
        parent: SCD.name
    });

    //双传路由器
    lib.addToResearch(SCLYQ, { 
        parent: SCJCQ.name
    });

    //双传桥
    lib.addToResearch(SCQ, { 
        parent: SCLYQ.name,
        objectives: Seq.with(
            new Objectives.Research(Blocks.massDriver),
            new Objectives.Research(YTZQ)
        )
    });

}));
