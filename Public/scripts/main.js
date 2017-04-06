var vm = new Vue({
	el: '#app',
	data: {
		counter: 0,
		team1Score: 0,
		team2Score: 0,
		team3Score: 0,
		teamID: 0,
		team: 'none',
		teamNotChosen: true,
		teamHover: 'none-hover'
	},
	created() {
		console.log('created')
		Vue.$http.get('teams').then(response => {
		    var data = response.body
			console.log('mounted')
		  }, response => {
		    // error callback
		  })
		  console.log('done')
	},
	methods: {
		loadScores: function() {
			this.$http.get('/teams').then(response => {
			    var data = response.body
			}, response => {
			    // error callback
			});
		},
		increment: function(event) {
			console.log('hello')
			this.counter += 1

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
