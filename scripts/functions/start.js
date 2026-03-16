const mod = Vars.mods.locateMod("液体工艺");
Events.on(EventType.ClientLoadEvent, cons(e => {
    // 主对话框
    var dialog = new BaseDialog("游玩前提示");

    // 主内容区域
    dialog.cont.pane((() => {
        let table = new Table();
        table.add("测试版目前已知的问题：").left().wrap().width(500).maxWidth(500).pad(4).labelAlign(Align.left);
        table.row();
        table.add(Core.bundle.format("PROBLEM")).left().wrap().width(500).maxWidth(500).pad(4).labelAlign(Align.left);
        table.row();
        return table;
    })()).grow().center().maxWidth(500);

    dialog.buttons.button("[accent]更新日志", run(() => {
        var updatelog= new BaseDialog("更新日志");
        updatelog.cont.pane((() => {
            var table = new Table();
            table.add(mod.root.child("updatelog.txt").readString("UTF-8")).
            left().
            growX().
            wrap().
            width(1200).
            maxWidth(1200).
            pad(4).
            labelAlign(Align.left);
            table.row();
            return table;
        })()).
        grow().
        center().
        maxWidth(540);
        updatelog.buttons.defaults().size(128, 64);
        updatelog.addCloseButton();
        updatelog.show();
    })).size(128, 64);

    dialog.buttons.button("@close", run(() => {
        dialog.hide()
    })).size(128, 64);

    dialog.show();
}));