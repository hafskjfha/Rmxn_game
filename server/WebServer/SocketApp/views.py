from django.shortcuts import render
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import JsonResponse
import json

# Create your views here.
def change_setting(req):
    if req.method == "POST":
        body = json.loads(req.body)
        setting = body.get('setting','')
        if not setting:
            return JsonResponse({'error':'No setting provide'},status=400)
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'lobby',  # 그룹 이름
            {
                'type': 'handle_post_message',  # Consumer 메서드 이름
                'setting': setting,
            }
        )
        return JsonResponse({'status': 'OK','code':200})
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=400)
