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

drop.get("request_id") { _ in
    let uuid = UUID().uuidString
    visitedIPs[uuid] = (Date(), Date(), 0)
    return try JSON(node: ["id" : uuid])
}


// MARK: - PUT requests

drop.put("update_score") { request in
    
    //TODO: Make a better way of passing in values
    var values: [String: String] = [:]
    if let query = request.uri.query?.components(separatedBy: "?") {
        for item in query {
            let pair = item.components(separatedBy: "=")
            if pair.count != 2 {
                throw Abort.badRequest
            }
            
            values[pair[0]] = pair[1]
        }
    }
    
    guard let teamString = values["team"], let teamID = Int(teamString),
          let peer = values["id"], let scoreString = values["score"],
          let score = Int(scoreString)
          else {
        throw Abort.badRequest
    }
    
    // Validation logic
    let now = Date()
    if let old = visitedIPs[peer] {
        let oldVisit = old.0
        let lastVisit = old.1
        let visits = old.2
        
        let timeSinceLastRequest = now.timeIntervalSince(oldVisit)
        
        if visits >= 13 {
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
        return "Unregistered user"
    }

    
    if score > 110 || score <= 0 { return "invalid score" }
    
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
