
# TODO Items


* rest-server:
  * Permissions
    * Correctly wire in passport authentication.
    * Allow for account creation.
      * account must have unique email and username.
      * accounts can only be created by admins.
    * Allow for user creation.
      * username and each entry in the names must be globally
        unique.
      * users can only be created by admins.
    * Allow for users to update their user and limited rights
      to update their account.
    * Allow for ticket-based session login.
    * Allow for users to have an associated picture.
  * Bugs:
    * Issue with the brief acknowledgements list.  Right now, it only
      returns public acks.  However, it should return public *and*
      the private acks that the user can see.  This will require a more
      complex where clause.
  * Features:
    * Allow for up-thumbing acknowledgements with optional comments.
    * Implement prize schema and API.
    * Add query parameters for listing users and listing acknowledgements.
* bot:
  * MS Teams:
    * access through MS Teams
      * [http://www.npmjs.com/package/botbuilder]
    * Start with simple hello world
    * Eventually, access through Team channel
