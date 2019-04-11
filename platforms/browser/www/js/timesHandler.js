var timesHandler = {
	addTime: function(name, minutes, seconds, device) {
		// call database
		databaseHandler.db.transaction(
			function(tx){
				//sql
				tx.executeSql(
					"insert into times(name, minutes, seconds, device) values(?, ?, ?, ?)",
					[name, minutes, seconds, device],
					function(tx, results){},
					//error callback
					function(tx, error) {
						console.log("Error inserting values: " + error.message);
					}
				);
			},
			//error callback
			function(error){
				console.log("Error connecting to DB: " + error.message);
			},
			//success callback
			function(){
				console.log("Connected to DB");
			}
		);
	}, 

	loadTimes: function(displayTimes) {
		databaseHandler.db.readTransaction(
			function(tx){
				tx.executeSql(
					"select * from times",
					[],
					function(tx, results) {
						//display results
						displayTimes(results);
					},
					function(tx, error) {
						console.log("Error selecting times: " + error.message);
					}
				);
			}
		);
	},

	deleteTime: function(_id) {
		databaseHandler.db.transaction(
			function(tx) {
				tx.executeSql(
					"delete from times where _id = ?",
					[_id],
					function(tx, results) {},
					function(tx, error) {
						console.log("Error deleting row: " + error.message);
					}
				);
			}
		);
	}
}