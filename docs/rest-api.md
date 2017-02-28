# REST API

# Authentication

Current authentication is trivially simple.  You must pass, either as
query parameters or as part of the JSon request object, the parameters
`username` and `password`.

The API makes a distinction between login accounts and users.  Users
can participate in the award system.  If a login account does not have
a user, then it cannot be awarded Aaays or give out Aaays.  This allows
for assigning login accounts to a system administrator role, or to an
automated proxy system that performs actions on behalf of other users.

For the automated proxy systems (called *bots*), they should send an
additional parameter, `behalf`, which is set to one of the names of
the requested user.


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
  "thumbsUp": [
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
* `thumbsUp` - a list of [ThumbsUp](#thumbsup) added to the
  Aaay by other users to add their support of the Aaay.
* `pointsToEachUser` - number of points assigned to each user in the
  `awardedTo` list.


### `AaayBrief`

```json
{
  "id": "58b5cbd4d8d1441418238274",
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
  "uri": "/api/v1/aaay/58b5cbd4d8d1441418238274",
  "type": "AaayBrief",
  "thumbsUp": [
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
      "comment": "additional comment",
      "type": "ThumbsUpBrief"
    }
  ]
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
* `uri` - the relative path to the AaayBrief.
* `type` - constant `"AaayBrief"` string.
* `thumbsUp` - a list of [ThumbsUpBrief](#thumbsupbrief) added to the
  Aaay by other users to add their support of the Aaay.


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
  parent Aaay.
* `comment` - optional string describing the reason for the Thumbs Up.
* `type` - constant `"ThumbsUp"` string.



### `ThumbsUpBrief`

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
  "comment": "additional comment",
  "type": "ThumbsUpBrief"
}
```

*Note that the thumbs up can only be seen in context of an
Aaay.  It does not have a URI to reference it.*

* `id` - unique id for this thumbs up.
* `updatedAt` - timestamp when the Thumbs Up was last edited.
* `createdAt` - timestamp when the Thumbs Up was first created.
* `givenBy` - a [UserBrief](#userbrief) for the user who gave the Thumbs Up.
* `comment` - optional string describing the reason for the Thumbs Up.
* `type` - constant `"ThumbsUpBrief"` string.


### `User`

```json
{
  "updatedAt": "2017-02-28T19:13:41.853Z",
  "createdAt": "2017-02-28T18:50:34.115Z",
  "username": "username1",
  "pointsToAward": 40,
  "organization": "Engineering",
  "receivedPointsToSpend": 30,
  "contact": [
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
  "type": "User"
}
```

* `updatedAt` - timestamp when the User was last edited.
* `createdAt` - timestamp when the User was first created.
* `username` - user's simple name.
* `pointsToAward` - integer; the number of points that this user has left
  to give out in Aaay and Thumbs Up awards.
* `organization` - string describing the general role of the user.
* `names` - alternative names that the user can be found as.
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
  "type": "UserBrief"
}
```

* `username` - user's simple name.
* `organization` - string describing the general role of the user.
* `names` - alternative names that the user can be found as.
* `uri` - the relative path to the UserBrief.



# User Access API

## GET `/api/v1/users`

Retrieves the paged list of users, with brief details.

**Access**: all authenticated users.

**Query Parameters:**

* Paging:
  * Accepts the standard [paging](#paging) parameters.
* *TODO this API needs ways to search the list of users.*

**Returns:**

The returned value conforms to the [paging](#paging) results.  The type
returned is [UserBrief](#userbrief).



## GET `/api/v1/users/:username`

Retrieve a brief description of the user.

**Access**: all authenticated users.

**Returns:**

```json
{
  "UserBrief": { ... }
}
```

* `UserBrief` - a [UserBrief](#userbrief) object for the requested user.



## GET `/api/v1/users/:username/details`

Retrieve details about a specific user.

**Access**: Only the specific user, or bots acting as the specific user.

**Returns:**

```json
{
  "User": { ... }
}
```

* `User` - a [User](#user) object for the requested user.



# Aaay Access API

## GET `api/v1/aaays`

Retrieve the paged list of Aaay awards, with a brief description.

**Access**: all authenticated users.

**Query Parameters:**

* Paging:
  * Accepts the standard [paging](#paging) parameters.
* *TODO this API needs ways to search the list of users.*

**Returns:**

The returned value conforms to the [paging](#paging) results.  The type
returned is [AaayBrief](#aaaybrief).



## GET `api/v1/aaays/:id`

Retrieve a brief description of the Aaay award.

**Access**: all authenticated users.

**Returns:**

```json
{
  "AaayBrief": { ... }
}
```

* `AaayBrief` - an [AaayBrief](#aaaybrief) object of the requested id.



## GET `api/v1/aaays/:id/details`

Retrieve details about the Aaay award.

**Access**: Only the specific user, or bots acting as the specific user,
which either gave the award, or was awarded to.  Those who only "thumb up"
the award cannot see this detail level.

**Returns:**

```json
{
  "Aaay": { ... }
}
```

* `Aaay` - an [Aaay](#aaay) object of the requested id.



## POST `api/v1/aaays`

Create a new award.  The award will be given by the currently authenticated
user, or the bot acting as a user.

**Access**: all authenticated users.

**Body Schema**:

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