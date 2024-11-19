import redis

class RedisClient:
    def __init__(self) -> None:
        self.redis_client = redis.StrictRedis(host="127.0.0.1", port=6379, db=0)

    def Rmxn_game(self,room_id:str,**kwargs):
        s=kwargs.get('com','')
        if s=="game_start":
            self.redis_client.delete(f"set:game_room_{room_id}")
            self.redis_client.sadd(f"set:game_room_{room_id}")
            return True
        elif s=="game_in":
            status = self.game_in(kwargs)
            if status['code']==400:
                return False
            
            
    def game_in(self,typez:dict[str,str])->dict[str,str]:
        t=typez.get('typez','')
        word=typez.get('word','')
        if not word:
            return {"code":400,"message":"no word"}
        if t=="in_word":
            pass
        elif t=="exist_word":
            pass


