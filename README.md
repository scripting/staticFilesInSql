# staticFilesInSql

Manage static files for users in a MySQL table.

### What this is

We need to get static files for users in FeedLand and have been having trouble getting that to work with S3 for some reason. Let's do the same thing in an SQL table, and be done with it. 

Here's the command to create the table.

```code SQLcreate table staticfiles (	screenname  varchar (255), 	relpath varchar (255), 	type varchar (64),	filecontents text,	flprivate boolean,	whenCreated datetime, 	whenUpdated datetime, 	ctSaves int default 0,	primary key (screenname, relpath, flprivate)	);```

