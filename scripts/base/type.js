exports.WallLiquidRouter = (name) => {
    var bottomRegion,Region;
    const wall = extend(Wall, name, {
        load(){
            this.super$load();
            bottomRegion = Core.atlas.find(this.name + "-bottom");
            Region = Core.atlas.find(this.name);
        },
        drawPlanRegion(plan, list){
            Draw.rect(bottomRegion, plan.drawx(), plan.drawy());
            Draw.rect(Region, plan.drawx(), plan.drawy());
        },
        icons(){
            return [bottomRegion, Region];
        }
    });
    wall.update = true;
    wall.buildCostMultiplier = 2.5
    wall.buildType = (() => {
        return extend(Wall.WallBuild, wall, {
            acceptLiquid(source, liquid){
                if(this.liquids.current() == null) return true;
                return (this.liquids.current() == liquid || this.liquids.currentAmount() < 0.2);
            },
            draw(){
                Draw.rect(bottomRegion, this.x, this.y);
                if(this.liquids.current() != null && this.liquids.currentAmount() > 0.001){
                    this.drawLiquid();
                }
                Draw.rect(Region, this.x, this.y);
            },
            drawLiquid(){
                let frame = this.liquids.current().getAnimationFrame();
                let gas = this.liquids.current().gas ? 1 : 0;
                let lq = Vars.renderer.fluidFrames[gas][frame];
                let liquidRegion = Tmp.tr1;
                liquidRegion.set(lq);
                Drawf.liquid(liquidRegion, this.x, this.y, this.liquids.currentAmount() / this.block.liquidCapacity * 1.0, this.liquids.current().color.write(Tmp.c1));
            },
            updateTile(){
                if(this.liquids.current() != null && this.liquids.currentAmount() > 0.01){
                    this.dumpLiquid(this.liquids.current());
                }
                this.super$updateTile();
            }
        });
    });

    return wall;
};

