# In-memory database
rooms = ["Room A", "Room B", "Room C"]
bookings: dict[str, list[dict]] = {}
# { room_name: [ { start, end, code, room } ] }