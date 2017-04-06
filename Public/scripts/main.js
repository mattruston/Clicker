var vm = new Vue({
	el: '#app',
	data: {
		counter: 0,
		tempCounter: 0,
		team1Score: 0,
		team2Score: 0,
		team3Score: 0,
		teamID: 0,
		team: 'none',
		teamNotChosen: true,
		teamHover: 'none-hover',
		timeout: false
	},
	mounted() {
		this.loadScores()
	},
	methods: {
		loadScores: function() {
			this.$http.get('/teams').then(response => {
			    var data = response.body
				console.log(data)
				for (i = 0; i < 3; i++) {
					switch(data[i].id) {
						case 1:
							this.team1Score = data[i].score
							break
						case 2:
							this.team2Score = data[i].score
							break
						case 3:
							this.team3Score = data[i].score
							break
						default:
					}
				}
			}, response => {
			    // error callback
			});
		},
		increment: function(event) {
			console.log('hello')
			this.counter += 1
			this.tempCounter += 1
			if (!this.timeout) {
				setTimeout(this.sendUpdate(this.teamID), 150000)
				this.timeout = true
			}

		},
		sendUpdate: function(teamID) {
			console.log("sending data")
			this.$http.put('/update_score/' + this.teamID + '/' + this.tempCounter).then(response => {
				this.timeout = false
				this.loadScores()
				this.tempCounter = 0
			}, response => {
			    // error callback
			});

		},
		pickTeam: function(team) {
			if (team === 1) {
				this.team = 'teamGreen'
				this.teamID = 1
			} else if (team === 2) {
				this.team = 'teamBlue'
				this.teamID = 2
			} else {
				this.team = 'teamPurple'
				this.teamID = 3
			}
			this.teamNotChosen = false;
		},
		colorChange: function(team) {
			if (team === 1) {
				this.teamHover = 'team-green-hover'
			} else if (team === 2) {
				this.teamHover = 'team-blue-hover'
			} else if (team === 3) {
				this.teamHover = 'team-purple-hover'
			}
		}
	}
})
