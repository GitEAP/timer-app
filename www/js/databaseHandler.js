var databaseHandler = {
	db: null,
	createDatabase: function() {
		// create database (name, version, display name), size, optional callback
		this.db = window.openDatabase("timer.db", "1.0", "timer database", 3000000);
		this.db.transaction(
			function(tx) {
				//sql query
				tx.executeSql(
					"create table if not exists times(_id integer primary key, name text, minutes integer, seconds integer, device text)",
					[],
					function(tx, results){},
					function(tx, error) {
						console.log("Error creating table: " + error.message);
					}
				);

			},
			//error call back
			function(error) {
				console.log("Error: " + error.message);
			},
			//success callback
			function() {
				console.log("Created DB successfully");
			}
		);
	}	
}