exports.LiquidMassDriver = (name, bulletSize) => {
    var hitEffect = Fx.hitLiquid;
    //液体质驱弹
    const LiquidMassDriverBolt = extend(BulletType, {
        damage: bulletSize * 12.5,
        lifetime: bulletSize * 75,
        collidesTiles: false,
        hitEffect: Fx.hitLiquid,
        despawnEffect: Fx.hitLiquid,
        update(b){
            this.super$update(b);
            var hitDst = 7;
            var data = b.data;

            if(data.to.dead){
                return;
            }
            var baseDst = data.from.dst(data.to),
                dst1 = b.dst(data.from),
                dst2 = b.dst(data.to);
            var intersect = false;

            if(dst1 > baseDst){
                var angleTo = b.angleTo(data.to),
                    baseAngle = data.to.angleTo(data.from);

                if(Angles.near(angleTo, baseAngle, 2)){
                    intersect = true;
                    b.set(data.to.x + Angles.trnsx(baseAngle, hitDst), data.to.y + Angles.trnsy(baseAngle, hitDst));
                }
            }

            if(Math.abs(dst1 + dst2 - baseDst) < 4 && dst2 <= hitDst){
                intersect = true;
            }
            if(intersect){
                data.to.handleLiquidPayload(b, data);
            }
        },
        draw(b){
            this.super$draw(b);
            const orbSize = bulletSize, boilTime = 5;
            var liquid = b.data.liquidType;
            if(liquid.willBoil()){
                Draw.color(liquid.color, Tmp.c3.set(liquid.gasColor), b.time / Mathf.randomSeed(b.id, boilTime));
                Fill.circle(b.x, b.y, orbSize * (b.fin() * 1.1 + 1));
            }
            else{
                Draw.color(liquid.color, Color.white, b.fout() / 100);
                Fill.circle(b.x, b.y, orbSize);
            }
            Draw.reset();
        },
        despawned(b){
            this.super$despawned(b);
            if(!b.data.liquidType.willBoil()){
                hitEffect.at(b.x, b.y, b.rotation(), b.data.liquidType.color);
            }
        },
        hit(b, hitx, hity){
            hitEffect.at(b.x, b.y, b.rotation(), b.data.liquidType.color);
            if(b.data.liquidAmount == 0) return;
            Puddles.deposit(Vars.world.tileWorld(b.x, b.y), b.data.liquidType, 6 + b.data.liquidAmount / 400);
            if(b.data.liquidType.effect != null){
                Damage.status(b.team, b.x, b.y, 4 * Vars.tilesize, b.data.liquidType.effect, bulletSize * 60, true, true);
            };
            if(b.data.liquidType.temperature >= 1 || b.data.liquidType.flammability >= 0.5){
                Fires.create(b.tileOn());
            };
            if(b.data.liquidType.explosiveness >= 0.5){
                Damage.damage(b.team, b.x, b.y, 4 * Vars.tilesize, this.damage, true);
            };
        }
    });

    //子弹DATA
    function LiquidDriverBulletData(){
        const LiquidDriverBulletData = {
            from: null,
            to: null,
            liquidType: null,
            liquidAmount: 0,
            init(){
                this.liquidType = null;
                this.liquidAmount = 0;
            },
            reset(){
                this.from = null;
                this.to = null;
                this.liquidType = null;
            }
        };
        return LiquidDriverBulletData;
    };

    //质驱部分
    var liquidRegion, topRegion;
    const LiquidMassDriver = extend(MassDriver, name, {
        receiveEffect: Fx.hitLiquid,
        group: BlockGroup.liquids,
        knockback: 1.5,
        minDistribute: 400,
        hasLiquids: true,
        outputsLiquid: true,
        hasItems: false,
        noUpdateDisabled: false,
        load(){
            this.super$load();
            liquidRegion = Core.atlas.find(this.name + "-liquid");
            topRegion = Core.atlas.find(this.name + "-top");
        },
        setBars(){
            this.super$setBars();
            this.removeBar("items");
        },
        drawPlanRegion(plan, list){
            this.super$drawPlanRegion(plan, list);
            Draw.color(Color.white);
            Draw.rect(topRegion, plan.drawx(), plan.drawy());
            Draw.reset();
        }
    });

    LiquidMassDriver.buildType = (() => {
        return extend(MassDriver.MassDriverBuild, LiquidMassDriver, {
            created(){
                this.super$created();
                this.waitingShooter = -1; //POS
            },
            liquidLinkValid(){
                if(this.link == -1) return false;
                var other = Vars.world.build(this.link);
                return other != null && other.isValid() && other.block == this.block && other.team == this.team && this.within(other, this.block.range);
            },
            liquidShooterValid(){
                if(this.waitingShooter == -1) return false;
                var other = Vars.world.build(this.waitingShooter);
                return other != null && other.isValid() && other.block == this.block && other.team == this.team && other.link == this.pos() && this.within(other, this.block.range);
            },
            setShooter(shooter){
                if(shooter == null){
                    this.waitingShooter = -1;
                }
                else{
                    this.waitingShooter = shooter.pos();
                }      
            },
            onConfigureBuildTapped(other){
                if(this == other){
                    if(this.link == -1){
                        Vars.control.input.config.hideConfig();
                    }
                    else{
                        this.configure(-1);
                    }
                    return false;
                }
                else if(this.link == other.pos()){
                    this.configure(-1);
                    return false;
                }
                else if(this.block == other.block && other.dst(this.tile) <= this.block.range && this.team == other.team && this.liquidShooterValid() == false && other.liquidShooterValid() == false && other.liquidLinkValid() == false){
                    this.configure(other.pos());
                    return false;
                }

                return true;
            },
            configured(builder, value){
                if(builder != null && builder.isPlayer()){
                    this.updateLastAccess(builder.getPlayer());
                }

                if(value == -1){
                    let oth = Vars.world.build(this.link);
                    if(oth != null) oth.setShooter(null);
                    this.link = -1;
                }
                //POS返回坐标的BUG
                else if(typeof value === 'object' && value.x !== undefined && value.y !== undefined){
                    // 如果是坐标对象，尝试从坐标获取建筑
                    let oth = Vars.world.tileWorld(value.x, value.y);
                    if(oth != null && oth.build != null){
                        oth.setShooter(this);
                        this.link = oth.pos();
                    }
                }
                //
                else{
                    let oth = Vars.world.build(value);
                    if(oth != null) oth.setShooter(this);
                    this.link = value;
                }
            },
            drawConfigure(){
                var sin = Mathf.absin(Time.time, 6, 1);

                Draw.color(Pal.accent);
                Lines.stroke(1);
                Drawf.circles(this.x, this.y, (this.block.size / 2 + 1) * Vars.tilesize + sin - 2, Pal.accent);

                if(this.liquidLinkValid()){
                    var shooter = Vars.world.build(this.link);
                    Drawf.circles(shooter.x, shooter.y, (shooter.block.size / 2 + 1) * Vars.tilesize + sin - 2, Pal.place);
                    Drawf.arrow(this.x, this.y, shooter.x, shooter.y, (this.block.size / 2 + 1) * Vars.tilesize + sin, 4 + sin, Pal.accent);
                }

                Drawf.dashCircle(this.x, this.y, this.block.range, Pal.accent);
            },
            acceptItem(source, item){
                return false;
            },
            acceptLiquid(source, liquid){
                return this.liquidLinkValid() && this.state == MassDriver.DriverState.shooting && !liquid.gas && (this.liquids.current() == null || (this.liquids.current() == liquid && this.liquids.currentAmount() < this.block.liquidCapacity) || this.liquids.currentAmount() < this.block.minDistribute);
            },
            canDumpLiquid(to, liquid){
                return !(this.liquidLinkValid());
            },
            draw(){
                this.super$draw();

                if(this.liquids.current() != null){
                    let color = Color.valueOf("000000FF").cpy().lerp(this.liquids.current().color, this.liquids.currentAmount() / this.block.liquidCapacity);
                    Draw.color(color);
                    Draw.rect(liquidRegion,
                    this.x + Angles.trnsx(this.rotation + 180, this.reloadCounter * this.block.knockback),
                    this.y + Angles.trnsy(this.rotation + 180, this.reloadCounter * this.block.knockback), this.rotation - 90);
                };

                Draw.color(Color.white);

                Draw.rect(topRegion,
                this.x + Angles.trnsx(this.rotation + 180, this.reloadCounter * this.block.knockback),
                this.y + Angles.trnsy(this.rotation + 180, this.reloadCounter * this.block.knockback), this.rotation - 90);
            },
            updateTile(){
                var link = Vars.world.build(this.link);
                var hasLink = this.liquidLinkValid();
                var shooter = Vars.world.build(this.waitingShooter);
                var hasShooter = this.liquidShooterValid();

                if(hasLink){
                    this.link = link.pos();
                }
                if(hasShooter){
                    this.waitingShooter = shooter.pos();
                }
                if(this.reloadCounter > 0){
                    this.reloadCounter = Mathf.clamp(this.reloadCounter - this.edelta() / this.block.reload);
                }
                
                if(this.state == MassDriver.DriverState.idle){
                    if(hasShooter){
                        this.state = MassDriver.DriverState.accepting;
                    }
                    else if(hasLink){
                        this.state = MassDriver.DriverState.shooting;
                    }
                }

                if(this.state == MassDriver.DriverState.accepting){
                    if(!hasShooter){
                        this.setShooter(null);
                        this.state = MassDriver.DriverState.idle;
                        return;
                    }
                    var shooterRotation = this.angleTo(shooter);
                    this.rotation = Angles.moveToward(this.rotation, shooterRotation, this.block.rotateSpeed * this.efficiency);
                }

                if(this.state == MassDriver.DriverState.idle || this.state == MassDriver.DriverState.accepting){
                    this.dumpLiquid(this.liquids.current(), 1);
                }

                if(this.efficiency <= 0){
                    return;
                }

                if(this.state == MassDriver.DriverState.shooting){
                    if(!hasLink){
                        this.link = -1;
                        this.state = MassDriver.DriverState.idle;
                        return;
                    }
                    var targetRotation = this.angleTo(link);
                    this.rotation = Angles.moveToward(this.rotation, targetRotation, this.block.rotateSpeed * this.efficiency);

                    if(this.liquidLinkValid() && this.liquids.current() != null && this.liquids.currentAmount() >= this.block.minDistribute &&  // 连接有效，液体不为空，发射量足够
                    (link.liquids.current() == null || (link.liquids.current() == this.liquids.current() && link.block.liquidCapacity - link.liquids.currentAmount() >= this.block.minDistribute) || (link.liquids.currentAmount() < 1))){  // 目标的液体为空/相且有容量接纳/不同但量足够少(少于1)
                        var other = link;

                        if(this.reloadCounter <= 0.0001){
                            
                            if(other.state == MassDriver.DriverState.accepting &&
                            Angles.near(this.rotation, targetRotation, 2) && 
                            Angles.near(other.rotation, targetRotation + 180, 2)){
                                this.fireLiquid(other);
                                const timeToArrive = Math.min(this.block.bulletLifetime, this.dst(other) / this.block.bulletSpeed);
                                Time.run(timeToArrive, () => {
                                    other.state = MassDriver.DriverState.idle;
                                });
                                this.state = MassDriver.DriverState.idle;
                            }
                        }
                    }
                }
            },
            fireLiquid(target){
                this.reloadCounter = 1;

                var data = LiquidDriverBulletData();
                    data.from = this;
                    data.to = target;

                let maxTransfer = Math.min(this.liquids.currentAmount(), target.block.liquidCapacity - target.liquids.currentAmount());
                data.liquidAmount = maxTransfer;
                this.liquids.remove(this.liquids.current(), maxTransfer);
                data.liquidType = this.liquids.current();

                let angle = this.tile.angleTo(target);

                LiquidMassDriverBolt.create(this, this.team,
                this.x + Angles.trnsx(angle, this.block.translation), this.y + Angles.trnsy(angle, this.block.translation),
                angle, -1, this.block.bulletSpeed, this.block.bulletLifetime, data);

                this.block.shootEffect.at(this.x + Angles.trnsx(angle, this.block.translation), this.y + Angles.trnsy(angle, this.block.translation), angle);
                this.block.smokeEffect.at(this.x + Angles.trnsx(angle, this.block.translation), this.y + Angles.trnsy(angle, this.block.translation), angle);
                Effect.shake(this.block.shake, this.block.shake, this);
                this.block.shootSound.at(this.tile, Mathf.random(0.9, 1.1));
            },
            handleLiquidPayload(bullet, data){
                this.liquids.add(data.liquidType, data.liquidAmount);
                data.liquidAmount = 0;
                if(this.liquids.current() !=null && this.liquids.currentAmount() >= 1.5 * this.block.liquidCapacity){
                    var RM = this.liquids.currentAmount() - 1.5 * this.block.liquidCapacity;
                    this.liquids.remove(this.liquids.current(), RM);  //超额接收液体时最多接收1.5倍容量
                }
                
                Effect.shake(this.block.shake, this.block.shake, this);
                this.block.receiveEffect.at(bullet);

                this.reloadCounter = 1;
                bullet.remove();
            },
            write(write){
                this.super$write(write);
                write.i(this.waitingShooter);
            },
            read(read, revision){
                this.super$read(read, revision);
                this.waitingShooter = read.i();
            }
        })
    });
    return LiquidMassDriver;
};

