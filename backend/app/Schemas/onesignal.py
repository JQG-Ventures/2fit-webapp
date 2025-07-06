from marshmallow import Schema, fields, validate


class PlayerIDSchema(Schema):
    player_id = fields.Str(required=True, validate=validate.Length(min=5))
    platform = fields.Str(required=False, missing="web")
