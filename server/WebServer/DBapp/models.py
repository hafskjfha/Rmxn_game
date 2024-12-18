from django.db import models

    
class Word(models.Model):
    word = models.CharField(max_length=255, unique=True, db_index=True)
    meaning = models.TextField()

    def __str__(self):
        return self.word


class Topic(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class PartOfSpeech(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Component(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class WordTopic(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('word', 'topic')


class WordPartOfSpeech(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    part_of_speech = models.ForeignKey(PartOfSpeech, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('word', 'part_of_speech')


class WordComponent(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    component = models.ForeignKey(Component, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('word', 'component')