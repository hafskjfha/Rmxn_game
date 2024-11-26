import json,redis,logging,traceback
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs

logger = logging.getLogger('common')

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # 그룹에 추가
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # 그룹에서 제거
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # 그룹에 메시지 전송
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # 클라이언트에 메시지 전송
        await self.send(text_data=json.dumps({
            'message': message
        }))

class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


class GameLobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            query_params = parse_qs(self.scope['query_string'].decode())
            nickname = query_params.get('nickname', [None])[0]
            if nickname:
                self.nickname = nickname
                await self.channel_layer.group_add(
                'lobby',
                self.channel_name
                )
                # 클라이언트와의 연결을 허용합니다.
                await self.accept()
            else:
                # 닉네임이 없는 경우 연결을 거부할 수 있습니다.
                await self.close(4000,reason='Nickname is required to connect to the lobby.')
        except Exception as e:
            errorm= str(e)
            formatted_tb = traceback.format_tb(e.__traceback__)
            for l in formatted_tb:
                e+=l+'\n'
            logger.error(errorm)
            await self.close(1006,reason='server error')
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'lobby',
            self.channel_name
        )

    async def receive(self, text_data=None):
        try:
            data:dict[str,str] = json.loads(text_data)
            commend = data.get('commend','')
            if commend:
                if commend=="room_create":
                    if 'name' not in commend or 'number' not in commend or 'setting' not in commend:
                        await self.send(text_data=json.dumps({
                            'error': 'Commend is required.'
                        }))
                        return
                    
                    await self.channel_layer.group_send(
                    'lobby',
                        {
                             'type': 'room_create',
                             'name': commend['name'] ,
                             'number': commend['number'],
                             'setting': commend['setting']
                        }
                    )
                elif commend=="room_delete":
                    if 'name' not in commend or 'number' not in commend or 'setting' not in commend:
                        await self.send(text_data=json.dumps({
                            'error': 'Commend is required.'
                        }))
                        return
                    await self.channel_layer.group_send(
                    'lobby',
                        {
                             'type': 'room_delete',
                             'name': commend['name'] ,
                             'number': commend['number'],
                        }
                    )

            else:
                await self.send(text_data=json.dumps({
                        'error': 'Commend is required.'
                    }))
                return
        
        except Exception as e:
            errorm= str(e)
            formatted_tb = traceback.format_tb(e.__traceback__)
            for l in formatted_tb:
                e+=l+'\n'
            logger.error(errorm)
            self.send('server error')

    async def room_create(self,e):
        room_name = e['name']
        room_number = e['number']
        room_setting = e['setting']

        await self.send(text_data=json.dumps({
            'message_type':'room_create',
            'room_name': room_name,
            'room_number':room_number,
            'room_setting':room_setting
        }))

    async def room_delete(self,e):
        room_name = e['name']
        room_number = e['room_number']

        await self.send(json.dumps({
            'message_type':'room_delete',
            'room_name': room_name,
            'room_number':room_number,
        }))

    async def room_setting_change(self,e):
        pass