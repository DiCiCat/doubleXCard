class XCard extends Application {
    constructor(imagePath) {
        super();
        this.imagePath = imagePath;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/doubleXCard/templates/XCard.html";
        options.title = "XCard.WindowTitle";
        options.id = "XCard";
        options.resizable = false;
        if (game.settings.get("XCard", "imageToggle")) {
            options.height = game.settings.get("XCard", "imageSize").height + 75;
            options.width = game.settings.get("XCard", "imageSize").width + 50;
        } else {
            options.height = "auto";
            options.width = "auto";
        }
        return options;
    }

    async getData() {
        const imageToggle = game.settings.get("XCard", "imageToggle");

        let imageWidth = 0;
        let imageHeight = 0;
        if (imageToggle) {
            const tex = await loadTexture(this.imagePath);
            imageWidth = tex.width;
            imageHeight = tex.height;
        }

        return {
            imageToggle: imageToggle,
            imagePath: this.imagePath,
            imageWidth: imageWidth,
            imageHeight: imageHeight
        }
    }
}

Hooks.on('getSceneControlButtons', function (hudButtons) {
    const xCardIcon = game.i18n.localize("XCard.ButtonFAIcon");
    const xCardIcon2 = game.i18n.localize("XCard.ButtonFAIcon2");
    const group = hudButtons.find(b => b.name === "token");
    if (!group) return;

    group.tools.push(
        {
            name: "XCard1",
            title: "Orange",
            icon: xCardIcon,
            button: true,
            onClick: async () => {
                const path = game.settings.get("XCard", "imagePath");
                let xc = new XCard(path);
                xc.render(true);
                game.socket.emit("module.XCard", { event: "XCard1" });
            }
        },
        {
            name: "XCard2",
            title: "Red",
            icon: xCardIcon2,
            button: true,
            onClick: async () => {
                const path = game.settings.get("XCard", "imagePath2");
                let xc = new XCard(path);
                xc.render(true);
                game.socket.emit("module.XCard", { event: "XCard2" });
            }
        }
    );
});

Hooks.once('ready', async function () {
    game.socket.on("module.XCard", data => {
        let path = (data.event === "XCard1") ?
            game.settings.get("XCard", "imagePath") :
            game.settings.get("XCard", "imagePath2");

        let xc = new XCard(path);
        xc.render(true);
    });

    game.settings.register("XCard", "imageToggle", {
        name: "XCard.Settings.ImageToggleName",
        hint: "XCard.Settings.ImageToggleHint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register("XCard", "imageSize", {
        config: false,
        type: Object,
        default: { "width": 300, "height": 500 }
    });

    game.settings.register("XCard", "imagePath", {
        name: "XCard.Settings.ImagePathName1",
        hint: "XCard.Settings.ImagePathHint1",
        scope: "world",
        config: true,
        type: String,
        default: "",
        onChange: async value => {
            const tex = await loadTexture(value);
            await game.settings.set("XCard", "imageSize", { width: tex.width, height: tex.height });
        }
    });

    game.settings.register("XCard", "imagePath2", {
        name: "XCard.Settings.ImagePathName2",
        hint: "XCard.Settings.ImagePathHint2",
        scope: "world",
        config: true,
        type: String,
        default: "",
        onChange: async value => {
            const tex = await loadTexture(value);
            await game.settings.set("XCard", "imageSize", { width: tex.width, height: tex.height });
        }
    });

    if (game.settings.get("XCard", "imageToggle")) {
        const tex = await loadTexture(game.settings.get("XCard", "imagePath"));
        await game.settings.set("XCard", "imageSize", { width: tex.width, height: tex.height });
    }
});

