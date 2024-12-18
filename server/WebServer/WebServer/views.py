from django.shortcuts import render

def frontend(request):
    # React의 index.html을 렌더링
    return render(request, 'frontend/index.html')
