from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/<str:room_name>/', consumers.ChatConsumer.as_asgi()),
    path('ws/lobby/',consumers.GameLobbyConsumer.as_asgi()),
    path('ws/cgame/',consumers.GameRoomComputerConsumer.as_asgi())
]
