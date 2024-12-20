from django.contrib import admin
from .models import Word, Topic, PartOfSpeech, Component, WordTopic, WordPartOfSpeech, WordComponent

# Register your models here.

@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    search_fields = ('word',)
    
admin.site.register(Topic)
admin.site.register(PartOfSpeech)
admin.site.register(Component)
admin.site.register(WordTopic)
admin.site.register(WordPartOfSpeech)
admin.site.register(WordComponent)