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

			this.counter += 1
			this.tempCounter += 1
			//locally update until callback
			switch(this.teamID) {
				case 1:
					this.team1Score += 1
					break
				case 2:
					this.team2Score += 1
					break
				case 3:
					this.team3Score += 1
					break
				default:
			}
			if (this.tempCounter >= 100) {
				this.sendUpdate()
				this.timeout = true
			}
		},
		sendUpdate: function() {
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
		},
		backToSelect: function() {
			if (this.tempCounter > 0) {
				this.$http.put('/update_score/' + this.teamID + '/' + this.tempCounter).then(response => {
					this.loadScores()
					this.tempCounter = 0
					this.counter = 0
					this.teamNotChosen = true
					this.team = 'none'
					this.teamID = 0
				}, response => {
				    // error callback
				});
			}
		},
		cleanUp: function() {
			if (this.tempCounter > 0) {
				this.$http.put('/update_score/' + this.teamID + '/' + this.tempCounter)
			}
		}
	}
})

window.onbeforeunload = function(){
	vm.cleanUp()
}
