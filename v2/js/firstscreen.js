/**
 * @module FirstScreen
 * @desc This is the first screen component
 */

const FirstScreen = {
	name: 'FirstScreen',
	template: `<div class="firstscreen">
                    <div class="firstscreen_login" v-show="showLoginScreen" >
                        <login-screen
                            :userType="userType"
                            @propModified="handleLoginScreenPropModified" 
                            @updateIsFirstScreen="setIsFirstScreen2"
                        />
                    </div>
                    <div class="firstscreen_landing" v-show="!showLoginScreen">
                        <div class="firstscreen_newuser">
                            <div class="column">
                                <icon
                                    id="newuser-icon"
                                    svgfile="/icons/newuser-icon.svg"
                                    size="154"
                                    x="0"
                                    y="0"
                                    isNative="true"
                                    @click="loadLoginScreen('newuser')"
                                 ></icon>
                                <div class="firstscreen_text">New User</div>
                            </div>
                        </div>
                        <div class="firstscreen_login">
                            <div class="column">
                                <icon
                                    id="login-icon"
                                    svgfile="/icons/login.svg"
                                    size="154"
                                    x="0"
                                    y="0"
                                    isNative="true"
                                    @click="loadLoginScreen('login')"
                                ></icon>
                                <div class="firstscreen_text">Login</div>
                            </div>                        
                        </div>
                        <div class="previoususer">
                            <div class="column" v-for="(user, index) in prevUsers">
                                <icon-button
                                    :text="user.name"
                                    :id="'previoususer-' + index"
                                    svgfile="./icons/owner-icon.svg"
                                    :color="user.color.toString()"
                                    size="28"
                                    x="0"
                                    y="0"
                                    style="width: 150px;"
                                    @click="loadLoginScreen('previoususer', index)"
                                />
                            </div>
                        </div>
                    </div>
               </div>`,
	components: {
		'icon': Icon,
		'icon-button': IconButton,
		'login-screen': LoginScreen,
	},

	emits: ['showdesktop'],

	data() {
		return {
			prevUsers: [],
			showLoginScreen: false,
			userType: {
				isNewuser: false,
				isLogin: false,
				isPrevUser: null,
			},
			isFirstScreen: true,
		}
	},

	watch: {
		isFirstScreen: function (newVal) {
			this.$emit('showdesktop', newVal)
		}
	},

	mounted() {
		this.getPrevUsers()
	},

	methods: {
		getPrevUsers() {
			try {
				this.prevUsers = JSON.parse(localStorage.getItem('sugar_history')).reverse();
			} catch (error) {
				console.error('Error parsing previous users:', error);
				this.prevUsers = [];
			}
		},

		loadLoginScreen(buttontype, index) {
			switch (buttontype) {
				case 'newuser':
					this.userType.isNewuser = true;
					this.userType.isLogin = false;
					this.userType.isPrevUser = null;
					break;
				case 'login':
					this.userType.isLogin = true;
					this.userType.isNewuser = false;
					this.userType.isPrevUser = null;
					break;
				case 'previoususer':
					this.prevUsers.forEach((user, i) => {
						if (i === index) {
							this.userType.isPrevUser = {
								name: user.name,
								url: user.server.url,
							}
						}
					});
					this.userType.isLogin = false;
					this.userType.isNewuser = false;
					break;
				default:
					console.error('Error loading login screen');
					break;
			}
			this.showLoginScreen = true;
		},
		handleLoginScreenPropModified(prop) {
			this.showLoginScreen = prop;
		},
		setIsFirstScreen2(value) {
			this.isFirstScreen = value;
		}
	}
}

if (typeof module !== 'undefined') module.exports = { FirstScreen }