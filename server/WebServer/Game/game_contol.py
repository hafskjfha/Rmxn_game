from .hangul_system import duem
import re,sys,os,random,logging
from DBapp.models import Word
from django.shortcuts import get_object_or_404


logger = logging.getLogger('common')

__all__ = ['Game','ComHandler']
current_dir = os.path.dirname(__file__)

class Game:
    def __init__(self) -> None:
        start_letter_file = os.path.join(current_dir, '../Data/start_letters.txt')
        with open(start_letter_file,'r',encoding='utf-8') as f:
            self.start_letters = f.read().split()
        not_onecut_letter_file = os.path.join(current_dir, '../Data/not_onecut_letter.txt')
        with open(not_onecut_letter_file,'r',encoding='utf-8') as f:
            self.not_onecut=f.read().split()
        logger.info('Game class init')
    
    async def check_word_in_db(self,cword:str)->str:
        """
        단어가 사전에 있는 단어인지 검사하는 함수

        Arguments:
            cword: 검사할 단어

        Return:
            사전에 있는가?
            True : 뜻
            False : 3x
        """
        try:
            m = await self.check_db(cword)
            if (n:=m.get('meaning',False)):
                return n 
            else:
                return '3x'
        except Exception as e:
            logger.error(f'unexcept error: word:{cword}, error name:{e}')
            return '3x'
        
    async def check_db(self,cword:str)->dict[str,str]:
        """
        주어진 단어를 비동기적으로 조회하여 뜻을 반환합니다.
        
        Arguments:
            word : 검색할 단어

        Return:
            있음: {word:단어, meaning:뜻}
            없음: {error:404}
        """
        try:
            word = await Word.objects.aget(word=cword)
            return {'word': word.word, 'meaning': word.meaning}
        except Word.DoesNotExist:
            return {'error': '404'}

    def check_start_kill(self,chin:int,word:str):
        """
        시작 한방 인지 확인하는 함수

        Arguments:
            word : 시작한방인지 검사할 단어

        Return:
            str(bool)
            시작한방 아님: 6y
            시작한방 맞음: 6x
        """
        if chin>1:
            return "6y"

        sub=duem(word[-1])
        if sub not in self.not_onecut or word[-1] not in self.not_onecut:
            return "6y"
        return "6x"
    
    def start_word_rand(self)->str:
        """
        시작 단어 추출함수

        Return :
            str : 시작 글자
        """
        pattern = re.compile("[^ㄱ-ㅎㅏ-ㅣ가-힣]+")
        valid_words:list[str] = [word for word in self.start_letters if not pattern.search(word)]
        if valid_words:
            return random.choice(valid_words)
        else:
            return ValueError("시작 단어가 없습니다.")


    

class CommonGameHander:
    def __init__(self) -> None:
        self.used:set[str] = set()
        self.chain:int = 0
        self.core = Game()
        self.player_turn:bool = False

    def reset(self)->None:
        """게임 다시 시작하기전 초기화"""
        self.used=set()
        self.chain=0

    async def check_word(self,word:str) -> tuple[bool,str]:
        """사용자가 입력한 단어를 검증하는 함수
        
        Arguments:
            word:str => 검증할 단어

        Return:
            bool,str => (가능 여부,(단어 뜻 or 이유))
        """
        if len(word.strip())<2 or word[0] not in (self.st_letter,self.sust_letter):
            return (False,'시작 단어와 맞지 않음')
        
        if self.core.check_start_kill(self.chain,word)=="6x":
            return (False,'시작 한방 금지')
        
        if word in self.used:
            return (False,'이미 사용된 단어')
        
        mean = await self.core.check_word_in_db(word)
        if mean=='3x':
            return (False,'사전에 없는 단어')
        
        self.update(word)
        return (True,mean)

    def update(self,word:str) -> None:
        """게임 진행 상태 업데이트"""
        self.used.add(word)
        self.chain+=1
        self.st_letter = word[-1]
        self.sust_letter = duem(self.st_letter)

    
    def start(self)->str:
        """게임 시작을 처리 하는 함수"""
        self.reset()
        self.st_letter:str = self.core.start_word_rand() #시작 글자
        self.sust_letter:str = duem(self.st_letter) #(두음)된 시작글자
        self.player_turn = True if random.randint(0,1) else False #플레이어턴 랜덤 선택
        return f'{self.st_letter}' if self.st_letter==self.sust_letter else f'{self.st_letter}({self.sust_letter})'
        

class ComputerGameHander(CommonGameHander):
    def __init__(self):
        super().__init__()
        com_word_file =os.path.join(current_dir, '.\\computer_db.txt')
        with open(com_word_file,encoding='utf8') as f:
            self.comdb = f.read().split()

    def com_select_word(self)->tuple[bool,str]:
        """
        컴퓨터가 단어를 선택하는 함수

        Retrun:
            tuple[bool,str] => 단어 성공 여부, 선택된 단어
        """
        sel_words=[word for word in self.comdb if word[0] in (self.st_letter,self.sust_letter) and word not in self.used]
        if not sel_words:
            return (False,'ㅠㅠ')
        
        if self.chain>3:
            necut=[word for word in sel_words if word[-1] not in self.core.not_onecut]
            if necut:
                return (True,random.choice(necut))
        return (True,random.choice(sel_words))
    
    async def main(self,command:dict[str,str])->tuple[bool,str,None|str]:
        """게임 메인 컨트롤러 함수"""
        if 'start' in command:
            sss = self.start()
            self.turn_time:float = 10.0 #game timer start logic
            return self.player_turn,sss, # 시작 턴, 시작 단어
        
        if 'input' in command:
            #after timer check===
            if not self.player_turn:
                return False,''
            word=command.get('input')
            c,s = await self.check_word(word)
            if not c:
                return c,s
            
            self.player_turn = not self.player_turn
            self.turn_time = max(self.turn_time-0.1,0.4)
            return c,s
        
        if 'computer' in command:
            if not self.player_turn:
                c,s = self.com_select_word()
                if not c:
                    return False,s
                b,n = await self.check_word(s)
                if b:
                    self.player_turn = not self.player_turn
                    self.turn_time = max(self.turn_time-0.1,0.4)
                    self.update(s)
                    return b,s,n
                else:
                    return False,'ㅠㅠ',''
            return False,''
        
            

            

        


    


