# REST API

# Authentication

The API makes a distinction between login accounts and users.  Users
can participate in the award system.  If a login account does not have
a user, then it cannot be awarded Aaays or give out Aaays.  This allows
for assigning login accounts to a system administrator role, or to an
automated proxy system that performs actions on behalf of other users.

For the automated proxy systems (called *bots*), they should send an
additional parameter, `behalf`, which is set to one of the names of
the requested user.

## Token requests

To use tokens to authenticate requests, send a request to the
[/auth/login](#login) API with the username and password in the JSON
request body.  If the login was valid, the request will return the
`token` parameter.

This token can then be passed in the Authorization header like so:

```
Authorization: JWT (token)
```

Alternatively, the token can be stored in a cookie named `authorization`.

## Token-less Requests

To make requests without tokens, you must pass, either as
query parameters or as part of the JSON request object, the parameters
`username` and `password`.


# Common

## Paging

All `GET` requests that return paged responses share a common set of
query parameters and response formats.


**Query Parameters:**

* Paging:
  * **`page`** - page index to retrieve (base 1).  Defaults to 1.
  * **`perPage`** - number of records per page.  Defaults to 10.
  * **`offset`** - alternative to the `page` argument, to fetch starting
    at the *offset* record.  Defaults to 0.
  * **`delta`** - for UIs that use a page selection display, this returns
    the page numbers *delta* before and *delta* after this returned page.
    Defaults to 5.

**JSON Body:**

If the request allows for a JSON body to be used, then the parameters are passed
in the `page` key of the JSON body.

```json
{
  "page": {
    "page": 1,
    "perPage": 100,
    "offset": 16,
    "delta": 2
  }
}
```


**Returns:**

```json
{
    "results": [
      {}
    ],
    "options": {
        "page": 7,
        "offset": 0,
        "perPage": 10,
        "delta": 5
    },
    "current": 7,
    "last": 18,
    "prev": 6,
    "next": 8,
    "pages": [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
    ],
    "count": 172,
    "type": "Requested Type Name"
}
```

* `results` - an array of the requested objects.
* `options` - contains the fully defined paging options used in the request.
  * `options.page` - corresponds to the `page` request value.
  * `options.offset` - corresponds to the `offset` request value.
  * `options.perPage` - corresponds to the `perPage` request value.
  * `options.delta` - corresponds to the `delta` request value.
* `current` - current page number returned, `null` if the current page is
  invalid.
* `last` - last page selectable, `null` if there are no results.
* `prev` - page before the current one, `null` if there is no previous page.
* `next` - page after current one, `null` if there is no next page.
* `pages` - list of pages within `delta` of the current page number.
* `count` - total number of matching entries.
* `type` - name of the type for all the objects in the `results` list.

## Data Types


### `Aaay`

```json
{
  "id": "58b5cbd4d8d1441418238274",
  "uri": "/api/v1/aaays/58b5cbd4d8d1441418238274/details",
  "type": "Aaay",
  "updatedAt": "2017-02-28T19:13:24.737Z",
  "createdAt": "2017-02-28T19:13:24.737Z",
  "givenBy": {
    "username": "username1",
    "organization": "Org Name",
    "names": [
        "username",
        "Name1, User"
    ],
    "uri": "/api/v1/users/username1",
    "type": "UserBrief"
  },
  "awardedTo": [
    {
      "username": "username2",
      "organization": "Another Org Name",
      "names": [
        "username2",
        "Name2, User"
      ],
      "uri": "/api/v1/users/username2",
      "type": "UserBrief"
    }
  ],
  "comment": "Award comment.",
  "tags": [
    "tag 1",
    "tag 2"
  ],
  "public": true,
  "thumbsUps": [
    {
      "id": "58b5cbd4e2d1441418238274",
      "updatedAt": "2017-02-28T19:13:24.737Z",
      "createdAt": "2017-02-28T19:13:24.737Z",
      "givenBy": {
        "username": "username3",
        "organization": "Another Org Name",
        "names": [
          "username3",
          "Name3, User"
        ],
        "uri": "/api/v1/users/username3",
        "type": "UserBrief"
      },
      "pointsToEachUser": 1,
      "comment": "additional comment",
      "type": "ThumbsUp"
    }
  ],
  "pointsToEachUser": 1
}
```

* `id` - unique identifier for this Aaay.
* `updatedAt` - timestamp when the Aaay was last edited.
* `createdAt` - timestamp when the Aaay was first created.
* `givenBy` - a [UserBrief](#userbrief) for the user that gave the Aaay.
* `awardedTo` - list of [UserBrief](#userbrief) users who were awarded
  the Aaay.
* `comment` - Comment written by the `givenBy` user, describing the
  reason for the Aaay.
* `tags` - list of string values that tag this Aaay.
* `public` - boolean indicating whether the Aaay is publicly viewable.
* `uri` - the relative path to the Aaay.
* `type` - constant `"Aaay"` string.
* `thumbsUps` - a list of [ThumbsUp](#thumbsup) added to the
  Aaay by other users to add their support of the Aaay.
* `pointsToEachUser` - number of points assigned to each user in the
  `awardedTo` list.  If the user does not have permissions to view this
  value, then it will be `null`.


### `ThumbsUp`

```json
{
  "id": "58b5cbd4e2d1441418238274",
  "updatedAt": "2017-02-28T19:13:24.737Z",
  "createdAt": "2017-02-28T19:13:24.737Z",
  "givenBy": {
    "username": "username3",
    "organization": "Another Org Name",
    "names": [
      "username3",
      "Name3, User"
    ],
    "uri": "/api/v1/users/username3",
    "type": "UserBrief"
  },
  "pointsToEachUser": 1,
  "comment": "additional comment",
  "type": "ThumbsUp"
}
```

*Note that the thumbs up can only be seen in context of an
Aaay.  It does not have a URI to reference it.*

* `id` - unique id for this thumbs up.
* `updatedAt` - timestamp when the Thumbs Up was last edited.
* `createdAt` - timestamp when the Thumbs Up was first created.
* `givenBy` - a [UserBrief](#userbrief) for the user who gave the Thumbs Up.
* `pointsToEachUser` - number of points assigned to each user in the
  parent Aaay.  If the requesting  user does not have permissions to view this
  value, then it will be `null`.
* `comment` - optional string describing the reason for the Thumbs Up.
* `type` - constant `"ThumbsUp"` string.


### `User`

```json
{
  "updatedAt": "2017-02-28T19:13:41.853Z",
  "createdAt": "2017-02-28T18:50:34.115Z",
  "username": "username1",
  "pointsToAward": 40,
  "organization": "Engineering",
  "locale": "en-us",
  "receivedPointsToSpend": 30,
  "contacts": [
    {
      "type": "email",
      "server": null,
      "address": "username1@fonzrecon.email.server"
    }
  ],
  "names": [
    "username1",
    "Name1, User"
  ],
  "active": true,
  "type": "User"
}
```

* `updatedAt` - timestamp when the User was last edited.  If the requesting
  user does not have permissions to view this value, then it will be `null`.
* `createdAt` - timestamp when the User was first created.  If the requesting
  user does not have permissions to view this value, then it will be `null`.
* `username` - user's simple name.
* `pointsToAward` - integer; the number of points that this user has left
  to give out in Aaay and Thumbs Up awards.  If the requesting user does
  not have permissions to view this value, then it will be `null`.
* `receivedPointsToSpend` - integer; the number of points available for
  the user to spend on prizes.  If the requesting user does not have
  permissions to view this value, then it will be `null`.
* `contacts` - how to reach the user.  If the requesting user does not have
  permissions to view this value, then it will be `null`.
* `locale` - user's localization category.
* `organization` - string describing the general role of the user.
* `names` - alternative names that the user can be found as.
* `active` - whether the user account is active (enabled for login).
* `type` - constant `"User"` string.



### `UserBrief`

```json
{
  "username": "username3",
  "organization": "Another Org Name",
  "names": [
      "username3",
      "Name3, User"
  ],
  "uri": "/api/v1/users/username3",
  "imageUri": "/static/user/username3.png",
  "type": "UserBrief"
}
```

* `username` - user's simple name.
* `organization` - string describing the general role of the user.
* `names` - alternative names that the user can be found as.
* `uri` - the relative path to the UserBrief.
* `imageUri` - the user's uploaded image.  May be `null`.



### `Prize`

```json
{
  "id": "68b5cbd4e2d144141823827f",
  "name": "Handshake with The President",
  "description": "The President will give you a handshake and a signed photo.",
  "referenceUrl": "https://prizes-are-rewarded/handshake-with-the-prez",
  "purchasePoints": 17,
  "uri": "/api/v1/prizes/68b5cbd4e2d144141823827f",
  "expires": "2010-02-28T18:50:34.115Z",
  "type": "Prize"
}
```

* `id` - identifier for the prize; used when claiming the prize.
* `name` - a short description of the prize; usually used as a title.
* `description` - a long description about the prize.
* `referenceUrl` - an optional URL to find out more.
* `purchasePoints` - how many points it takes to claim this prize.
* `expires` - optional date describing when the prize will (or did)
  expire and become no longer available to claim.



### `ClaimedPrize`

```json
{
  "id": "68b5cbd4e2d144141823beef",
  "claimedByUser": { (UserBrief) },
  "prize": { (Prize) },
  "createdAt": "2016-02-28T18:50:34.115Z",
  "uri": "/api/v1/claimed-prize/68b5cbd4e2d144141823beef",
  "type": "ClaimedPrize"
}
```

* `id` - identifier for the redemtion.
* `claimedByUser` - a [UserBrief](#userbrief) for the person who redeemed
  points for the prize.
* `prize` - the [Prize](#prize) that was claimed.
* `createdAt` - when the redemtion occurred.
* `type` - static "ClaimedPrize" string.




# Authentication API

## POST `/auth/login`

Logs in with the simple username/password authorization.  Returns a
token that can be used for future requests without sending the username
and password with each request.

The login token returned is only valid for the requesting browser, until the
listed expiration time.

The returned `token` value can be used in future requests by adding it to
the headers as:

```
Authorization: JWT (token string)
```

**Access:** all requests.

**JSON Body:**

```json
{
  "username": "request user name",
  "password": "user's password"
}
```

**Returns:**

TODO return user "me" object.

```json
{
    "token": "fSxyKq7iGp3osOHnqoo2Mz3EJZ0V5ZOYYOiWKqwmBe128rh3Exso2GUeSOl5bZoKRPIvqW3hgOpe46D8CBFLFw==",
    "expires": "2013-04-08T21:31:03.818Z"
}
```



## POST `/auth/logout`

Removes the requestor's token from the system, so that it can no longer be
used in future requests.

This requests takes no parameters or body values as input.  It returns an
empty JSON object (`{}`).



## PUT `/auth/validate`

Validates a user's request for a password change.  This should be called after
a new user is created, or if the user requested the change in password.

**Access:** all users.

**JSON Body:**

```json
{
  "resetAuthenticationToken": "very-long-token-sent-through-email",
  "username": "yourusername",
  "password": "New Password"
}
```

**Returns:**

```json
{}
```

Also, sends an email to the user's account indicating a password change event
occurred.


## PUT `/auth/password-change`

Requests a password change.  The request will send a link to the user through
email to allow the user to reset the account's password.

**Access:** all users.

**JSON Body:**

```json
{
  "username": "myusername",
  "email": "my@email"
}
```

You can pass in either username or email; both are not required.

**Returns:**

```json
{}
```

The user will receive an email with the details to reset the password.

Note: there is no error reported if the user or email specified are not
registered.



# User Access API

## GET `/api/v1/users`

Retrieves the paged list of users, with brief details.

**Access:** all authenticated users.

**Query Parameters:**

* Paging:
  * Accepts the standard [paging](#paging) parameters.
* `like` - a regular expression for matching the username or names.
* `all` - if set to `true`, then the list will include active and
  inactive users.

**Returns:**

The returned value conforms to the [paging](#paging) results.  The type
returned is [UserBrief](#userbrief).



## GET `/api/v1/users/:username`

Retrieve the details of the user.

**Access:** all authenticated users.

**Returns:**

```json
{
  "User": { ... }
}
```

* `User` - a [User](#user) object for the requested user.



## GET `/api/v1/users/about-me`

Retrieve the details of the current user with additional information useful
for interface rendering.

**Access:** all authenticated users.

**Returns:**

```json
{
  "User": { ... },
  "isAdmin": true,
  "hasPendingVerification": false
}
```

* `User` - a [User](#user) object for the current user.
* `isAdmin` - boolean declaring whether the current user has administrative
    access or not.
* `hasPendingVerification` - boolean indicating whether there's a pending
    request to reset the user's password.



## POST `/api/v1/users`

Create a new user.

The users created by this action will be assigned the `USER` role.  To create
other kinds of accounts, an administrator (*not bot*) must use the `/auth/account`
function.

After creation, the user will not be able to log into the account until the
account is verified.  The user must use the returned `resetAuthenticationToken`
value before it expires in order to set a password and be able to log in.

**Access:** Administrators and bots only.  Bots are allowed to create users in
the situation where a user is sending to a known user in the external system
(say, the LDAP server), but the user hasn't been created in the site.

**JSON Body:**

```json
{
  "user": {
    "username": "uniqueusername",
    "email": "my.name@somewhere",
    "names": ["Alias 1", "One, Alias"],
    "pointsToAward": 0,
    "organization": "Sales",
    "locale": "en"
  }
}
```

The `pointsToAward` value determines the starting number of points the
user can give.

**Returns:**

```json
{}
```


## POST `api/v1/users/batch-import`

Imports a list of users into the system.

If the request is a multi-part file upload, then the import will attempt
to load the `csvUsers` named file as a CSV file.  The mime type of the
file must be `text/csv`.  The CSV file must have column names that match
up with the JSON body key names.  The one exception is the `names` column.
Instead, the CSV file should have a `name` header, and that value plus the
username will be set as the list of names for the user.

If the request is not a multi-part file upload, then the users to import
must be in the JSON-formatted body text.

**Access:** Administrators only.

**JSON Body:**

```json
{
  "users": [
    {
      "username": "uniqueusername",
      "email": "my.name@somewhere",
      "names": ["Alias 1", "One, Alias"],
      "pointsToAward": 0,
      "organization": "Sales",
      "locale": "en",
      "role": "USER"
    }
  ]
}
```

The `pointsToAward` value determines the starting number of points the
user can give.

**Returns:**

```json
{ "results": [
    {
      "username": "uniqueusername",
      "status": "created"
    },
    {
      "username": "bad-user",
      "status": "rejected",
      "details": [
        {
          "param": "username",
          "value": "bad-user",
          "details": "can contain only numbers and lowercase letters"
        }
      ]
    }
  ]
}
```


## PUT `api/v1/users/:id`

Updates a select number of fields for the user with the given ID.

**Access:** Administrators and the user with the given ID.

**JSON Body:**

```json
{
  "locale": "en-us",
  "organization": "HR"
}
```

* `locale` (optional) - the user's locale for sending contact information.
* `organization` (optional) - the organization the user is associated with.

**Returns:**

```json
{}
```


## PUT `api/v1/users/:id/role`

Updates the role of the account associated with the given username.  The
user can only be switched between `USER` and `ADMIN` roles, and cannot be
made into a `BOT` account.

**Access:** Administrators only.

**JSON Body:**

```json
{
  "role": "USER or ADMIN"
}
```

* `role` - must be one of `"USER"` or `"ADMIN"`.

**Returns:**

```json
{}
```


## PUT `api/v1/users/reset-points-to-award`

Updates all active users to have a specific number of points to award.

**Access:** Administrators only.

**JSON Body:**

```json
{
  "points": 100
}
```

**Returns:**

```json
{
  "updateCount": 3
}
```


## PUT `api/v1/users/:id/reset-points-to-award`

Updates the given user to have a specific number of points to award.

**Access:** Administrators only.

**JSON Body:**

```json
{
  "points": 100
}
```

**Returns:**

```json
{
  "updateCount": 1
}
```


## DELETE `api/v1/users/:id`

Marks the account with the given username as disabled.  The account cannot
be logged into, and cannot be found through searching, but it still exists
in the database.

**Access:** Administrators only.

**JSON Body:** None

**Returns:**

```json
{}
```


# Aaay Access API

## GET `api/v1/aaays`

Retrieve the paged list of Aaay awards, with a brief description.

**Access:** all authenticated users.

**Query Parameters:**

* Paging:
  * Accepts the standard [paging](#paging) parameters.
* **`comment`** - a substring within the Aaays comments.
* **`name`** - a user who gave an Aaay or received an Aaay.

**Returns:**

The returned value conforms to the [paging](#paging) results.  The type
returned is [Aaay](#aaay).



## GET `api/v1/aaays/:id`

Retrieve a brief description of the Aaay award.

**Access:** all authenticated users.

**Returns:**

```json
{
  "Aaay": { ... }
}
```

* `Aaay` - an [Aaay](#aaay) object of the requested id.



## POST `api/v1/aaays`

Create a new award.  The award will be given by the currently authenticated
user, or the user requested from a bot.

**Access:** all authenticated users.

**Body Schema:**

```json
{
    "to": ["Name2, User", "username3"],
    "points": 1,
    "public": true,
    "comment": "These folks did great.",
    "tags": ["All In", "Teamwork"]
}
```

* `to` - list of strings for each user's name that should be awarded.
* `points` - number of points to assign to *each user* in the `to` list.
* `public` (optional, defaults to `true`) - if false, then only the users
  in the `to` list and the user who gave the Aaay can see this award.
  Otherwise, all authenticated users can see it.
* `comment` - String (4 to 4000 characters long) describing the reason for
  the award.
* `tags` - array of strings describing the category of the award.

**Returns:**

An `AaayRef` that describes the ID of the created Aaay.



## POST `api/v1/aaays/:id/thumbsUp`

Create a new thumbs up for this award.  The award will be given by the
currently authenticated user, or the user requested through a bot.

**Access:** all authenticated users who have visibility into the Aaay.

**Body Schema:**

```json
{
  "points": 1,
  "comment": "Good job!"
}
```

* `points` - number of points to add to the Aaay.  Must be a positive integer.
* `comment` - optional additional text to post to the Aaay.



# Prize API

## GET `api/v1/prizes`

Returns a list of prizes that the user can claim for awarded points.

**Access:** all authenticated users.

**Query Parameters:**

* Paging:
  * Accepts the standard [paging](#paging) parameters.
* **`maximum`** - maximum number of points.

**Returns:**

The returned value conforms to the [paging](#paging) results.  The type
returned is [Prize](#prize) objects.



# Claimed Prize API

## GET `api/v1/claimed-prizes`

Retrieve all the prizes claimed by users.

**Access:** all authenticated users.

**Query Parameters:**

* Paging:
  * Accepts the standard [paging](#paging) parameters.
* **`user`** - user name to search for claimed prizes.

**Returns:**

The returned value conforms to the [paging](#paging) results.  The type
returned is [ClaimedPrize](#claimedprize) objects.



## GET `api/v1/claimed-prizes/:id`

Retrieve the single claimed prize with the given id.

**Access:** all authenticated users.

**Query Parameters:** None.

**Returns:**

A [ClaimedPrize](#claimedprize) object.



## POST `api/v1/claimed-prizes`

Claims a prize for the requesting user.

**Access:** Users with the `USER` role.  Administrators cannot claim prizes!

**Request Body:**

```json
{
  "prizeChoiceId": "prize id"
}
```

* `prizeChoiceId` - ID of the prize to claim.

**Returns:**

```json
{
  "id": "58be287d0f686b16c03bd62a",
  "uri": "/api/v1/claimed-prizes/58be287d0f686b16c03bd62a",
  "type": "ClaimedPrizeRef"
}
```

* `id` - the identifier of the claimed prize.
* `uri` - a pointer to the location of the claimed prize.
* `type` - the static "ClaimedPrizeRef" string.



# Settings API

## GET `api/v1/settings`

Retrieves a map of all the site-wide settings.

**Access:** Only viewable by administrators.  Bots cannot access it.

**Query Parameters:** None.

**Returns:**

```json
{
  "KeyName": {
    "key": "KeyName",
    "description": "Untranslated description of the key",
    "valueType": "string type describing the value object",
    "value": "current setting; type is key dependent"
  },
  ...
}
```



## PUT `api/v1/settings`

Updates one or more site-wide setting values.

**Access:** Only administrators.

**Request Body:**

A sub-set of the list of settings that should be updated.

```json
{
  "settings": {
    "KeyName": "key value; type is key dependent",
    ...
  }
}
```

**Returns:**

The map of final setting values that were updated in the request.
This is a subset of the values returned by [GET](#getapiv1settings).


## GET `auth/site-settings`

Fetches the public site settings.

**Access:** Everyone.

**Query Parameters:** None.

**Returns:**

```json
{
  "SiteName": "Text name",
  "SiteBannerImage": "images/banner.png",
  "SiteSmallImage": "images/site-128x128.png",
  "SiteIconImage": "images/site-icon.png"
}
```
