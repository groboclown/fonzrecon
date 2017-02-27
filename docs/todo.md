
# TODO Items


* rest-server:
  * Permissions
    * Correctly wire in passport authentication.
    * Enable full validation of acknowledgement POST.
    * Allow for user and login creation.
    * Allow for ticket-based session login.
    * Allow for up-thumbing acknowledgements.
    * Implement prize schema and API.
    * Error messages should be more descriptive if it comes from a bad request;
      they should return a message as well as a data block that doesn't require
      string parsing.  Forbidden or unauthorized should still be limited.
    * Add query parameters for listing users and listing acknowledgements.
    * Response of user information should include the relative URL of the
      returned user.
      * Get a list of users; each user needs the link.
      * Get an acknowledgement with references to users.
    * Document REST API.
* bot:
  * MS Teams:
    * access through MS Teams
      * [http://www.npmjs.com/package/botbuilder]
    * Start with simple hello world
    * Eventually, access through Team channel
