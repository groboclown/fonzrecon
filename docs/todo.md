
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
    * Admin users are limited in the scope of what aaays they can see.
      They should be able to see all the aaays.
  * Future Features:
    * Allow a user who received an aaay to thumb up the aaay, if there were
      additional people who received the aaay.  The user who gives the
      thumbs up should not be awarded the points, though.
    * Implement prize schema and API.
    * Add query parameters for listing users.
    * Send a notification (email, etc) to a user who received points.
    * Current split of details and brief probably isn't going to work
      for aaays.  Instead, the aaays should all have the same format that
      they return, but the points value should be nulled out if the user
      can't see that one specific aaay details (that is, it's public but
      the user isn't in the list of receivers or giver).  This should
      also apply to thumbs ups.
* bot:
  * MS Teams:
    * access through MS Teams
      * [http://www.npmjs.com/package/botbuilder]
    * Start with simple hello world
    * Eventually, access through Team channel
