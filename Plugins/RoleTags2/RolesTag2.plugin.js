//META{"name":"RolesTag2","authorId":"596773775404564481","invite":"Jx3TjNS"}*//

var RolesTag2 = (_ => {
	const userTypes = {
		NONE: 0,
		MODERATION: 1,
		ADMINISTRATION: 2,
		MANAGEMENT: 3,
		OWNER: 4
	};
	
	var settings = {}, inputs = {};
	
	return class RolesTag2 {
		getName () {return "RolesTag2";}

		getVersion () {return "1.0.4";}

		getAuthor () {return "DireMaster";}

		getDescription () {return "Adds a tag or crown to different staff types.";}

		constructor () {
			this.changelog = {
				"changed":[["Created clone of OwnerTag to make it more than owner/staff"]],
				"improved":[["Management Tag","Tag now shows for all kinds of management perms and the type of management is displayed in the tooltip"]]
			};

			this.patchedModules = {
				after: {
					MemberListItem: "render",
					MessageHeader: "default",
					NameTag: "default",
					UserPopout: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN.memberownericon + BDFDB.dotCN._ownertagadminicon} {
					color: #c0c0c0;
				}
				${BDFDB.dotCN.memberownericon + BDFDB.dotCN._ownertagmanagementicon} {
					color: #ef7f32;
				}
				${BDFDB.dotCN.memberownericon + BDFDB.dotCN._ownertagadministrationicon} {
					color: #ffcc33;
				}
				${BDFDB.dotCN.memberownericon + BDFDB.dotCN._ownertagmoderationicon} {
					color: #32ef7f;
				}			
				${BDFDB.dotCNS.message + BDFDB.dotCN.memberownericon} {
					top: 2px;
				}
				${BDFDB.dotCNS.userprofile + BDFDB.dotCN.memberownericon} {
					top: 0px;
				}
				${BDFDB.dotCNS.messagecozy + BDFDB.dotCN.memberownericon} {
					margin-right: .25rem;
				}
				${BDFDB.dotCNS.messagecozy + BDFDB.dotCN.messageusername} + ${BDFDB.dotCN.memberownericon} {
					margin-left: 0;
				}
			`;
			
			this.defaults = {
				settings: {
					addInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
					addInMemberList:		{value:true, 	inner:true,		description:"Member List"},
					addInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
					addInUserProfile:		{value:true, 	inner:true,		description:"User Profile Modal"},
					useRoleColor:			{value:true, 	inner:false,	description:"Use the Rolecolor instead of the default blue"},
					useBlackFont:			{value:false, 	inner:false,	description:"Instead of darkening the Rolecolor on bright colors use black font"},
					useCrown:				{value:false, 	inner:false,	description:"Use the Crown Icon instead of the Bot Tag Style"},
					hideNativeCrown:		{value:true, 	inner:false,	description:"Hide the native Crown Icon (not the Plugin one)"},
					addForManagement:		{value:false, 	inner:false,	description:"Add a Management Tag for users with management permissions"},
					addforAdministration:   {value:false,   inner:false,    description:"Add a Administration Tag for users with Administration permissions"},
					addForModeration:       {value:false,  inner:false,    description:"Add a Moderation Tag for users with mod permissions"},
					ignoreBotAdmins:		{value:false, 	inner:false,	description:"Do not add the Admin/Management tag for bots"}
				},	
				inputs: {
					ownTagName:				{value:"Owner", 		description:"Tag Text for Owners"},
					ownManagementTagName:	{value:"Management", 	description:"Tag Text for Management"},
					ownAdministrationTagName:	{value:"Administration", 	description:"Tag Text for Administration"},
					ownModerationTagName:   {value:"Moderation", description:"Tag Text for Moderation"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel, settingsItems = [], innerItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => !this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					key: key,
					disabled: key == "hideNativeCrown" && settings.useCrown,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key],
					onChange: key == "useCrown" ? (value, instance) => {
						let hideNativeCrownInstance = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key: "hideNativeCrown"});
						if (hideNativeCrownInstance) {
							hideNativeCrownInstance.props.disabled = value;
							BDFDB.ReactUtils.forceUpdate(hideNativeCrownInstance);
						}
					} : null
				}))
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Tag Settings",
				collapseStates: collapseStates,
				children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
					className: BDFDB.disCN.marginbottom4,
					tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
					children: "Add Tags in:"
				})].concat(Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				})))
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Tag Text Settings",
				collapseStates: collapseStates,
				children: Object.keys(inputs).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "TextInput",
					plugin: this,
					keys: ["inputs", key],
					label: this.defaults.inputs[key].description,
					basis: "50%",
					value: inputs[key]
				}))
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
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

				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		processMemberListItem (e) {
			let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
			if (userType && settings.addInMemberList) {
				this.injectOwnerTag(BDFDB.ReactUtils.getValue(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, userType, 1, {
					tagClass: BDFDB.disCN.bottagmember
				});
			}
		}

		processMessageHeader (e) {
			if (e.instance.props.message && settings.addInChatWindow) {
				let userType = this.getUserType(e.instance.props.message.author, e.instance.props.message.channel_id);
				if (userType) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue.props.children.slice(1), {name: "Popout", props: [["className", BDFDB.disCN.messageusername]]});
					if (index > -1) this.injectOwnerTag(children, e.instance.props.message.author, userType, e.instance.props.compact ? 0 : 2, {
						tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
						useRem: true
					});
				}
			}
		}

		processNameTag (e) {
			if (e.instance.props.user && e.instance.props.className) {
				let userType = this.getUserType(e.instance.props.user);
				if (userType) {
					let inject = false, tagClass = "";
					switch (e.instance.props.className) {
						case BDFDB.disCN.userpopoutheadertagnonickname:
							inject = settings.addInUserPopout;
							tagClass = BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.userprofilenametag:
							inject = settings.addInUserProfile;
							tagClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
							break;
					}
					if (inject) this.injectOwnerTag(e.returnvalue.props.children, e.instance.props.user, userType, 2, {
						tagClass: tagClass,
						useRem: e.instance.props.useRemSizes,
						inverted: e.instance.props.invertBotTagColor
					});
				}
			}
		}

		processUserPopout (e) {
			if (e.instance.props.user && settings.addInUserPopout) {
				let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
				if (userType) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadertagwithnickname]]});
					if (index > -1) this.injectOwnerTag(children, e.instance.props.user, userType, 2, {
						tagClass: BDFDB.disCNS.userpopoutheaderbottagwithnickname + BDFDB.disCN.bottagnametag,
						inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
					});
				}
			}
		}

		injectOwnerTag (children, user, userType, insertIndex, config = {}) {
			if (!BDFDB.ArrayUtils.is(children) || !user) return;
			if (settings.useCrown || settings.hideNativeCrown) {
				let [_, index] = BDFDB.ReactUtils.findParent(children, {props: [["text",[BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER, BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER]]]});
				if (index > -1) children[index] = null;
			}
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
			let member = settings.useRoleColor ? (BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, user.id) || {}) : {};
			let tag = null;
			if (settings.useCrown) {
				let label, className;
				switch (userType) {
					case userTypes.OWNER:
						label = channel.type == BDFDB.DiscordConstants.ChannelTypes.GROUP_DM ? BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER : BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER;
						className = BDFDB.disCN._ownertagownericon;
						break;
					case userTypes.MANAGEMENT:
						label = `${this.labels.management_text} (${[BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && BDFDB.LanguageUtils.LibraryStrings.server ].filter(n => n).join(", ")})`;
						className = BDFDB.disCN._ownertagmanagementicon;
						break;
					case userTypes.ADMINISTRATION:
						label = `${this.labels.administration_text} (${[BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES, BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS].filter(n => n).join(", ")})`;
						className = BDFDB.disCN._ownertagadministrationicon;
						break;
					case userTypes.MODERATION:
						label = `${this.labels.moderation_text} (${[BDFDB.UserUtils.can("BAN_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.BAN, BDFDB.UserUtils.can("KICK_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.KICK, BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) && BDFDB.LanguageUtils.LanguageStrings.MESSAGES].filter(n => n).join(", ")})`;
						className = BDFDB.disCN._ownertagmoderationicon;
						break;
				}
				tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: label,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.memberownericon, className),
						name: BDFDB.LibraryComponents.SvgIcon.Names.CROWN,
						"aria-label": label
					})
				});
			}
			else {
				let input, label;
				switch (userType) {
					case userTypes.OWNER:
						input = "ownTagName";
						label = [BDFDB.UserUtils.can("Administrator", user.id) && BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER].filter(n => n).join(", ");
						break;
					case userTypes.MANAGEMENT:
						input = "ownManagementTagName";
						label = [BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && BDFDB.LanguageUtils.LibraryStrings.server, BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES, BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS, BDFDB.UserUtils.can("BAN_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.BAN, BDFDB.UserUtils.can("KICK_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.KICK, BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) && BDFDB.LanguageUtils.LibraryStrings.server && BDFDB.LanguageUtils.LanguageStrings.MESSAGES].filter(n => n).join(", ");
						break;
					case userTypes.ADMINISTRATION:
						input = "ownAdministrationTagName";
						label = [BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES, BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS, BDFDB.UserUtils.can("BAN_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.BAN, BDFDB.UserUtils.can("KICK_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.KICK, BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) && BDFDB.LanguageUtils.LibraryStrings.server && BDFDB.LanguageUtils.LanguageStrings.MESSAGES].filter(n => n).join(", ");
						break;
					case userTypes.MODERATION:
						input = "ownModerationTagName";
						label = [BDFDB.UserUtils.can("BAN_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.BAN, BDFDB.UserUtils.can("KICK_MEMBERS", user.id) && BDFDB.LanguageUtils.LanguageStrings.KICK, BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) && BDFDB.LanguageUtils.LibraryStrings.server && BDFDB.LanguageUtils.LanguageStrings.MESSAGES].filter(n => n).join(", ");
						break;
				}
				let tagColor = BDFDB.ColorUtils.convert(member.colorString, "RGBA");
				let isBright = BDFDB.ColorUtils.isBright(tagColor);
				tagColor = isBright ? (settings.useBlackFont ? tagColor : BDFDB.ColorUtils.change(tagColor, -0.3)) : tagColor;
				tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
					className: config.tagClass,
					useRemSizes: config.useRem,
					invertColor: config.inverted,
					style: {
						backgroundColor: config.inverted ? (isBright && settings.useBlackFont ? "black" : null) : tagColor,
						color: !config.inverted ? (isBright && settings.useBlackFont ? "black" : null) : tagColor
					},
					tag: inputs[input]
				});
				if (label) tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: label,
					children: tag
				});
			}
			children.splice(insertIndex, 0, tag);
		}
		
		getUserType (user, channelId) {
			if (!user) return userTypes.NONE;
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId || BDFDB.LibraryModules.LastChannelStore.getChannelId());
			if (!channel) return userTypes.NONE;
			let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
			let isOwner = channel.ownerId == user.id || guild && guild.ownerId == user.id || BDFDB.UserUtils.can("ADMINISTRATOR", user.id);
			if (isOwner) return userTypes.OWNER;
			else if (settings.addForManagement && BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && !(settings.ignoreBotAdmins && user.bot)) return userTypes.MANAGEMENT;
			else if (settings.addforAdministration && (BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) || BDFDB.UserUtils.can("MANAGE_ROLES", user.id)) && !(settings.ignoreBotAdmins && user.bot)) return userTypes.ADMINISTRATION;
			else if (settings.addForModeration && (BDFDB.UserUtils.can("KICK_MEMBERS", user.id) || BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) || BDFDB.UserUtils.can("BAN_MEMBERS", user.id)) && !(settings.ignoreBotAdmins && user.bot)) return userTypes.MODERATION;
			return userTypes.NONE;
		}
	
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			inputs = BDFDB.DataUtils.get(this, "inputs");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						management_text:					"Upravljanje"
					};
				case "da":		//danish
					return {
						management_text:					"Ledelse"
					};
				case "de":		//german
					return {
						management_text:					"Verwaltung"
					};
				case "es":		//spanish
					return {
						management_text:					"Administración"
					};
				case "fr":		//french
					return {
						management_text:					"Gestion"
					};
				case "it":		//italian
					return {
						management_text:					"Gestione"
					};
				case "nl":		//dutch
					return {
						management_text:					"Beheer"
					};
				case "no":		//norwegian
					return {
						management_text:					"Ledelse"
					};
				case "pl":		//polish
					return {
						management_text:					"Zarządzanie"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						management_text:					"Gestão"
					};
				case "fi":		//finnish
					return {
						management_text:					"Johto"
					};
				case "sv":		//swedish
					return {
						management_text:					"Förvaltning"
					};
				case "tr":		//turkish
					return {
						management_text:					"Yönetim"
					};
				case "cs":		//czech
					return {
						management_text:					"Řízení"
					};
				case "bg":		//bulgarian
					return {
						management_text:					"Управление"
					};
				case "ru":		//russian
					return {
						management_text:					"Управление"
					};
				case "uk":		//ukrainian
					return {
						management_text:					"Управління"
					};
				case "ja":		//japanese
					return {
						management_text:					"管理"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						management_text:					"管理"
					};
				case "ko":		//korean
					return {
						management_text:					"관리"
					};
				default:		//default: english
					return {
						management_text:					"Management",
						administration_text:                "Administration",
						moderation_text:                    "Moderation"
					};
			}
		}
	}
})();

module.exports = RolesTag2;