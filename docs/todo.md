
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
      returns the brief thumbs up information.  If the user created the
      thumbs up, then the user should be able to see its details.
    * Acknowledgements need to use an update and where clause instead of
      save when deducting points.
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
