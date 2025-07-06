"""
Schema for validating OneSignal player ID payloads used in push notification registration.

Includes:
- `player_id`: Unique identifier from OneSignal.
- `platform`: Device platform (default: "web").
"""

from marshmallow import Schema, fields, validate


class PlayerIDSchema(Schema):
    """
    Schema for validating the player ID and platform data when registering a device.

    Fields:
        player_id (str): OneSignal player ID (required, minimum 5 characters).
        platform (str): Platform of the device (e.g., "web", "android", "ios"). Defaults to "web".
    """

    player_id = fields.Str(required=True, validate=validate.Length(min=5))
    platform = fields.Str(required=False, missing="web")
