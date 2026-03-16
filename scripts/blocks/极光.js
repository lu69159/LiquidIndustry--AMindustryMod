var damagemin = 30 / 6, damagemax = 3000 / 6,
    beforeTime = 5, durationTime = 12;
var lightRegion, STRegion;
const MAXD = new Stat("maxdamage", StatCat.function);
/////////////////////////////////////////////////////////////
const colorHitBullet = new Effect(14, e => {
    Draw.color(e.color);

    e.scaled(7, s => {
        Lines.stroke(0.5 + s.fout());
        Lines.circle(e.x, e.y, s.fin() * 5);
    });

    Lines.stroke(0.5 + e.fout());

    Angles.randLenVectors(e.id, 5, e.fin() * 15, (x, y) => {
        var ang = Mathf.angle(x, y);
        Lines.lineAngle(e.x + x, e.y + y, ang, e.fout() * 3 + 1);
    });

    Drawf.light(e.x, e.y, 20, e.color, 0.6 * e.fout());
});

/////////////////////////////////////////////////////////////
const RBbullet = new PointLaserBulletType();
RBbullet.sprite = "液体工艺-white-point-laser";
RBbullet.hitEffect = colorHitBullet;
RBbullet.damageInterval = 10;
RBbullet.damage = damagemin;
RBbullet.buildingDamageMultiplier = 0.01;
RBbullet.lifetime = 10;

const JG = extend(ContinuousTurret, "极光", {  
    shootType: RBbullet,
    shootWarmupSpeed: 0.01,
    targetInterval: 30,
    newTargetInterval: 30,
    unitSort: UnitSorts.strongest,
    load(){
        this.super$load();
        lightRegion = Core.atlas.find(this.name + "-light");
        STRegion = Core.atlas.find("液体工艺-sTar");
    },
    setStats() {
        this.super$setStats();
        this.stats.add(MAXD, damagemax * 6, StatUnit.perSecond);
    },
    setBars(){
        this.super$setBars();
        this.addBar("damageprogress", entity => new Bar(
            () => Core.bundle.format("bar.damageprogress"),
            () => Pal.accent,
            () => 1.0 * entity.getDamageProgress())
        );
        this.removeBar("reload");
    }
});
/////////////////////////////////////////////////////////////
JG.buildType = prov(() => {
    let DP = 0, BT = 0;
    return extend(ContinuousTurret.ContinuousTurretBuild, JG, {
        created(){
            this.super$created();
            this.lightColor = Color.valueOf("ff0000");
            this.lastTarget = null;
        },
        canControl(){
            return false;
        },
        getDamageProgress(){
            return DP;
        },
        Rainbow(){
            var R = Color.valueOf("ff0000"),
                G = Color.valueOf("00ff00"),
                B = Color.valueOf("0000ff");
            
            var time = Time.time * 0.001; 
            var cycleTime = 1; //完整循环秒
            var phase = (time % cycleTime) / cycleTime;
            
            if(phase < 0.333) { // R到G
                var progress = phase * 3; 
                this.lightColor = R.cpy().lerp(G, progress);
            } else if(phase < 0.666) { // G到B
                var progress = (phase - 0.333) * 3; 
                this.lightColor = G.cpy().lerp(B, progress);
            } else { // B到R
                var progress = (phase - 0.666) * 3; 
                this.lightColor = B.cpy().lerp(R, progress);
            }
        },
        draw(){
            this.super$draw();
            
            Vars.renderer.lights.add(this.x, this.y, 25 * Vars.tilesize * (0.3 + 0.7 * DP), this.lightColor.cpy().lerp(Color.white, DP), 1);

            Draw.z(Layer.turret+0.1);

            Draw.color(this.lightColor.cpy().lerp(Color.white, DP));
            Draw.rect(lightRegion, this.x, this.y, this.rotation);  

            if(DP > 0){
                let size = Vars.tilesize * this.block.size * DP;
                Draw.z(Layer.turret+0.2);
                Draw.rect(STRegion, this.x, this.y, size, size, Time.time * 1);  
                Draw.rect(STRegion, this.x, this.y, size, size, Time.time * -1);  
            }
            Draw.reset();
        },
        updateTile(){
            this.super$updateTile();
            this.Rainbow();

            if(this.isShooting() && this.efficiency > 0 && this.target != null && !(this.target.dead) && this.target == this.lastTarget){
                BT += Time.delta;
                if(BT >= beforeTime * 60){
                    DP += (1 / 60 / durationTime) * Time.delta;
                    DP = Math.min(1, DP);
                }
            }
            else{
                this.lastTarget = this.target;
                BT = 0;
                DP = 0;
            }
        },
        handleBullet(bullet, offsetX, offsetY, angleOffset) {
            if(bullet != null){
                bullet.type.color = bullet.type.trailColor = bullet.type.lightColor = this.lightColor.cpy().lerp(Color.white, DP);

                bullet.damage = (damagemin + (damagemax - damagemin) * DP) / 7.2  * Math.min(this.efficiency, 1) * bullet.damageMultiplier();

                let shootLength = Mathf.dst(this.unit.x, this.unit.y, this.targetPos.x, this.targetPos.y);

                if(shootLength > this.block.range){
                    bullet.aimX = this.unit.x + (this.targetPos.x - this.unit.x) * (this.block.range / shootLength);
                    bullet.aimY = this.unit.y + (this.targetPos.y - this.unit.y) * (this.block.range / shootLength);
                }

                bullet.time = bullet.lifetime * bullet.type.optimalLifeFract * Math.min(this.shootWarmup, this.efficiency);
                bullet.keepAlive = true;

                this.wasShooting = true;
                this.heat = 1;
            }
        },
        updateBullet(entry){
            return;
        }
    });
});
/////////////////////////////////////////////////////////////

exports.极光 = JG;