exports.StatusProjector = (name, status) => {        //支持单个/多个状态效果
    if(name == null) throw new Error("name为空");
    if(status == null) throw new Error("status为空");

    var isSeq;
    let stflag = true;
    if(status instanceof StatusEffect){
        isSeq = false;
    }
    else if(status instanceof Seq){
        status.each(s => {
            if(!(s instanceof StatusEffect)){
                stflag = false;
            }
        });
        isSeq = true;
    }
    else{
        stflag = false;
    }

    if(!stflag) throw new Error("status参数错误");

    const statusStat = new Stat("status", StatCat.function),  //状态效果
        statusTime = new Stat("statustime", StatCat.function), //状态施加间隔
        statusDuration = new Stat("statusduration", StatCat.function);  //状态持续时间
    
    //useTime -> 状态持续时间
    //reload -> 施加状态间隔时间
    const SP = extend(OverdriveProjector, name, {
        setStats(){
            this.super$setStats();
            this.stats.remove(Stat.speedIncrease);
            this.stats.remove(Stat.productionTime);

            if(isSeq){
                var statusStr = "";
                status.each(s => {
                    statusStr += (s.hasEmoji() ? s.emoji() : "") + "[stat]" + s.localizedName + " ";
                });
                this.stats.add(statusStat, statusStr);
            }
            else{
                this.stats.add(statusStat, (status.hasEmoji() ? status.emoji() : "") + "[stat]" + status.localizedName);
            }

            this.stats.add(statusTime, this.reload / 60, StatUnit.seconds);
            this.stats.add(statusDuration, this.useTime / 60, StatUnit.seconds);

        },
        setBars(){
            this.super$setBars();
            this.removeBar("boost");
        },
        drawPlace(x, y, rotation, valid){
            this.drawPotentialLinks(x, y);
            this.drawOverlay(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, rotation);
            Drawf.dashCircle(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.range, Pal.accent);
        }
    });

    SP.hasBoost = false;
    SP.emitLight = true;
    SP.hasItems = false;

    //多状态效果时使用白色
    var color = (isSeq)?Color.valueOf("FFFFFF"):status.color; 
    const SE = new WaveEffect();

    Events.on(ContentInitEvent, cons(e => {
        SE.sizeFrom = 0;
        SE.sizeTo = SP.range;
        SE.strokeFrom = 3;
        SE.strokeTo = 0;
        SE.colorFrom = color;
        SE.colorTo = color
        SE.sides = 12;
        SE.lifetime = 60;

        SP.lightRadius = SP.range * 1.1;
    }));

    SP.buildType = prov(() => {
        var targets = new Seq();

        return extend(OverdriveProjector.OverdriveBuild, SP, {
            created(){
                this.super$created();
                this.refresh = 0;
                this.sflag = false;
            },
            updateTile(){
                if(this.efficiency > 0 && (this.refresh += Time.delta * this.efficiency) >= this.block.reload){
                    targets.clear();
                    this.refresh = 0;
                    this.sflag = true;
                    Units.nearby(this.team, this.x, this.y, this.block.range, u => {
                        targets.add(u);
                    });     
                }

                if(this.efficiency > 0 && this.sflag){
                    targets.each(target => {
                        if(isSeq){
                            status.each(s => {
                                target.apply(s, this.block.useTime);
                            });
                        }
                        else{
                            target.apply(status, this.block.useTime);
                        }  
                    });
                    this.sflag = false;
                    SE.at(this.x, this.y);
                }
            },
            drawSelect(){
                Drawf.dashCircle(this.x, this.y, this.block.range, Pal.accent);
            },
            draw(){
                Draw.rect(this.block.region, this.x, this.y, 0);

                let f = 1 - (Time.time / 100) % 1;
                Draw.alpha(1);
                Draw.color(color);
                Lines.stroke((2 * f + 0.2) * this.efficiency);
                Lines.square(this.x, this.y, Math.min(1 + (1 - f) * this.block.size * Vars.tilesize / 2, this.block.size * Vars.tilesize/2));

                Draw.reset();
            },
            write(write){
                write.f(this.refresh);
                write.bool(this.sflag);
            },
            read(read, revision){
                this.refresh = read.f();
                this.sflag = read.bool();
            }
        });
    });

    return SP;
};

