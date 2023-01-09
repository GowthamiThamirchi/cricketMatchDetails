const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      player_details;`;
  const playerDetails = await db.all(getPlayersQuery);

  response.send(
    playerDetails.map((playerDetails) =>
      convertDbObjectToResponseObject(playerDetails)
    )
  );
});

app.use(express.json());

app.get("/players/:playerId/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      player_details
    WHERE
      player_id = ${playerId};`;

  const playerDetails = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(playerDetails));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
    UPDATE
      player_details
    SET
      
      player_name='${playerName}'
      
      
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  const { matchId } = request.params;
  const getMatchQuery = `
    SELECT
      *
    FROM
      match_details
    WHERE 
      match_id = ${matchId};`;
  const matchArray = await db.get(getMatchQuery);
  response.send(convertDbObjectToResponseObject(matchArray));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    SELECT
      *
    FROM player_match_score 
      NATURAL JOIN match_details
    WHERE 
      player_id=${playerId};`;

  const playerMatches = await database.all(getPlayerMatchesQuery);
  response.send(
    playerMatches.map((eachMatch) =>
      convertMatchDetailsDbObjectToResponseObject(eachMatch)
    )
  );
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchPlayersQuery = `
    SELECT
      *
    FROM
      player_match_score NATURAL JOIN player_details
    WHERE 
      match_id=${matchId};`;

  const playerDetails = await database.all(getMatchPlayersQuery);
  response.send(
    playerDetails.map((everyDetail) =>
      convertPlayerDetailsDbObjectToResponseObject(everyDetail)
    )
  );
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerPlayersQuery = `
    SELECT
      player_id,
      player_name,
      SUM(score),
      SUM(fours),
      SUM(sixes)
    
    FROM
      player_details NATURAL JOIN player_match_score
    WHERE
      player_id = ${playerId};`;

  const players = await database.all(getPlayerPlayersQuery);
  console.log(players);
  response.send({
    totalScore: players["SUM(score)"],
    totalFours: players["SUM(fours)"],
    totalSixes: players["SUM(sixes)"],
  });
});

module.exports = app;
