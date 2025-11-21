from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/dashboard/(?P<dashboard_id>\w+)/$', consumers.DashboardConsumer.as_asgi()),
    re_path(r'ws/metrics/$', consumers.MetricsConsumer.as_asgi()),
]
