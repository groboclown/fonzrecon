
# TODO Items


* rest-server:
  * Permissions
    * Correctly wire in passport authentication.
  * Bugs:
    * Queries for aaays will not report the points to each user if the
      user isn't part of the aaay, but gave the thumbs up.
    * User authentication - should it be allowed if a user has a pending
      validation token?
    * PUT settings doesn't correctly list out the validation problems.
  * Future Features:
    * Allow a user who received an aaay to thumb up the aaay, if there were
      additional people who received the aaay.  The user who gives the
      thumbs up should not be awarded the points, though.
    * Add query parameters for listing users.
    * Implement general notification framework.
    * Properly implement email sending.
    * Allow users to upload an image.
    * Allow for account creation for special user types (bots & admins).
      * account must have unique email and username.
      * accounts can only be created by admins.
    * Allow for users to update their user and limited rights
      to update their account.
    * Allow for prize creation, editing, and expiring.
    * Allow for claimed prize pending state and corresponding interactions.
* bot:
  * MS Teams:
    * access through MS Teams
      * [http://www.npmjs.com/package/botbuilder]
    * Start with simple hello world
    * Eventually, access through Team channel
