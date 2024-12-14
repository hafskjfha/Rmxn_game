import sqlite3
import os
import django
from tqdm import tqdm
# Django 설정 초기화
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'WebServer.settings')
django.setup()

from DBapp.models import Word, Topic, PartOfSpeech, Component, WordTopic, WordPartOfSpeech, WordComponent

# SQLite 연결
sqlite_conn = sqlite3.connect('/workspaces/Rmxn_game/server/WebServer/Data/word_gmaeDB.db')
cursor = sqlite_conn.cursor()

# 데이터 가져오기 및 삽입
def migrate_data():
    # Words 테이블 데이터 삽입
    cursor.execute("SELECT id, word, meaning FROM words")
    words = cursor.fetchall()
    for word_id, word, meaning in tqdm(words):
        word_obj, _ = Word.objects.get_or_create(word=word, meaning=meaning)

        # Word-Topic 연결
        cursor.execute("""
        SELECT topic_id FROM word_topics WHERE word_id = ?
        """, (word_id,))
        topic_ids = cursor.fetchall()
        for (topic_id,) in topic_ids:
            cursor.execute("SELECT name FROM topics WHERE id = ?", (topic_id,))
            topic_name = cursor.fetchone()[0]
            topic_obj, _ = Topic.objects.get_or_create(name=topic_name)
            WordTopic.objects.get_or_create(word=word_obj, topic=topic_obj)

        # Word-PartOfSpeech 연결
        cursor.execute("""
        SELECT pos_id FROM word_parts_of_speech WHERE word_id = ?
        """, (word_id,))
        pos_ids = cursor.fetchall()
        for (pos_id,) in pos_ids:
            cursor.execute("SELECT name FROM parts_of_speech WHERE id = ?", (pos_id,))
            pos_name = cursor.fetchone()[0]
            pos_obj, _ = PartOfSpeech.objects.get_or_create(name=pos_name)
            WordPartOfSpeech.objects.get_or_create(word=word_obj, part_of_speech=pos_obj)

        # Word-Component 연결
        cursor.execute("""
        SELECT component_id FROM word_components WHERE word_id = ?
        """, (word_id,))
        component_ids = cursor.fetchall()
        for (component_id,) in component_ids:
            cursor.execute("SELECT name FROM components WHERE id = ?", (component_id,))
            component_name = cursor.fetchone()[0]
            component_obj, _ = Component.objects.get_or_create(name=component_name)
            WordComponent.objects.get_or_create(word=word_obj, component=component_obj)

    print("Data migration completed!")

# 데이터 마이그레이션 실행
migrate_data()

# SQLite 연결 닫기
sqlite_conn.close()
