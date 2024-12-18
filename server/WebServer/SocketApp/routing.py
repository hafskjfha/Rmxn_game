from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/lobby/',consumers.GameLobbyConsumer.as_asgi()),
    path('ws/cgame/',consumers.GameRoomComputerConsumer.as_asgi())
]
