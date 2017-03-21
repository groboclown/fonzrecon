
# TODO Items


* rest-server:
  * Bugs:
    * Queries for aaays will not report the points to each user if the
      user isn't part of the aaay, but gave the thumbs up.  The user should
      see her own thumbs up points, but not the other points.
    * User authentication - should it be allowed if a user has a pending
      validation token?
  * Future Features:
    * Allow a user who received an aaay to thumb up the aaay, if there were
      additional people who received the aaay.  The user who gives the
      thumbs up should not be awarded the points, though.
    * Properly implement email sending (needs testing).
    * Allow users to upload an image.
    * Allow for account creation for special user types (bots & admins).
      * account must have unique email and username.
      * accounts can only be created by admins.
    * Allow for users to update their user and limited rights
      to update their account.
    * Allow for prize creation, editing, and expiring.
    * Allow for claimed prize pending state and corresponding interactions.
    * Better utilize the "env" structure, rather than doing checks on the
      envName variable.
* bot:
  * MS Teams:
    * access through MS Teams
      * [http://www.npmjs.com/package/botbuilder]
    * Start with simple hello world
    * Eventually, access through Team channel
