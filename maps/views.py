import requests
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render

from maps.constants import TOMTOM_API_URL, API_OPEN_METEO_URL


@login_required
def render_map(request):
    return render(request, 'maps/index.html')


def fetch_traffic_flow(request, start, destination):
    api_url = TOMTOM_API_URL.format(API_KEY=settings.TOMTOM_MAP_APIKEY, START=start, DESTINATION=destination)
    response = requests.get(api_url)
    if response.status_code != 200:
        return JsonResponse({'status': 'Failed to fetch route, please check your daily TOMTOM api usage.'})
    json_result = response.json()

    # try:
    #     weather_url = API_OPEN_METEO_URL.format(LAT=lat, LONG=long)
    #     weather_response = requests.get(weather_url)
    #     weather_json_result = weather_response.json()
    # except Exception:
    #     weather_json_result = {
    #         'current_weather': {
    #             'weathercode': 0
    #         }
    #     }
    # 'weather_code': weather_json_result['current_weather']['weathercode']
    data = json_result['routes'][0]['legs'][0]['points']
    sections = json_result['routes'][0]['sections']
    details = json_result['routes'][0]['summary']
    return JsonResponse({'status': 'ok',
                         'points': data,
                         'sections': sections,
                         'details': details})


def about_page(request):
    return render(request, 'maps/about.html')