import redis,dotenv,os
dotenv.load_dotenv()

USER_WINS_KEY = "user_wins"
COMPUTER_WINS_KEY = "computer_wins"

class redis_clinet_manager:
    def __init__(self)->None:
        self.redis_client = redis.from_url(os.getenv('redis_setting'))
        self.redis_client.set(USER_WINS_KEY, 0)
        self.redis_client.set(COMPUTER_WINS_KEY, 0)
    
    def create_new_room(self):
        max_room_key = "croom:max_number"
        max_room_number = self.redis_client.get(max_room_key)
        
        if max_room_number is None:  # 최대 방 번호 초기화
            max_room_number = 0
        else:
            max_room_number = int(max_room_number)
        
        # 새로운 방 번호 할당
        new_room_number = max_room_number + 1
        new_room = f"croom:{new_room_number}"
        
        # 새로운 방 생성 및 최대 방 번호 갱신
        self.redis_client.hset(new_room, "user_count", 0)
        self.redis_client.set(max_room_key, new_room_number)
        
        return new_room.replace(':',".")

    # 빈 방 찾기 또는 새 방 생성
    def find_or_create_room(self):
        rooms = self.redis_client.scan_iter(match="croom:*")
        for room in rooms:
            if room.decode("utf-8") != "croom:max_number" and self.redis_client.hget(room, "user_count") == b"0":
                return room.decode("utf-8").replace(":",'.')
        # 빈 방이 없으면 새 방 생성
        return self.create_new_room()    
    
    def update_score(self,uw:bool)->None:
        if uw:
            self.redis_client.incr(USER_WINS_KEY)
        else:
            self.redis_client.incr(COMPUTER_WINS_KEY)
    
    def get_scores(self)->tuple[int,int]:
        user_wins = int(self.redis_client.get(USER_WINS_KEY) or 0)
        computer_wins = int(self.redis_client.get(COMPUTER_WINS_KEY) or 0)
        return user_wins, computer_wins
