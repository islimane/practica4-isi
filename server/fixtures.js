//Add tasks in a list
function generateRandomTasks(listName){
    var list = Lists.findOne({name: listName});
    var todosNames = [listName + " task 1",
                                       listName + " task2", 
                                       listName + " task3"];

    for(var i= 0; i<todosNames.length; i++){
        var data = {
            name: todosNames[i],
            completed: false,
            createdAt: new Date(),
            createdBy: list.createdBy,
            listId: list._id
        }
        Todos.insert(data);
    }
}

//Create random lists
function generateRandomLists() {
    var listsNames = ["List 1",
                                    "List 2",
                                    "List 3"];
    var idPepe = Accounts.findUserByEmail("pepe@gmail.com")._id;
    for (var i = 0; i < listsNames.length; i++) {
        var data = {
            name: listsNames[i],
            createdBy: idPepe
        }
        Lists.insert(data);
        generateRandomTasks(listsNames[i]);
    }
}

// FIXTURES
if (process.env.IS_MIRROR) {
    Meteor.methods({
        'loadFixtures': function(){
            console.log('Loading default fixtures');
            Accounts.createUser({
                email: 'pepe@gmail.com',
                password: '123456'
            });
            generateRandomLists();
            console.log('Finished loading default fixtures');
        },

        'clearDB': function(){
            console.log('Clear DB');

            var collectionsRemoved = 0;
            var db = Meteor.users.find()._mongo.db;
            db.collections(function (err, collections) {
                var appCollections = _.reject(collections, function (col) {
                    return col.collectionName.indexOf('velocity') === 0 ||
                    col.collectionName === 'system.indexes';
                });

                _.each(appCollections, function (appCollection) {
                    appCollection.remove(function (e) {
                        if (e) {
                            console.error('Failed removing collection', e);
                            fut.return('fail: ' + e);
                        }
                        collectionsRemoved++;
                        console.log('Removed collection');
                        if (appCollections.length === collectionsRemoved) {
                            console.log('Finished resetting database');
                        }
                    });
                });
            });
            console.log('Finished clearing');
        }
    });
}
