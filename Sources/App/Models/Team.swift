
import Foundation
import Vapor

final class Team: Model {
    
    var id: Node?
    var exists: Bool = false
    
    var teamID: Int
    var name: String
    var score: Int
    
    init(teamID: Int, name: String, score: Int) {
        self.id = nil
        self.teamID = teamID
        self.name = name
        self.score = score
    }
    
    init(node: Node, in context: Context) throws {
        id = try node.extract("id")
        teamID = try node.extract("teamid")
        name = try node.extract("name")
        score = try node.extract("score")
    }
    
    func makeNode(context: Context) throws -> Node {
        return try Node(node: [
            "id" : id,
            "teamid" : teamID,
            "name" : name,
            "score" : score
            ])
    }
    
    static func prepare(_ database: Database) throws {
        try database.create("teams", closure: { (items) in
            items.id()
            items.int("teamid")
            items.string("name")
            items.int("score")
        })
    }
    
    static func revert(_ database: Database) throws {
        try database.delete("teams")
    }
    
}
