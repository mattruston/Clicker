var vm = new Vue({
	el: '#app',
	data: {
		counter: 0,
		team1Score: 1234001,
		team2Score: 10,
		team3Score: 99,
		teamID: 3,
		team: 'teamPurple'
	},
	methods: {
		increment: function(event) {
			console.log('hello')
			this.counter += 1
			this.team1Score += 1

			if(this.team == 'teamPurple') {
				this.team = 'teamGreen'
				this.teamID = 1
				this.team3Score += 1
			} else if(this.team == 'teamGreen') {
				this.team = 'teamBlue'
				this.teamID = 2
				this.team1Score += 1
			} else {
				this.team = 'teamPurple'
				this.teamID = 3
				this.team2Score += 1
			}
		}
	}
})
