// //prefixes of implementation that we want to test
// window.indexedDB = window.indexedDB || window.mozIndexedDB || 
// window.webkitIndexedDB || window.msIndexedDB;

// //prefixes of window.IDB objects
// window.IDBTransaction = window.IDBTransaction || 
// window.webkitIDBTransaction || window.msIDBTransaction;
// window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || 
// window.msIDBKeyRange

// if (!window.indexedDB) {
//    window.alert("Your browser doesn't support a stable version of IndexedDB.")
// }

var timerDB = (function() {
  var tDB = {};
  var datastore = null;

  /**
    * Open a connection to the datastore.
    */
   tDB.open = function(callback) {
     // Database version.
     var version = 1;

     // Open a connection to the datastore.
     var request = indexedDB.open('timers', version);

     // Handle datastore upgrades.
     request.onupgradeneeded = function(e) {
       var db = e.target.result;

       e.target.transaction.onerror = tDB.onerror;

       // Delete the old datastore.
       if (db.objectStoreNames.contains('timers')) {
         db.deleteObjectStore('timers');
       }

       // Create a new datastore.
       var store = db.createObjectStore('timers', {
         keyPath: 'timestamp'
       });
     };

     // Handle successful datastore access.
     request.onsuccess = function(e) {
       // Get a reference to the DB.
       datastore = e.target.result;
       console.log("connected to DB");

       // Execute the callback.
       callback();
     };

     // Handle errors when opening the datastore.
     request.onerror = tDB.onerror;
   };


   /**
    * Fetch all of the items in the datastore.
    */
   tDB.fetchItems = function(callback) {
     var db = datastore;
     var transaction = db.transaction(['timers'], 'readwrite');
     var objStore = transaction.objectStore('timers');

     var keyRange = IDBKeyRange.lowerBound(0);// all or 0 and up
     var cursorRequest = objStore.openCursor(keyRange);

     var timers = [];

     transaction.oncomplete = function(e) {
       // Execute the callback function.
       callback(timers);
     };

     cursorRequest.onsuccess = function(e) {
       var result = e.target.result;// get item

       // check if item is found if false stop else continue
       if (!!result == false) {
         return;
       }

       timers.push(result.value);// add to array

       result.continue();// loop through each item in DB
     };

     cursorRequest.onerror = tDB.onerror;
   };

   /**
    * Create a new item.
    */
   tDB.createTimer = function(name, minutes, seconds, device, callback) {
     // Get a reference to the db.
     var db = datastore;

     // Initiate a new transaction.
     var transaction = db.transaction(['timers'], 'readwrite');

     // Get the datastore.
     var objStore = transaction.objectStore('timers');

     // Create a timestamp for the timers item.
     var timestamp = new Date().getTime();

     // Create an object for the timers item.
     var timers = {
       'name': name,
       'minutes': minutes,
       'seconds': seconds,
       'device': device,
       'timestamp': timestamp
     };

     // Create the datastore request.
     var request = objStore.put(timers);

     // Handle a successful datastore put.
     request.onsuccess = function(e) {
       // Execute the callback function.
       callback(timers);
     };

     // Handle errors.
     request.onerror = tDB.onerror;
   };

   /**
    * Delete an item.
    */
   tDB.deleteTimer = function(id, callback) {
     var db = datastore;
     var transaction = db.transaction(['timers'], 'readwrite');
     var objStore = transaction.objectStore('timers');
     var request = objStore.delete(parseInt(id));

     request.onsuccess = function(e) {
      console.log("item deleted");
       callback();
     }

     request.onerror = function(e) {
       console.log(e);
     }
   };



  // Export the tDB object.
  return tDB;
}());