//其实就改了颜色和Units.nearby
exports.EnemyStatusProjector = (name, status) => {        //支持单个/多个状态效果
    if(name == null) throw new Error("name为空");
    if(status == null) throw new Error("status为空");

    var isSeq;
    let stflag = true;
    if(status instanceof StatusEffect){
        isSeq = false;
    }
    else if(status instanceof Seq){
        status.each(s => {
            if(!(s instanceof StatusEffect)){
                stflag = false;
            }
        });
        isSeq = true;
    }
    else{
        stflag = false;
    }

    if(!stflag) throw new Error("status参数错误");

    const statusStat = new Stat("status", StatCat.function),  //状态效果
        statusTime = new Stat("statustime", StatCat.function), //状态施加间隔
        statusDuration = new Stat("statusduration", StatCat.function);  //状态持续时间
    
    //useTime -> 状态持续时间
    //reload -> 施加状态间隔时间
    const SP = extend(OverdriveProjector, name, {
        setStats(){
            this.super$setStats();
            this.stats.remove(Stat.speedIncrease);
            this.stats.remove(Stat.productionTime);

            if(isSeq){
                var statusStr = "";
                status.each(s => {
                    statusStr += (s.hasEmoji() ? s.emoji() : "") + "[stat]" + s.localizedName + " ";
                });
                this.stats.add(statusStat, statusStr);
            }
            else{
                this.stats.add(statusStat, (status.hasEmoji() ? status.emoji() : "") + "[stat]" + status.localizedName);
            }

            this.stats.add(statusTime, this.reload / 60, StatUnit.seconds);
            this.stats.add(statusDuration, this.useTime / 60, StatUnit.seconds);

        },
        setBars(){
            this.super$setBars();
            this.removeBar("boost");
        },
        drawPlace(x, y, rotation, valid){
            this.drawPotentialLinks(x, y);
            this.drawOverlay(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, rotation);
            Drawf.dashCircle(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.range, Pal.accent);
        }
    });

    SP.hasBoost = false;
    SP.emitLight = true;
    SP.hasItems = false;

    //多状态效果时使用黑色
    var color = (isSeq)?Color.valueOf("000000"):status.color; 
    const SE = new WaveEffect();

    Events.on(ContentInitEvent, cons(e => {
        SE.sizeFrom = 0;
        SE.sizeTo = SP.range;
        SE.strokeFrom = 3;
        SE.strokeTo = 0;
        SE.colorFrom = color;
        SE.colorTo = color
        SE.sides = 12;
        SE.lifetime = 60;

        SP.lightRadius = SP.range * 1.1;
    }));

    SP.buildType = prov(() => {
        var targets = new Seq();

        return extend(OverdriveProjector.OverdriveBuild, SP, {
            created(){
                this.super$created();
                this.refresh = 0;
                this.sflag = false;
            },
            updateTile(){
                if(this.efficiency > 0 && (this.refresh += Time.delta * this.efficiency) >= this.block.reload){
                    targets.clear();
                    this.refresh = 0;
                    this.sflag = true;
                    Units.nearbyEnemies(this.team, this.x, this.y, this.block.range, u => {
                        targets.add(u);
                    });     
                }

                if(this.efficiency > 0 && this.sflag){
                    targets.each(target => {
                        if(isSeq){
                            status.each(s => {
                                target.apply(s, this.block.useTime);
                            });
                        }
                        else{
                            target.apply(status, this.block.useTime);
                        }  
                    });
                    this.sflag = false;
                    SE.at(this.x, this.y);
                }
            },
            drawSelect(){
                Drawf.dashCircle(this.x, this.y, this.block.range, Pal.accent);
            },
            draw(){
                Draw.rect(this.block.region, this.x, this.y, 0);

                let f = 1 - (Time.time / 100) % 1;
                Draw.alpha(1);
                Draw.color(color);
                Lines.stroke((2 * f + 0.2) * this.efficiency);
                Lines.square(this.x, this.y, Math.min(1 + (1 - f) * this.block.size * Vars.tilesize / 2, this.block.size * Vars.tilesize/2));

                Draw.reset();
            },
            write(write){
                write.f(this.refresh);
                write.bool(this.sflag);
            },
            read(read, revision){
                this.refresh = read.f();
                this.sflag = read.bool();
            }
        });
    });

    return SP;
};

