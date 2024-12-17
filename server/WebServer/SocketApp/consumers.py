import json,logging,traceback,asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from DBapp.redis.redisc import redis_clinet_manager
from Game.game_contol import ComputerGameHander
from datetime import datetime, timedelta, timezone

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
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    async def receive(self, text_data=None, bytes_data=None):
        try:
            data:dict[str,str] = json.loads(text_data)
            commend = data.get('commend','')
            if commend=="setting_change":
                self.room_setting_change(data)
                return
            #elif ~~

        except Exception as e:
            errorm=repr(e)
            logger.error(errorm)
            await self.send('server error')
        
    
    async def room_setting_change(self,setting:dict[str,str]):
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'lobby',  
            {
                'type': 'room_setting_change',  
                'number': setting['number'],
                'name':setting['name'],
                'setting':setting['setting']
            }
        )

rediz = redis_clinet_manager()
cores:dict[str,ComputerGameHander] = dict()
async def com(coc:ComputerGameHander)->dict[str,str|int]:
    for _ in range(4):
        bb,n,m = await coc.main(command={'computer':'1'})
        if not bb:
            continue
        return {
                    'type':'cturn_yes',
                    'message':m,
                    'word':n,
                    "chain":coc.chain   
                }
    
    return {
                        'type':'cturn_no',
                        'message':'no_word',
                        'word':n
                    }

class GameRoomComputerConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = rediz.find_or_create_room()
            self.room_group_name = f"cgame_{self.room_name}"

            rediz.redis_client.hincrby(self.room_name, "user_count", 1)

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()
            await self.send(text_data=json.dumps({'info': f'room id = {self.room_group_name}'}))
            if self.room_group_name not in cores:
                cores[self.room_group_name] = ComputerGameHander()
        
        except Exception as e:
            logger.error(repr(e))
            await self.close(1006)
    
    async def disconnect(self,code):
        rediz.redis_client.hincrby(self.room_name, "user_count", -1)

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data:dict[str,str] = json.loads(text_data)
            command = data.get('command', '')
            if not command:
                await self.send(text_data=json.dumps({
                    'error':'no command'
                }))
                return
            
            if 'game_start' == command:
                cc = cores[self.room_group_name]
                pt,s = await cc.main(command={'start':'1'})
                start_time = datetime.now(timezone.utc)
                tt = cc.turn_time
                end_time = start_time + timedelta(seconds=tt)
                await self.channel_layer.group_send(
                    self.room_group_name,{
                    'type':'game_start',
                    'start_letter':s,
                    'player_turn':pt,
                    "start_time": start_time.isoformat(),
                    "time_limit": tt
                })
                self.ptinfo = {
                    'st':start_time,
                    'et':end_time
                }
                
                return

            if 'user_input' == command:
                uinput = data.get('input','')
                if not uinput:
                    return await self.send(text_data=json.dumps({
                        'error':'no input'
                    }))
                pt_time = datetime.now(timezone.utc)
                if not pt_time <= self.ptinfo["et"]:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type':'turn_over',
                            'message':'over'
                        }
                    )
                    return
                coc = cores[self.room_group_name]
                bb,n = await coc.main(command={'input':uinput})
                if not bb:
                    lll = coc.st_letter if coc.st_letter==coc.sust_letter else f'{coc.st_letter}({coc.sust_letter})'
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type':'pturn_no',
                            'message':n,
                            'word':uinput,
                            'letter':lll
                        }
                    )
                    return
                lll = coc.st_letter if coc.st_letter==coc.sust_letter else f'{coc.st_letter}({coc.sust_letter})'
                start_time = datetime.now(timezone.utc)
                tt = coc.turn_time
                end_time = start_time + timedelta(seconds=tt)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type':'pturn_yes',
                        'message':n,
                        'word':uinput,
                        'letter':lll,
                        'player_turn':coc.player_turn,
                        "start_time": start_time.isoformat(),
                        "time_limit": tt,
                        "chain":coc.chain
                        
                    }
                )
                    
                return
            
            if command=="compin":
                coc = cores[self.room_group_name]
                if coc.player_turn == False:
                    e = await com(coc)
                    await self.channel_layer.group_send(
                            self.room_group_name,
                            e
                        )
                    if e['message']=="no_word":
                        return
                    lll = coc.st_letter if coc.st_letter==coc.sust_letter else f'{coc.st_letter}({coc.sust_letter})'
                    start_time = datetime.now(timezone.utc)
                    tt = coc.turn_time
                    end_time = start_time + timedelta(seconds=tt)
                    self.ptinfo = {
                        'st':start_time,
                        'et':end_time
                    }
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type':'pturn_start',
                            'letter': lll,
                            'player_turn': coc.player_turn,
                            "start_time": start_time.isoformat(),
                            "time_limit": tt, 
                        }
                    )
            if command=="turn_timeout":
                pw = False if cores[self.room_group_name].player_turn else True
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type':'game_end',
                        'winner':pw
                    }
                )
                return
            


        except Exception as e:
            logger.error(e)
            self.send("unexpected error")
        
    async def game_start(self,e):
        await self.send(json.dumps(e))

    async def turn_over(self,e):
        await self.send(json.dumps(e))

    async def pturn_no(self,e):
        await self.send(json.dumps(e))

    async def pturn_yes(self,e):
        await self.send(json.dumps(e))

    async def cturn_no(self,e):
        await self.send(json.dumps(e))
    
    async def cturn_yes(self,e):
        await self.send(json.dumps(e))

    async def pturn_start(self,e):
        await self.send(json.dumps(e))

    async def game_end(self,e):
        await self.send(json.dumps(e))


