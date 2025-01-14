import electron = require("@electron/remote");
import fs = require("node:fs");

export type Route = { name: string; route: string; component(): string; rpc?: string; extra?(): void; };

const Router = {
    isTransitioning: false,
    routes: [] as Route[],
    history: {
        list: [] as string[],
        async go(path: string) {
            window.logger.debug( "[ROUTER] Replacing path to", path );

            this.list.push( path );
            const route = Router.routes.find((r) => r.route == path);
            Router.isTransitioning = true;

            if (!route) return window.engine.loadUI(Router.routes.find((r) => r.route == "/empty_route"));
            await window.engine.loadUI( route );
        },
        async goBack() {
            if (this.list.length <= 1 || Router.isTransitioning) return;
            window.logger.debug( "[ROUTER] Going back." );
            
            this.list.pop();
            if (!this.list[this.list.length - 1]) return;
            const route = Router.routes.find((r) => r.route == this.list[this.list.length - 1]);
            if (!route) return window.engine.loadUI(Router.routes.find((r) => r.route == "/empty_route"), true);
            
            Router.isTransitioning = true;
            await window.engine.loadUI( route, true );
        },
    },
};

const sounds = JSON.parse(fs.readFileSync( __dirname + "/src/sound_definitions.json" , "utf-8" ));
for (let sound in sounds) for (const s of sounds[sound].sounds) new Audio( "assets/sounds/" + s.name );
const Sound = {
    play: (id) => {
        window.logger.debug( "[SOUND] Sound with id '" + id + "' has been requested." );
        if (
            sounds.hasOwnProperty(id)
            && sounds[id].sounds.length > 0
        ) {
            const sound = sounds[id];
            const randomSound = sound.sounds[Math.floor( Math.random() * sound.sounds.length )].name;
            const audio = new Audio( "assets/sounds/" + randomSound );
            audio.play();
        };
    },
};

const Logger: Pick<typeof console,"info" | "debug" | "error"> = {
    info: (...data) => console.log(
		"\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[INFO] \x1B[0m-", ...data,
	),
    debug: (...data) => {
        if (window.settings.get( "debug" ))
        console.log(
            "\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[DEBUG] \x1B[0m-", ...data,
        );
    },
    error: (...data) => console.log(
		"\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[31m\x1B[1m[ERROR] \x1B[0m-", ...data,
	),
};

let toastQueue = [];
const sendToast = async(options) => {
    window.functions.onClick[options.id] = options?.onClick;
    const toast = document.getElementById( "toast" );
    toast.className = "toast toastLeaving";
    await new Promise((res) => setTimeout(() => res(), 0.25 * 1000));
    toast.className = "toast toastEntering";
    Sound.play( "ui.toast_in" );
    toast.innerHTML = (
        `<div class="toastElement" onClick="window.functions.onClick['${options.id}']();">
            <div class="toastElement_">
                ${
                    options?.icon
                    ? `<img src="${options?.icon}" draggable="false" style="height: 36px; width: 36px; image-rendering: pixelated; margin-right: 1rem;">`
                    : ""
                }
                <div>
                    <span class="toastHeader">${options.title}</span>
                    <span class="toastSubtitle">${options.body}</span>
                </div>
            </div>
        </div>`
    );
    
    await new Promise<void>((res) => setTimeout(() => res(), options.timeout * 1000));
    const toastOptions = toastQueue[0];
    if (toastOptions.id == options.id) {
        toast.className = "toast toastLeaving";
        Sound.play( "ui.toast_out" );
        await new Promise<void>((res) => setTimeout(() => res(), 0.5 * 1000));
    };

    delete window.functions.onClick[options.id];
};

const Engine = {
    loadUI: async (route: Route, isBack = false) => {
        const app = document.getElementById( "app" );
        app.className = isBack ? "uiLeavingBack" : "uiLeaving";
        await new Promise<void>((res) => setTimeout(() => res(), 0.2 * 1000)); //wait for 400 milliseconds
        app.className = isBack ? "uiEnteringBack" : "uiEntering";
        app.innerHTML = route.component();
        if (route?.extra) route.extra();
        const back = document.getElementById( "back" );
        const settings = document.getElementById( "settings" );
        if (back) back.addEventListener( "click", () => { window.sound.play( 'ui.click' ); Router.history.goBack(); } );
        if (settings) settings.addEventListener( "click", () => { window.sound.play( 'ui.click' ); Router.history.go( "/settings" ) } );

	    const currentWindow = electron.getCurrentWindow();
        const closeApp = document.getElementById( "closeApp" );
        const maximizeApp = document.getElementById( "maximizeApp" );
        const minimizeApp = document.getElementById( "minimizeApp" );
        if (closeApp) closeApp.addEventListener( "click", () => electron.app.exit());
        if (maximizeApp) maximizeApp.addEventListener( "click", () => currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize());
        if (minimizeApp) minimizeApp.addEventListener( "click", () => currentWindow.minimize());

        await new Promise<void>((res) => setTimeout(() => res(), 0.25 * 1000));
        Router.isTransitioning = false;
    },
    loadModal: (component: string) => document.getElementById( "popup" ).innerHTML = component,
    sendToast: ({ title = "", body = "", icon = null, timeout = 4, instant = false, onClick = () => {} }) => {
        const id = Date.now();
        if (instant) toastQueue = [{ id, title, body, icon, timeout, onClick }, ...toastQueue];
        else toastQueue.push({ id, title, body, icon, timeout, onClick });

        const interval = setInterval(
            async() => {
                const options = toastQueue[0];
                if (options.id == id) {
                    clearInterval(interval);

                    await sendToast(options);
                    toastQueue = toastQueue.filter((t) => t.id != options.id);
                };
            },
        );
    },
};

const settingsPath = electron.app.getPath("userData") + "/settings.json";
const Settings = {
    get: (key) => {
        const settings = JSON.parse(fs.readFileSync(settingsPath,"utf-8"));
        return settings[key] ?? defaultSettings[key];
    },
    set: (key, value) => {
        const settings = JSON.parse(fs.readFileSync(settingsPath,"utf-8"));
        if (defaultSettings.hasOwnProperty( key )) {
            settings[key] = value ?? defaultSettings[key];
            fs.writeFileSync( settingsPath, JSON.stringify(settings, null, 4) );
        };
    },
};

const defaultSettings = {
    debug: false,
    alpha_notice: true,
    right: false,
    discordrpc: true,
};

const Functions = {
    onClick: {},
    onChange: {},
};

declare global {
    interface Window {
        router: typeof Router,
        sound: typeof Sound,
        logger: typeof Logger,
        engine: typeof Engine,
        settings: typeof Settings,
        functions: typeof Functions
    }
}

window.router = Router;
window.sound = Sound;
window.logger = Logger;
window.engine = Engine;
window.settings = Settings;
window.functions = Functions;