exports.UnloaderProjector = (name, range) => { //目前有神秘颜色BUG不能用
    var baseColor = Pal.accent;
    const UP = extend(Unloader, name, {
        range: range,
        drawPlace(x, y, rotation, valid){
            this.super$drawPlace(x, y, rotation, valid);
            Drawf.dashCircle(x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.range, baseColor);
            Vars.indexer.eachBlock(Vars.player.team(), x * Vars.tilesize + this.offset, y * Vars.tilesize + this.offset, this.range, other => other.canUnload(), other => Drawf.selected(other, Tmp.c1.set(baseColor).a(Mathf.absin(4, 1))));
        },
        setStats(){
            this.super$setStats();
            this.stats.add(Stat.range, this.range / Vars.tilesize, StatUnit.blocks);
        }
    });
    UP.buildType = prov(() => extend(Unloader.UnloaderBuild, UP, {
        range(){
            return this.block.range;
        },
        drawSelect(){
            Drawf.dashCircle(this.x, this.y, this.block.range, baseColor);
        },
        onProximityUpdate(){
            this.super$onProximityUpdate();
            Pools.freeAll(this.possibleBlocks, true);
            this.possibleBlocks.clear();

            Vars.indexer.eachBlock(this, this.block.range, boolf(other => !(other instanceof CoreBuild || other instanceof StorageBuild) || (other.canUnload() && (this.block.allowCoreUnload || !(other instanceof CoreBuild || other instanceof StorageBuild)) && other.items != null)), cons(other => {
                var pb = Pools.obtain(Unloader.ContainerStat.class, function(){
                     return new Unloader.ContainerStat;
                });
                try {
                    // 使用反射访问私有字段
                    var buildingField = Unloader.ContainerStat.class.getDeclaredField("building");
                    buildingField.setAccessible(true);
                    buildingField.set(pb, other);
                    
                    var notStorageField = Unloader.ContainerStat.class.getDeclaredField("notStorage");
                    notStorageField.setAccessible(true);
                    notStorageField.set(pb, !(other instanceof CoreBuild || other instanceof StorageBuild));
                } catch (e) {
                    e.printStackTrace();
                }
                //TODO store the partial canLoad/canUnload?
                this.possibleBlocks.add(pb);
            }));
        }
    }));
};

