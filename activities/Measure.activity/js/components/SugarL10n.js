// Localization component
Vue.component('sugar-localization', {
	template: '<div/>',
	data: function () {
		return {
			l10n: null,
			code: null,
			dictionary: null,
			eventReceived: false,
			activityInitialized: false,
			units: [
				{ name: 'Years', factor: 356 * 24 * 60 * 60 },
				{ name: 'Months', factor: 30 * 24 * 60 * 60 },
				{ name: 'Weeks', factor: 7 * 24 * 60 * 60 },
				{ name: 'Days', factor: 24 * 60 * 60 },
				{ name: 'Hours', factor: 60 * 60 },
				{ name: 'Minutes', factor: 60 }
			],
		};
	},
	computed: {
		readyToEmit: function () {
			return this.dictionary != null && this.activityInitialized;
		},
	},
	watch: {
		readyToEmit: function (newVal, oldVal) {
			if (newVal) {
				this.$emit('localized');
				this.eventReceived = true;
			}
		},
	},
	mounted: function () {
		const vm = this;

		if (vm.l10n == null) {
			requirejs(['sugar-web/env'], function (env) {
				env.getEnvironment((err, environment) => {
					const defaultLanguage =
						typeof chrome !== 'undefined' &&
							chrome.app &&
							chrome.app.runtime
							? chrome.i18n.getUILanguage()
							: navigator.language;
					const language = environment.user
						? environment.user.language
						: defaultLanguage;

					if (vm.l10n == null) {
						vm.loadLanguageFile(language);
					}
				});
			});
		}

		// Activity initialization check
		const SugarActivity = vm.$root.$children.find(function (child) {
			return child.$options.name == 'SugarActivity';
		});
		SugarActivity.$on('initialized', function () {
			vm.activityInitialized = true;
		});
	},

	methods: {
		loadLanguageFile: function (language) {
			const vm = this;
			axios.get(`./locales/${language}.json`).then((response) => {
				i18next.init(
					{
						lng: language,
						fallbackLng: 'en',
						debug: true,
						resources: {
							[language]: {
								translation: response.data
							}
						},
					},
					() => {
						vm.l10n = i18next;
						vm.code = i18next.language;
						vm.dictionary = i18next.getResourceBundle(i18next.language, 'translation');
						vm.subscribeLanguageChange();
						vm.activityInitialized = true;
					}
				);
			}).catch((error) => {
				vm.loadLanguageFile('en');
				console.log(error);
			});
		},

		subscribeLanguageChange: function () {
			const vm = this;
			i18next.on('languageChanged', (lng) => {
				vm.code = lng;
				vm.dictionary = i18next.getResourceBundle(lng, 'translation');
				vm.$emit('localized');
				vm.eventReceived = true;
			});
		},

		get: function (str, params) {
			let out = '';

			if (!this.dictionary) {
				out = str;
			} else {
				out = this.dictionary[str] || str;
			}

			if (params) {
				let paramsInString = out.match(/{{\s*[\w\.]+\s*}}/g);
				for (let i in paramsInString) {
					let param = paramsInString[i].match(/[\w\.]+/)[0];
					if (params[param]) {
						out = out.replace(paramsInString[i], params[param]);
					}
				}
			}
			return out;
		},

		localize: function (strings) {
			const vm = this;
			Object.keys(strings).forEach((key, index) => {
				strings[key] = vm.get(key.substr(6));
			});
		},

		localizeTimestamp: function (timestamp) {
			const maxlevel = 2;
			const levels = 0;
			let time_period = '';
			let elapsed_seconds = (Date.now() - timestamp) / 1000;
			for (let i = 0; i < this.units.length; i++) {
				let factor = this.units[i].factor;

				let elapsed_units = Math.floor(elapsed_seconds / factor);
				if (elapsed_units > 0) {
					if (levels > 0)
						time_period += ',';

					time_period += ' ' + elapsed_units + " " + (elapsed_units == 1 ? this.get(this.units[i].name + "_one") : this.get(this.units[i].name + "_other"));

					elapsed_seconds -= elapsed_units * factor;
				}

				if (time_period != '')
					levels += 1;

				if (levels == maxlevel)
					break;
			}

			if (levels == 0) {
				return this.get('SecondsAgo');
			}

			return this.get('Ago', { time: time_period });
		},
	},
});
