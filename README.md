# Programs needed
In order to get it working you will need local instances of Redis, PostgresQL and Neo4j.

# MongoDB
MongoDB already has a cluster deployed in the cloud and therefore there is no further installation process tied with it. 

# PostgresQL
PostgresQL does not need pre populated data to get the system to work you do however need to create the different tables, trigger, checks, and stored procedures. This can be done with the sql script backup.sql in the folder postgressBackup/. 
# Neo4j
In order to populate Neo4j you need to run the commands in the file citiesNeo4jRelations.txt found in the folder dataGenScripts/, in order to set up Neo4j configurations run the file neo4jConfig.txt in the same folder. This will create all the cities and their respective relations.

# Backend
In order to start the backend server that handles the management of the databases, run “node index.js”. You can also enter jeperlt-frontend/ en use the command “npm start” to get the backend running. 
 