rid=1
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
                e+=str(l)+'\n'
            logger.error(errorm)
            await self.close(1006,reason='server error')
        
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'lobby',
            self.channel_name
        )

    async def receive(self, text_data=None):
        try:
            global rid
            data:dict[str,str] = json.loads(text_data)
            commend:str = data.get('commend','')
            if commend:
                if commend=="room_create":
                    if 'name' not in data or 'setting' not in data:
                        await self.send(text_data=json.dumps({
                            'error': 'Commend is required.'
                        }))
                        return
                    await self.send(text_data=json.dumps({
                            'type': 'room_create_me',
                            'number': rid,
                            'setting': data['setting'],
                            'name': data['name'] ,
                        }))
                    await self.channel_layer.group_send(
                        'lobby',
                            {
                                'type': 'room_create',
                                'name': data['name'] ,
                                'number': rid,
                                'setting': data['setting']
                            }
                    )
                    rid+=1
                elif commend=="room_delete":
                    if 'name' not in data or 'number' not in data:
                        await self.send(text_data=json.dumps({
                            'error': 'Commend is required.'
                        }))
                        return
                    await self.channel_layer.group_send(
                    'lobby',
                        {
                            'type': 'room_delete',
                            'name': data['name'] ,
                            'number': data['number'],
                        }
                    )
                elif commend=="chat":
                    if 'message' not in data or 'name' not in data:
                        await self.send(text_data=json.dumps({
                            'error': 'Message is required.'
                        }))
                        return
                    else:
                        await self.channel_layer.group_send(
                    'lobby',
                        {
                            'type': 'chat',
                            'name': data['name'] ,
                            'message': data['message'],
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
                e+=str(l)+'\n'
            logger.error(errorm)
            await self.send('server error')

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
        room_number = e['number']

        await self.send(json.dumps({
            'message_type':'room_delete',
            'room_name': room_name,
            'room_number':room_number,
        }))

    async def room_setting_change(self,e):
        room_name=e['naame']
        room_number=e['number']
        room_setting=e['setting']

        await self.send(json.dumps({
            'message_type':'room_setting_change',
            'room_name': room_name,
            'room_number':room_number,
            'room_setting':room_setting
        }))

    async def chat(self,e):
        name=e['name']
        message=e['message']
        await self.send(json.dumps({
            'message_type':'chat',
            'name': name,
            'message':message,
        }))


