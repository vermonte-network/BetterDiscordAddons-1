//META{"name":"ThemeSettings","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeSettings","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeSettings/ThemeSettings.plugin.js"}*//

var ThemeSettings = (_ => {
	var dir;
	
	return class ThemeSettings {
		getName () {return "ThemeSettings";}

		getVersion () {return "1.2.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to change Theme Variables within BetterDiscord. Adds a Settings button (similar to Plugins) to customizable Themes in your Themes Page.";}

		constructor () {
			this.changelog = {
				"fixed":[["Works","again"]]
			};
		}
		
		initConstructor () {
			dir = BDFDB.BDUtils.getThemesFolder();
		}
		
		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);
				
				let cardObserver = (new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(node => {
					if (BDFDB.DOMUtils.containsClass(node, BDFDB.disCN._repocard)) this.appendSettingsButton(node);
					if (node.nodeType != Node.TEXT_NODE) for (let child of node.querySelectorAll(BDFDB.dotCN._repocard)) this.appendSettingsButton(child);
				});}});}));
				BDFDB.ObserverUtils.connect(this, document.querySelector(`${BDFDB.dotCN.layer}[aria-label="${BDFDB.DiscordConstants.Layers.USER_SETTINGS}"]`), {name:"cardObserver", instance:cardObserver}, {childList: true, subtree:true});
				BDFDB.ObserverUtils.connect(this, BDFDB.dotCN.applayers, {name:"appLayerObserver", instance:(new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(node => {
					if (node.nodeType != Node.TEXT_NODE && node.getAttribute("aria-label") == BDFDB.DiscordConstants.Layers.USER_SETTINGS) BDFDB.ObserverUtils.connect(this, node, {name:"cardObserver", instance:cardObserver}, {childList: true, subtree:true});
				});}});}))}, {childList: true});
				for (let child of document.querySelectorAll(BDFDB.dotCN._repocard)) this.appendSettingsButton(child);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.DOMUtils.remove(".theme-settings-button");
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions
		
		appendSettingsButton (card) {
			if (card.querySelector(".theme-settings-button")) return;
			let addon = BDFDB.ReactUtils.getValue(BDFDB.ReactUtils.getInstance(card), "return.stateNode.props.addon");
			if (addon && !addon.plugin) {
				let vars = this.getThemeVars(addon.css);
				if (vars.length) {
					let footer = card.querySelector("." + BDFDB.dotCN._repofooter.split(".").filter(n => n).join(",."));
					if (!footer) {
						footer = document.createElement("div");
						footer.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repofooter);
						let links = document.createElement("span");
						links.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolinks);
						footer.appendChild(links);
						card.appendChild(footer);
					}
					let settingsButton = document.createElement("button");
					settingsButton.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._reposettingsbutton, "theme-settings-button");
					settingsButton.innerText = BDFDB.LanguageUtils.LanguageStrings.SETTINGS;
					footer.appendChild(settingsButton);
					settingsButton.addEventListener("click", _ => {
						BDFDB.DOMUtils.addClass(card, BDFDB.disCN._reposettingsopen);
						BDFDB.DOMUtils.removeClass(card, BDFDB.disCN._reposettingsclosed);
						let children = [];
						while (card.childElementCount) {
							children.push(card.firstChild);
							card.firstChild.remove();
						}
						let closeButton = BDFDB.DOMUtils.create(`<div style="float: right; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>`);
						card.appendChild(closeButton);
						closeButton.addEventListener("click", _ => {
							BDFDB.DOMUtils.removeClass(card, BDFDB.disCN._reposettingsopen);
							BDFDB.DOMUtils.addClass(card, BDFDB.disCN._reposettingsclosed);
							while (card.childElementCount) card.firstChild.remove();
							while (children.length) card.appendChild(children.shift());
						});
						this.createThemeSettings(card, addon, vars);
					});
				}
			}
		}

		getThemeVars (css) {
			let vars = css.split(":root");
			if (vars.length > 1) {
				vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
				vars = vars.split("{");
				vars.shift();
				vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
				vars = vars.split("}")[0];
				return vars.slice(2).split(/;--|\*\/--/);
			}
			return [];
		}

		createThemeSettings (wrapper, theme, vars) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.GREEN,
				label: "Update all variables",
				onClick: _ => {
					let path = BDFDB.LibraryRequires.path.join(dir, theme.filename);
					let css = BDFDB.LibraryRequires.fs.readFileSync(path).toString();
					if (css) {
						let amount = 0;
						for (let input of wrapper.querySelectorAll(BDFDB.dotCN.input)) {
							let oldvalue = input.getAttribute("placeholder");
							let newvalue = input.value;
							if (newvalue && newvalue.trim() && newvalue != oldvalue) {
								let varName = input.getAttribute("varName");
								css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(varName)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(oldvalue)}`,"g"),`--${varName}$1:$2${newvalue}`);
								amount++;
							}
						}
						if (amount > 0) {
							BDFDB.LibraryRequires.fs.writeFileSync(path, css);
							BDFDB.NotificationUtils.toast(`Updated ${amount} variable${amount == 1 ? "" : "s"} in ${theme.filename}`, {type:"success"});
						}
						else BDFDB.NotificationUtils.toast(`There are no changed variables to be updated in ${theme.filename}`, {type:"warning"});
					}
					else BDFDB.NotificationUtils.toast(`Could not find themefile: ${theme.filename}`, {type:"error"});
				},
				children: "Update"
			}));

			for (let varStr of vars) {
				varStr = varStr.split(":");
				let varName = varStr.shift().trim();
				varStr = varStr.join(":").split(/;[^A-z0-9]|\/\*/);
				let varValue = varStr.shift().trim();
				if (varValue) {
					let childType = "text", childMode = "";
					let isColor = BDFDB.ColorUtils.getType(varValue);
					let isComp = !isColor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(varValue);
					if (isColor || isComp) {
						childType = "color";
						childMode = isComp && "comp";
					}
					else {
						let isUrlFile = /url\(.+\)/gi.test(varValue);
						let isFile = !isUrlFile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(varValue);
						if (isFile || isUrlFile) {
							childType = "file";
							childMode = isUrlFile && "url";
						}
					}
					let varDescription = varStr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
					settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						className: BDFDB.disCN.marginbottom20,
						dividerbottom: vars[vars.length-1] != varStr,
						type: "TextInput",
						childProps: {
							type: childType,
							mode: childMode,
							filter: childType == "file" && "image"
						},
						label: varName[0].toUpperCase() + varName.slice(1),
						note: varDescription && varDescription.indexOf("*") == 0 ? varDescription.slice(1) : varDescription,
						basis: "70%",
						varName: varName,
						value: varValue,
						placeholder: varValue
					}));
				}
			}
			
			wrapper.appendChild(BDFDB.PluginUtils.createSettingsPanel(Object.assign({}, theme, {noLibrary: true}), settingsItems));
		}
	}
})();

module.exports = ThemeSettings;