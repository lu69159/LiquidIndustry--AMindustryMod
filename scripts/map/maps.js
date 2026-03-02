const {NT}= require("planets/Nepture");
const map1cs = new SectorPreset("测试区", NT, 1);
map1cs.difficulty = 1;
map1cs.noLighting = true;
map1cs.alwaysUnlocked = false;
map1cs.addStartingItems = true;
map1cs.captureWave = 2;
map1cs.localizedName = "测试区";
exports.map1cs = map1cs;

const map2xc = new SectorPreset("狭长冰谷", NT, 38);
map2xc.difficulty = 8;
map2xc.noLighting = false;
map2xc.alwaysUnlocked = false;
map2xc.addStartingItems = true;
map2xc.captureWave = 55;
map2xc.localizedName = "狭长冰谷";
exports.map2xc = map2xc;

const map3jb = new SectorPreset("极冰溶洞", NT, 56);
map3jb.difficulty = 14;
map3jb.noLighting = false;
map3jb.alwaysUnlocked = false;
map3jb.addStartingItems = true;
map3jb.captureWave = 0;
map3jb.localizedName = "极冰溶洞";
map3jb.rules = (r) => {
    r.attackMode = true;
};
exports.map3jb = map3jb;

const map4yy = new SectorPreset("永夜荒地", NT, 4);
map4yy.difficulty = 14;
map4yy.noLighting = false;
map4yy.alwaysUnlocked = false;
map4yy.addStartingItems = true;
map4yy.captureWave = 25;
map4yy.localizedName = "永夜荒地";
exports.map4yy = map4yy;

const map5jg = new SectorPreset("极光壁垒", NT, 54);
map5jg.difficulty = 16;
map5jg.noLighting = false;
map5jg.alwaysUnlocked = false;
map5jg.addStartingItems = true;
map5jg.captureWave = 0;
map5jg.localizedName = "极光壁垒";
map5jg.rules = (r) => {
    r.attackMode = true;
}
exports.map5jg = map5jg;

const JC1 = new SectorPreset("教程：获取钛", NT, 39); //JC：教程
JC1.difficulty = 1;
JC1.noLighting = true;
JC1.alwaysUnlocked = false;
JC1.addStartingItems = true;
JC1.captureWave = 0;
JC1.localizedName = "教程：获取钛";
JC1.rules = (r) => {
    r.attackMode = true;
}
exports.JC1 = JC1;

const JC2 = new SectorPreset("教程：获取钍", NT, 76);
JC2.difficulty = 1;
JC2.noLighting = true;
JC2.alwaysUnlocked = false;
JC2.addStartingItems = true;
JC2.captureWave = 0;
JC2.localizedName = "教程：获取钍";
JC2.rules = (r) => {
    r.attackMode = true;
}
exports.JC2 = JC2;

const ZX1 = new SectorPreset("蛇行道", NT, 53); //ZX： 支线
ZX1.difficulty = 20;
ZX1.noLighting = true;
ZX1.alwaysUnlocked = false;
ZX1.addStartingItems = true;
ZX1.captureWave = 31;
ZX1.localizedName = "蛇行道";
exports.ZX1 = ZX1;

const ZX2 = new SectorPreset("地火", NT, 80);
ZX2.difficulty = 25;
ZX2.noLighting = true;
ZX2.alwaysUnlocked = false;
ZX2.addStartingItems = true;
ZX2.captureWave = 13;
ZX2.localizedName = "地火";
ZX2.rules = (r) => {
    r.attackMode = false;
    r.winWave = ZX2.captureWave;
}
exports.ZX2 = ZX2;
