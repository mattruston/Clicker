import Foundation
import Vapor
import VaporPostgreSQL

// MARK: - setup

let drop = Droplet()

try drop.addProvider(VaporPostgreSQL.Provider.self)
drop.preparations.append(Team.self)

var visitedIPs: [String : (Date, Date, Int)] = [:]


// MARK: - Pages

drop.get { _ in
    return try drop.view.make("index.html")
}


// MARK: - GET requests

drop.get("teams") { _ in
    return try Team.all().makeJSON()
}

drop.get("score", Int.self) { req, teamID in
    if let team = try Team.query().filter("teamid", teamID).first() {
        return try JSON(node: ["score" : team.score])
    }
    return "Invalid team"
}


// MARK: - PUT requests

drop.put("update_score", Int.self, Int.self) { request, teamID, score in
    
    // Validation logic
    if let peer = request.peerAddress?.stream {
        let now = Date()
        
        if let old = visitedIPs[peer] {
            let oldVisit = old.0
            let lastVisit = old.1
            let visits = old.2
            
            let timeSinceLastRequest = now.timeIntervalSince(oldVisit)
            
            if visits >= 10 {
                // If they have more than 10 requests, wait 30 minutes before resetting them
                if timeSinceLastRequest > (60.0 * 30.0) {
                    visitedIPs[peer] = (now, now, 0)
                } else {
                    return "Timed out due to too many requests"
                }
            } else {
                if now.timeIntervalSince(lastVisit) < 3, score >= 99 {
                    visitedIPs[peer] = (now, now, 10)
                    return "Timed out due to impossible request"
                }
                if timeSinceLastRequest > 60.0 {
                    visitedIPs[peer] = (now, now, 0)
                } else {
                    visitedIPs[peer] = (oldVisit, now, visits + 1)
                }
            }
        } else {
            visitedIPs[peer] = (now, now, 0)
        }
    }

    
    if score > 300 || score <= 0 { return "invalid score" }
    
    if var team = try Team.query().filter("teamid", teamID).first() {
        team.score += score
        try team.save()
        
        return "success"
    }
    
    return "team not found"
}


// MARK: - POST requests

drop.post("setup") { _ in
    // Set up teams if they do not exist
    let teamCount = try Team.all().count
    if teamCount == 0 {
        var green = Team(teamID: 1, name: "green", score: 0)
        var blue = Team(teamID: 2, name: "blue", score: 0)
        var purple = Team(teamID: 3, name: "purple", score: 0)
        
        try green.save()
        try blue.save()
        try purple.save()
        
        return "Created teams"
    }
    
    
    return "Done"
}

drop.run()
