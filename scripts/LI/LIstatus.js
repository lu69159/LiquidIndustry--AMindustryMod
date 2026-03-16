function isBadEffect(effect){
    if(effect instanceof StatusEffect){
        let d=effect.damageMultiplier,
            h=effect.healthMultiplier,
            r=effect.reloadMultiplier,
            s=effect.speedMultiplier,
            b=effect.buildSpeedMultiplier,
            disarm=effect.disarm,
            damage=effect.damage,
            idamage=effect.intervalDamage,
            tdamage=effect.transitionDamage,
            AllMultiplier=d*h*r*s*b;
        if(damage==null||damage==undefined) damage=0;
        if(idamage==null||idamage==undefined) idamage=0;
        if(tdamage==null||tdamage==undefined) tdamage=0;

        if(damage>0||idamage>0||tdamage>0||AllMultiplier<1||disarm===true){
            return true;
        }
        else{
            return false;
        }
    }
    return false;
}
///////////////////////////////////////////////////////////////

const badeffects = new Seq();
Events.on(ContentInitEvent, cons(e => {
    Vars.content.getBy(ContentType.status).each(e => {
        if(isBadEffect(e)){
            if(!badeffects.contains(e)){
                badeffects.add(e);
            }
        }
    });
}));

///////////////////////////////////////////////////////////////

const baseSize = 26; //王座为例
const 神佑 = extend(StatusEffect, "神佑", {
    init(){
        Vars.content.getBy(ContentType.status).each(e => {
            if(isBadEffect(e)){
                if(!badeffects.contains(e)){
                    badeffects.add(e);
                }
            }
        });
        badeffects.each(e => {
            if(!this.opposites.contains(e)){
                this.handleOpposite(e);
            }
        });
    },
    draw(unit){
        this.super$draw(unit);

        Draw.z(Layer.effect);
        Draw.color(Color.valueOf("FFFFFF80"));
        Draw.rect(
            Core.atlas.find("液体工艺-神佑光环"),
            unit.x + Angles.trnsx(unit.rotation - 90, 0, 0),
            unit.y + Angles.trnsy(unit.rotation - 90, 0, 0),
            128 * unit.hitSize / baseSize,
            128 * unit.hitSize / baseSize,
            Time.time * 1);
    },
    handleOpposite(other){
        this.opposites.add(other);
        this.trans(other, (unit, result, time) => {
            if(result.time <= 0){
                result.time = time;
                result.effect = other;
            }
        });
    },
    applied(unit, time, extend){   
        badeffects.each(e => {
            if(!this.opposites.contains(e)){
                this.handleOpposite(e);
            }
            if(unit.hasEffect(e)){
                unit.unapply(e);
            }
        });
        this.super$applied(unit, time, extend)
    }
});
exports.神佑 = 神佑;


const 管制 = new StatusEffect("管制");
exports.管制 = 管制;


const 解冻 = extend(StatusEffect, "解冻", {
    init(){
        this.super$init();
        if(!this.opposites.contains(StatusEffects.freezing)){
            this.handleOpposite(StatusEffects.freezing);
        }  
    },
    handleOpposite(other){
        this.opposites.add(other);
        this.trans(other, (unit, result, time) => {
            return;
        });
    },
    applied(unit, time, extend){   
        if(unit.hasEffect(StatusEffects.freezing)){
            unit.unapply(StatusEffects.freezing);          
        }    
    }
});
exports.解冻 = 解冻;