//以下是单位相关/////////////////////////////////////////////////////////////////////////////

exports.HoverTank = (name) => {

    const 倍乘级单位直构工厂 = require("LI/LIblockslib").倍乘级单位直构工厂;
    const 多幂级单位直构工厂 = require("LI/LIblockslib").多幂级单位直构工厂;
    const 无量级单位直构工厂 = require("LI/LIblockslib").无量级单位直构工厂;

    const HT = extend(UnitType, name, {
        getDependencies(cons){ //用来防止直构工厂被添加到单位研究要求中
            Vars.content.blocks().each(block => {
                if(block != 倍乘级单位直构工厂 && block != 多幂级单位直构工厂 && block != 无量级单位直构工厂 && block instanceof Reconstructor){
                    block.upgrades.each(recipe => {
                        if(recipe[1] == this){
                            cons.get(block);
                        }
                    });
                }
            });

            let researchReqs = this.researchRequirements();
            for(let i = 0; i < researchReqs.length; i++){
                let stack = researchReqs[i];
                cons.get(stack.item);
            }
        }
    });
    HT.constructor = prov(() => extend(UnitTypes.elude.constructor.get().class, {}));

    return HT;
};

exports.HealCommand = () => {
    //healAI:寻找残血单位治疗，优先寻找高血量、掉血多的单位，当附近有敌人且单位血量高于50%时优先后退
    function healAI(){
        const healRange = 480;
        const fleeRange = 200;
        const retreatDst = 160;
        const retreatDelay = Time.toSeconds * 1;
        const healAI = extend(DefenderAI, {
            retreatTimer: 0,
            avoid: null,
            damagedTarget: null,
            escape: false,
            canEscape(){
                return this.avoid != null && (this.target == null || this.target.dead || this.target.health / this.target.maxHealth > 0.5);
            },
            updateMovement(){
                if(this.timer.get(this.timerTarget4, 40)){
                    this.avoid = Units.closestTarget(this.unit.team, this.unit.x, this.unit.y, fleeRange);
                    this.escape = this.canEscape();
                }           
                if(this.escape){
                    if((this.retreatTimer += Time.delta) >= retreatDelay){
                            var core = this.unit.closestCore();
                            if(core != null && !this.unit.within(core, retreatDst)){
                                this.moveTo(core, retreatDst);
                            }
                    }
                }
                else{
                    this.retreatTimer = 0;
                    if(this.target instanceof Unit && this.target.team == this.unit.team){
                        if(!this.target.within(this.unit, this.unit.type.range * 0.65)){
                            this.moveTo(this.target, this.unit.type.range * 0.65);
                        }
                    }
                }
            },
            updateTargeting(){
                if(this.timer.get(this.timerTarget, 15)){
                    this.damagedTarget = Units.closest(this.unit.team, this.unit.x, this.unit.y, healRange, u => !u.dead && u.type != this.unit.type && u.health < u.maxHealth, (u, tx, ty) =>  -u.maxHealth - (u.maxHealth - u.health) + Mathf.dst2(u.x, u.y, tx, ty) / 6400);
                }

                if(this.damagedTarget == null){
                    this.super$updateTargeting();
                }
                else{
                    this.target = this.damagedTarget;
                }
            }
        });
        return healAI;
    };
    const HC = new UnitCommand("heal", "add", u => new healAI());
    return HC;
};
