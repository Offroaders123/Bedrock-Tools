const Components = {
    createHeader: (options) => {
        const header = document.createElement( "div" );
        const header_ = document.createElement( "div" );
        const header__ = document.createElement( "div" );
        header.className = "header";
        header_.className = "header_";
        header__.className = "header__";

        const backElement = document.createElement( "div" );
        backElement.style = "position: absolute; left: 0;";
        if (options?.back) {
            const back = document.createElement( "div" );
            back.className = "headerButton";
            back.innerHTML = `<img src="/src/assets/imgs/icons/arrow_back.png" style="image-rendering: pixelated;">`;
            back.id = "back";

            backElement.append( back );
        };

        header__.append( backElement );

        const headerTitle = document.createElement( "div" );
        headerTitle.className = "headerTitle";
        headerTitle.innerHTML = `<div class="headerTitle_">${options?.text ?? ""}</div>`;
        header__.append( headerTitle )

        const space = document.createElement( "div" );
        space.style = "margin-right: 140px; position: absolute; right: 0;";
        if (options?.settings) {
            const settings = document.createElement( "div" );
            settings.className = "headerButton";
            settings.innerHTML = `<img src="/src/assets/imgs/icons/settings.png" style="image-rendering: pixelated; width: calc(8*var(--base2Scale));">`;
            settings.id = "settings";
            
            space.append( settings );
        };

        header__.append( space );

        header_.append( header__ );

        const headerShadow = document.createElement( "div" );
        headerShadow.className = "headerShadow";
        header_.append( headerShadow );

        header.append( header_ );
        return header.outerHTML;
    },
    
    createElements: (options) => {
        return (
            `<div class="elements">${options.elements.join( "" )}</div>`
        );
    },
    
    createElement: (options) => {
        switch(options?.type) {
            case "element": {
                return (
                    `<div class="element_" id="${options?.id ?? ""}">
                        <span class="elementHeader">${options?.title ?? ""}</span>
                        <span class="elementSubtitle">${options?.subtitle ?? ""}</span>
                    </div>`
                );
            };

            case "dropdown": {
                return (
                    `<div class="element">
                        <span class="elementTitle">${options?.title ?? ""}</span>
                        <div class="dropdown oreUIButtonSecondary">
                            <div class="oreUIButton_ oreUIButtonSecondaryBackground">
                                <div class="oreUISpecular oreUIButton_One"></div>
                                <div class="oreUISpecular oreUIButton_Two"></div>
                                <select name="${options?.id ?? ""}" onChange='(${options?.onChange?.toString()})(this)' id="${options?.id ?? ""}" class="_oreUIButton">
                                    ${options.items.map((i, index) => `<option value="${index}">${i}</option>`)}
                                </select>
                            </div>
                        </div>
                    </div>`
                );
            };

            case "input": {
                return (
                    `<div class="element">
                        <span class="elementTitle">${options?.title ?? ""}</span>
                        <input
                            id="${options?.id ?? ""}"
                            type="${options?.input?.type ?? "text"}"
                            min="${options?.input?.min ?? 0}"
                            max="${options?.input?.max ?? Infinity}"
                            placeholder="${options?.placeholder ?? ""}"
                        ></input>
                    </div>`
                );
            };

            case "toggle": {
                return (
                    `<div class="element">
                        <div style="flex-direction: unset;margin-top: 8px;margin-bottom: 8px;">
                            <div>
                                <span class="${options?.subtitle ? "elementTitle_" : "elementTitle__"}">${options?.title ?? ""}</span>
                                <span class="elementSubtitle">${options?.subtitle ?? ""}</span>
                            </div>
                            <div
                                class="toggle ${options.toggled ? "toggleOn" : "toggleOff"}"
                                id="${options?.id ?? ""}"
                                value=${options.toggled ?? false}
                                onClick='(${options?.onClick?.toString()})(this)'
                            ></div>
                        </div>
                    </div>`
                );
            };

            case "button": {
                return (
                    `<div class="oreUIButton oreUIButtonHero" onClick='(${options?.onClick?.toString()})(this)' id="${options?.id ?? ""}">
                        <div class="oreUIButton_ oreUIButtonHeroBackground">
                            <div class="oreUISpecular oreUIButton_One"></div>
                            <div class="oreUISpecular oreUIButton_Two"></div>
                            <div class="_oreUIButton">
                                <div class="_oreUIButton_">
                                    <div class="_oreUIButton__">
                                        <div class="_oreUIButton___">${options?.text ?? ""}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`
                );
            };

            case "text": {
                return (
                    `<div class="element">
                        <span class="elementTitle">${options?.title ?? ""}</span>
                        <pre><code class="hljs" id="${options?.id ?? ""}">${options?.default ?? ""}</code></pre>
                    </div>`
                )
            };
        };
    },

    createModal: (options) => {
        return (
            `<div class="popup_">
                <div class="popup__">
                    <div class="popup___">
                        <div class="oreUISpecular oreUIButton_One"></div>
                        <div class="oreUISpecular oreUIButton_Two"></div>
                        <div style="width: 2.4rem; height: 2.4rem;"></div>
                        <div style="flex: 1 1 0;"></div>
                        <div style="font-size: 14px;">${options?.title ?? ""}</div>
                        <div style="flex: 1 1 0;"></div>
                        <div style="width: 2.4rem ;height: 2.4rem;"></div>
                    </div>
                    <div style="height: var(--base2Scale); width: 100%; background-color: #313233;"></div>
                    <div style="background-color: #313233; flex: 0 1 auto; color: #ffffff;">
                        ${options?.body ?? ""}
                    </div>
                    ${
                        options?.footer
                        ? (
                            `<div style="flex-direction: row; background-color: #48494a; padding: 0.6rem;">
                                <div class="oreUISpecular" style="border-top-width: var(--base2Scale);"></div>
                                <div class="oreUISpecular" style="border-bottom-width: var(--base2Scale);"></div>
                                ${options.footer}
                            </div>`
                        )
                        : ""
                    }
                </div>
            </div>`
        );
    },
};