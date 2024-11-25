from hangul_system import duem
import re,sys,os,random,logging
from DBapp.models import Product

logger = logging.getLogger('common')

__all__ = ['Game','ComHandler']
current_dir = os.path.dirname(__file__)

class Game:
    def __init__(self) -> None:
        start_letter_file = os.path.join(current_dir, '../Data/start_letters.txt')
        with open(start_letter_file,'r',encoding='utf-8') as f:
            self.start_letters = f.read().split()
        logger.info('Game class init')
    
    def check_word_in_db(self,cword:str)->str:
        """
        단어가 사전에 있는 단어인지 검사하는 함수

        Arguments:
            cword: 검사할 단어

        Return:
            사전에 있는가?
            True : 3y
            False : 3x
        """
        try:
            if Product.objects.filter(word=cword).exists():
                return '3y'
            else:
                return '3x'
        except Exception as e:
            logger.error(f'unexcept error: word:{cword}, error name:{e}')
            return '3x'
        
    def check_word_len(self,word:str)->str:
        """
        한글자인지 확인 하는 함수

        Arguments:
            word: 검사할 단어

        Return :
            1글자 인가?
            True: 5x
            False : 5y
        """
        try:
            if len(word)>1:
                return '5y'
            else:
                return '5x'
        except Exception as e:
            logger.error(f'unexcept error: word:{word} error name:{e}')
            return '5x'
    
    
class ComHandler:
    def __init__(self) -> None:
        with open("",'r',encoding='utf-8') as f:
            self.com_word_db = f.read().split()
    


