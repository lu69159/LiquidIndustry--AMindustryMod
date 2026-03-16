const lib = require("base/lib");
const LIblockslib = require("LI/LIblockslib");
const SD = require("blocks/cores/闪电核心");
const maps = require("map/maps");

//Nepture.techTree = TechTree.nodeRoot("微型核心基座", LIlib.微型核心基座, () => {});

Events.on(ContentInitEvent, cons(e => {
    
    lib.addToResearch(maps.map1cs, {
        parent: LIblockslib.微型核心基座.name,
        objectives: Seq.with(
		new Objectives.Research(LIblockslib.微型核心基座)
	    )
    });

    lib.addToResearch(maps.map2xc, {
        parent: "测试区",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map1cs)
        )
    });

    lib.addToResearch(maps.map3jb, {
        parent: "狭长冰谷",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map2xc),
            new Objectives.Research(LIblockslib.冰冷废液分离机)
        )
    });

    lib.addToResearch(maps.map4yy, {
        parent: "极冰溶洞",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map3jb),
            new Objectives.Research(SD.SDcore),
            new Objectives.Research(LIblockslib.电裂),
        )
    });

    lib.addToResearch(maps.map5jg, {
        parent: "永夜荒地",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map4yy),
            new Objectives.Research(LIblockslib.三级精华转化器),
            new Objectives.Research(LIblockslib.解冻投影),
            new Objectives.Research(LIblockslib.状态穹顶)
        )
    });

    lib.addToResearch(maps.JC1, {
        parent: "测试区",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map1cs)
        )
    });

    lib.addToResearch(maps.JC2, {
        parent: "教程：获取钛",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map2xc)
        )
    });

    lib.addToResearch(maps.ZX1, {
        parent: "永夜荒地",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.map4yy)
        )
    });

    lib.addToResearch(maps.ZX2, {
        parent: "蛇行道",
        objectives: Seq.with(
            new Objectives.SectorComplete(maps.ZX1)
        )
    });

}));