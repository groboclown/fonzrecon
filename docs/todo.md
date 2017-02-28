
# TODO Items


* rest-server:
  * Permissions
    * Correctly wire in passport authentication.
    * Allow for user and login creation.
    * Allow for ticket-based session login.
  * Bugs:
    * Issue with the brief acknowledgements list.  Right now, it only
      returns public acks.  However, it should return public *and*
      the private acks that the user can see.  This will require a more
      complex where clause.
    * Rename the "login" files and db schema to "account".
  * Features:
    * Allow for up-thumbing acknowledgements with optional comments.
    * Implement prize schema and API.
    * Add query parameters for listing users and listing acknowledgements.
  * Document REST API.
* bot:
  * MS Teams:
    * access through MS Teams
      * [http://www.npmjs.com/package/botbuilder]
    * Start with simple hello world
    * Eventually, access through Team channel
